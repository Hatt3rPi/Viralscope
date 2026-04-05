// Supabase Edge Function: Generate Brief via Gemini (Estratega agent)
// Deploy: supabase functions deploy generate-brief
// Env vars needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function errorResponse(message: string, status: number, details?: unknown) {
  return jsonResponse({ error: message, details: details ?? null }, status);
}

Deno.serve(async (req: Request) => {
  // ── CORS preflight ──────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Validate input ──────────────────────────────────────────────────
    const { project_id, campaign_id, slot_id } = await req.json();

    if (!project_id || !campaign_id || !slot_id) {
      return errorResponse(
        "project_id, campaign_id, and slot_id are required",
        400
      );
    }

    // ── Validate env vars ───────────────────────────────────────────────
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return errorResponse("GEMINI_API_KEY not configured", 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Fetch project (brand context) ───────────────────────────────────
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select(
        "brand_yaml, voice_yaml, audiences_yaml, pillars_yaml, calendar_yaml, platforms_yaml, metrics_yaml"
      )
      .eq("id", project_id)
      .single();

    if (projectErr || !project) {
      return errorResponse("Project not found", 404, projectErr);
    }

    // ── Fetch campaign ──────────────────────────────────────────────────
    const { data: campaign, error: campaignErr } = await supabase
      .from("campaigns")
      .select("name, platform, period_start, period_end, objectives_json")
      .eq("id", campaign_id)
      .single();

    if (campaignErr || !campaign) {
      return errorResponse("Campaign not found", 404, campaignErr);
    }

    // ── Fetch slot ──────────────────────────────────────────────────────
    const { data: slot, error: slotErr } = await supabase
      .from("slots")
      .select("date, format, pillar, objective, intention, topic, slot_number")
      .eq("id", slot_id)
      .single();

    if (slotErr || !slot) {
      return errorResponse("Slot not found", 404, slotErr);
    }

    // ── Build prompt ────────────────────────────────────────────────────
    const prompt = buildPrompt(project, campaign, slot);

    // ── Call Gemini API ─────────────────────────────────────────────────
    const geminiBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey,
      },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return errorResponse("Gemini API error", 502, {
        status: geminiRes.status,
        body: errText,
      });
    }

    const geminiData = await geminiRes.json();

    // ── Parse Gemini response ───────────────────────────────────────────
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!rawText) {
      return errorResponse("Empty response from Gemini", 502, geminiData);
    }

    let briefYaml: Record<string, unknown>;
    try {
      briefYaml = JSON.parse(rawText);
    } catch {
      // Gemini sometimes wraps JSON in markdown fences — try to extract
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        briefYaml = JSON.parse(match[1].trim());
      } else {
        return errorResponse("Failed to parse Gemini response as JSON", 502, {
          raw: rawText,
        });
      }
    }

    // ── Determine next version ──────────────────────────────────────────
    const { data: existingBriefs } = await supabase
      .from("briefs")
      .select("version")
      .eq("slot_id", slot_id)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion =
      existingBriefs && existingBriefs.length > 0
        ? existingBriefs[0].version + 1
        : 1;

    // ── Save brief to DB ────────────────────────────────────────────────
    const { data: savedBrief, error: briefInsertErr } = await supabase
      .from("briefs")
      .insert({
        slot_id,
        brief_yaml: briefYaml,
        version: nextVersion,
      })
      .select()
      .single();

    if (briefInsertErr) {
      return errorResponse("Failed to save brief", 500, briefInsertErr);
    }

    // ── Update slot status → brief_review ───────────────────────────────
    const { error: slotUpdateErr } = await supabase
      .from("slots")
      .update({ status: "brief_review" })
      .eq("id", slot_id);

    if (slotUpdateErr) {
      console.error("Failed to update slot status:", slotUpdateErr);
      // Non-fatal — brief was saved, continue
    }

    // ── Log generation ──────────────────────────────────────────────────
    const tokensUsed =
      geminiData?.usageMetadata?.totalTokenCount ??
      geminiData?.usageMetadata?.candidatesTokenCount ??
      null;

    const { error: logErr } = await supabase
      .from("generation_logs")
      .insert({
        slot_id,
        step: "1-brief",
        input_json: { project_id, campaign_id, slot_id, prompt_length: prompt.length },
        output_json: briefYaml,
        model_used: "gemini-2.5-flash",
        tokens_used: tokensUsed,
      });

    if (logErr) {
      console.error("Failed to write generation log:", logErr);
      // Non-fatal
    }

    // ── Return result ───────────────────────────────────────────────────
    return jsonResponse({
      brief: savedBrief,
      version: nextVersion,
      model: "gemini-2.5-flash",
      tokens_used: tokensUsed,
    });
  } catch (err) {
    console.error("generate-brief unhandled error:", err);
    return errorResponse("Internal error", 500, String(err));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(
  project: Record<string, unknown>,
  campaign: Record<string, unknown>,
  slot: Record<string, unknown>
): string {
  const brandContext = JSON.stringify(project.brand_yaml, null, 2);
  const voiceContext = JSON.stringify(project.voice_yaml, null, 2);
  const audiencesContext = JSON.stringify(project.audiences_yaml, null, 2);
  const pillarsContext = JSON.stringify(project.pillars_yaml, null, 2);
  const calendarContext = JSON.stringify(project.calendar_yaml, null, 2);
  const platformsContext = JSON.stringify(project.platforms_yaml, null, 2);
  const metricsContext = JSON.stringify(project.metrics_yaml, null, 2);

  return `Eres el ESTRATEGA, un agente de planificación estratégica de contenido social.
Tu rol es analizar el contexto de marca y los parámetros de un slot del calendario editorial para generar un brief de contenido detallado.

IMPORTANTE: Debes ser transparente en tu razonamiento. No ocultes tensiones ni incertidumbres.
Si hay datos contradictorios o insuficientes, decilo abiertamente. Tu credibilidad depende de la honestidad, no de aparentar certeza.

═══════════════════════════════════════
CONTEXTO DE MARCA
═══════════════════════════════════════

## Marca
${brandContext}

## Voz y tono
${voiceContext}

## Audiencias
${audiencesContext}

## Pilares de contenido
${pillarsContext}

## Calendario / fechas relevantes
${calendarContext}

## Plataformas
${platformsContext}

## Métricas objetivo
${metricsContext}

═══════════════════════════════════════
CAMPAÑA
═══════════════════════════════════════
- Nombre: ${campaign.name}
- Plataforma: ${campaign.platform}
- Período: ${campaign.period_start} a ${campaign.period_end}
- Objetivos: ${JSON.stringify(campaign.objectives_json)}

═══════════════════════════════════════
SLOT A PLANIFICAR
═══════════════════════════════════════
- Número: ${slot.slot_number}
- Fecha de publicación: ${slot.date}
- Formato: ${slot.format}
- Pilar: ${slot.pillar}
- Objetivo: ${slot.objective}
- Intención: ${slot.intention}
- Tema propuesto: ${slot.topic}

═══════════════════════════════════════
INSTRUCCIONES
═══════════════════════════════════════

Genera un brief de contenido que:

1. REFINE el tema propuesto con un ángulo específico y diferenciador.
2. DEFINA la dirección del hook (cómo captar atención en los primeros 3 segundos).
3. DEFINA la dirección del CTA (qué acción queremos que tome el usuario).
4. IDENTIFIQUE la persona target más relevante de las audiencias disponibles.
5. EXPLIQUE tu razonamiento completo — por qué elegiste este ángulo, este hook, este CTA.
6. DETECTE tensiones: conflictos entre lo que pide el objetivo, lo que sería viral, y lo que la voz de marca permite.
7. IDENTIFIQUE incertidumbres: datos que te faltan o suposiciones que estás haciendo.
8. ASIGNE un nivel de confianza (alta/media/baja) basado en cuánto contexto tienes.
9. Si la fecha de publicación coincide con alguna fecha relevante del calendario, mencionalo en date_reference.

Responde con un JSON con exactamente esta estructura:

{
  "topic": "string — tema refinado y específico",
  "topic_angle": "string — ángulo diferenciador, la perspectiva única",
  "format": "string — formato del contenido (reel, carrusel, story, etc.)",
  "platform": "string — plataforma destino",
  "pillar": "string — pilar de contenido",
  "objective": "string — objetivo del slot",
  "intention": "string — intención (viral, quality, commercial)",
  "hook_direction": "string — dirección creativa del hook, cómo captar atención",
  "cta_direction": "string — dirección del call to action",
  "persona_target": "string — nombre de la persona target principal",
  "reasoning": "string — explicación detallada de tu razonamiento estratégico",
  "confidence": "string — alta | media | baja",
  "tensions": ["string — cada tensión detectada entre objetivos, formato, voz, etc."],
  "uncertainties": ["string — cada incertidumbre o dato faltante"],
  "date_reference": "string | null — referencia a fecha relevante si aplica, null si no"
}

REGLAS:
- Escribe todo en español.
- Sé específico, no genérico. Un brief genérico no sirve.
- El hook_direction NO es el hook final, es la dirección creativa para el copywriter.
- El cta_direction NO es el CTA final, es la dirección estratégica.
- En reasoning, explica el POR QUÉ de cada decisión importante.
- tensions debe tener al menos 1 item si la confianza no es "alta".
- uncertainties puede estar vacío solo si tienes datos completos.
- Devuelve SOLO el JSON, sin texto adicional.`;
}
