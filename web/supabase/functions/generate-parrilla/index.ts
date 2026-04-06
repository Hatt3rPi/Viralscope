// Supabase Edge Function: Generate Parrilla — strategic content calendar
// Deploy: supabase functions deploy generate-parrilla
// Env vars needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent";

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Validate input ──────────────────────────────────────────────────
    const { project_id, campaign_config, collected_answers } =
      await req.json();

    if (!project_id || !campaign_config || !collected_answers) {
      return errorResponse(
        "project_id, campaign_config, and collected_answers are required",
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

    // ── Fetch project ───────────────────────────────────────────────────
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .select(
        "name, brand_yaml, voice_yaml, audiences_yaml, pillars_yaml, competitors_yaml, calendar_yaml, platforms_yaml, metrics_yaml"
      )
      .eq("id", project_id)
      .single();

    if (projectErr || !project) {
      return errorResponse("Project not found", 404, projectErr);
    }

    // ── Build prompt ────────────────────────────────────────────────────
    const prompt = buildParrillaPrompt(
      project,
      campaign_config,
      collected_answers
    );

    // ── Call Gemini API ─────────────────────────────────────────────────
    const geminiBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 32768,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: "medium" },
      },
    };

    const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const allParts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const textPart = allParts.find((p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature);
    const rawText = textPart?.text || allParts[allParts.length - 1]?.text || null;

    if (!rawText) {
      return errorResponse("Empty response from Gemini", 502, geminiData);
    }

    // ── Parse JSON response ─────────────────────────────────────────────
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1].trim());
      } else {
        return errorResponse("Failed to parse Gemini response", 502, {
          raw: rawText,
        });
      }
    }

    // ── Validate parrilla structure ─────────────────────────────────────
    const parrilla = parsed.parrilla as Array<Record<string, unknown>>;
    if (!Array.isArray(parrilla) || parrilla.length === 0) {
      return errorResponse("Gemini returned empty or invalid parrilla", 502, {
        parsed,
      });
    }

    // Ensure slot_number is sequential
    const sortedParrilla = parrilla
      .sort(
        (a, b) =>
          new Date(a.date as string).getTime() -
          new Date(b.date as string).getTime()
      )
      .map((slot, idx) => ({
        ...slot,
        slot_number: idx + 1,
      }));

    const tokensUsed =
      geminiData?.usageMetadata?.totalTokenCount ?? null;

    return jsonResponse({
      summary: (parsed.summary as string) || "",
      parrilla: sortedParrilla,
      tokens_used: tokensUsed,
    });
  } catch (err) {
    console.error("generate-parrilla unhandled error:", err);
    return errorResponse("Internal error", 500, String(err));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────
function buildParrillaPrompt(
  project: Record<string, unknown>,
  campaignConfig: Record<string, unknown>,
  collectedAnswers: Record<string, unknown>
): string {
  const brandContext = JSON.stringify(project.brand_yaml, null, 2);
  const voiceContext = JSON.stringify(project.voice_yaml, null, 2);
  const audiencesContext = JSON.stringify(project.audiences_yaml, null, 2);
  const pillarsContext = JSON.stringify(project.pillars_yaml, null, 2);
  const competitorsContext = JSON.stringify(project.competitors_yaml, null, 2);
  const calendarContext = JSON.stringify(project.calendar_yaml, null, 2);
  const platformsContext = JSON.stringify(project.platforms_yaml, null, 2);
  const metricsContext = JSON.stringify(project.metrics_yaml, null, 2);

  const answersContext = JSON.stringify(collectedAnswers, null, 2);

  // Calculate number of days in the period
  const start = new Date(campaignConfig.period_start as string);
  const end = new Date(campaignConfig.period_end as string);
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const numContents =
    (collectedAnswers.num_contents as number) ||
    Math.max(1, Math.round(totalDays));

  return `Eres el ESTRATEGA, un agente experto en planificación estratégica de contenido social.
Tu misión es diseñar una PARRILLA EDITORIAL COMPLETA — un calendario de ${numContents} contenidos distribuidos estratégicamente en el período.

IMPORTANTE: Cada slot debe tener un propósito claro y diferenciado. No rellenes con contenido genérico.
Debes ser transparente: si hay tensiones entre objetivos o datos insuficientes, decláralo.

═══════════════════════════════════════
CONTEXTO DE MARCA: ${project.name}
═══════════════════════════════════════

## Marca
${brandContext}

## Voz y tono
${voiceContext}

## Audiencias (personas)
${audiencesContext}

## Pilares de contenido (con pesos)
${pillarsContext}

## Competidores
${competitorsContext}

## Calendario / fechas relevantes
${calendarContext}

## Plataformas
${platformsContext}

## Métricas objetivo
${metricsContext}

═══════════════════════════════════════
CAMPAÑA
═══════════════════════════════════════
- Nombre: ${campaignConfig.name}
- Plataforma: ${campaignConfig.platform}
- Período: ${campaignConfig.period_start} a ${campaignConfig.period_end} (${totalDays} días)

═══════════════════════════════════════
RESPUESTAS DEL USUARIO (recopiladas en entrevista)
═══════════════════════════════════════
${answersContext}

═══════════════════════════════════════
INSTRUCCIONES DE DISEÑO
═══════════════════════════════════════

Diseña una parrilla de exactamente ${numContents} slots siguiendo estas reglas:

1. **DISTRIBUCIÓN POR PILARES**: Respeta los pesos de pillars_yaml. Si pillars dice "neurociencia: 0.25", ~25% de los slots deben ser de ese pilar.
   Puedes ajustar ±5% si la estrategia lo justifica, pero explica por qué.

2. **FECHAS COMO ANCLAS**: Revisa calendar_yaml y las key_dates del usuario. Las fechas importantes NO son solo un slot especial — son anclas alrededor de las cuales construyes una mini-campaña (contenido de anticipación, el día, y seguimiento).

3. **MIX DE INTENCIÓN**: Respeta el intention_mix del usuario.
   - "viral" = contenido diseñado para máximo alcance y compartidos
   - "quality" = contenido que construye autoridad y confianza
   - "commercial" = contenido orientado a conversión/ventas

4. **FORMATOS**: Distribuye según format_preferences del usuario. Varía para no saturar un solo formato.

5. **PERSONAS TARGET**: Alterna entre las audiencias prioritarias. No repitas la misma persona 3 veces seguidas.

6. **TEMAS**: Incluye topics_include y evita topics_exclude. Cada tema debe ser ESPECÍFICO, no genérico.

7. **ÁNGULO DIFERENCIADOR**: Cada slot necesita un topic_angle único. Dos slots del mismo pilar deben tener ángulos diferentes.

8. **HOOKS Y CTAS**: Define direcciones creativas para el hook y CTA de cada slot. Estos son direcciones estratégicas, no el copy final.

9. **DISTRIBUCIÓN TEMPORAL**: Distribuye los contenidos de forma inteligente en el período.
   - No publiques 5 posts el mismo día.
   - Considera los mejores días/horas según platforms_yaml.
   - Deja espacio entre contenidos del mismo pilar.

10. **TRANSPARENCIA**: Para cada slot, incluye reasoning (por qué esta combinación), confidence (alta/media/baja), tensions y uncertainties.

FORMATO DE RESPUESTA — JSON estricto:

{
  "summary": "string — resumen ejecutivo de la estrategia en 3-5 oraciones. Incluye: distribución por pilar, mix de intención, fechas ancla identificadas, y cualquier tensión global.",
  "parrilla": [
    {
      "slot_number": 1,
      "date": "YYYY-MM-DD",
      "format": "reel | carrusel | story | static | video",
      "pillar": "string — pilar de contenido",
      "objective": "string — awareness | engagement | conversion | retention",
      "intention": "string — viral | quality | commercial",
      "topic": "string — tema específico y concreto",
      "topic_angle": "string — ángulo diferenciador, la perspectiva única",
      "hook_direction": "string — dirección creativa del hook (cómo captar atención)",
      "cta_direction": "string — dirección del call to action",
      "persona_target": "string — nombre de la persona target principal",
      "reasoning": "string — explicación de por qué este slot tiene esta configuración",
      "confidence": "alta | media | baja",
      "tensions": ["string — tensiones detectadas"],
      "uncertainties": ["string — incertidumbres o datos faltantes"],
      "date_reference": "string | null — referencia a fecha del calendario si aplica"
    }
  ]
}

REGLAS FINALES:
- Genera EXACTAMENTE ${numContents} slots.
- Escribe TODO en español.
- Los slots deben estar ordenados por fecha ascendente.
- Cada slot DEBE tener todos los campos del schema (no omitas ninguno).
- El summary es un resumen ejecutivo para el humano — conciso y estratégico.
- Devuelve SOLO el JSON, sin texto adicional.`;
}
