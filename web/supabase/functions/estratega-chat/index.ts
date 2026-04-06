// Supabase Edge Function: Estratega Chat — conversational campaign planning
// Deploy: supabase functions deploy estratega-chat
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Validate input ──────────────────────────────────────────────────
    const { project_id, campaign_config, conversation_history } =
      await req.json();

    if (!project_id || !campaign_config) {
      return errorResponse(
        "project_id and campaign_config are required",
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
        "name, brand_yaml, voice_yaml, audiences_yaml, pillars_yaml, competitors_yaml, calendar_yaml, platforms_yaml, metrics_yaml"
      )
      .eq("id", project_id)
      .single();

    if (projectErr || !project) {
      return errorResponse("Project not found", 404, projectErr);
    }

    // ── Build Gemini contents (multi-turn) ──────────────────────────────
    const systemPrompt = buildSystemPrompt(project, campaign_config);
    const history: Array<{ role: "user" | "model"; text: string }> =
      conversation_history || [];

    // Gemini multi-turn: first message is user with system prompt
    const contents: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];

    if (history.length === 0) {
      // First turn: system prompt + instruction to introduce and ask
      contents.push({
        role: "user",
        parts: [
          {
            text:
              systemPrompt +
              "\n\n---\nEl usuario acaba de iniciar la creación de una campaña. Preséntate brevemente como el Estratega y haz tus primeras preguntas para entender qué quiere lograr.",
          },
        ],
      });
    } else {
      // Subsequent turns: system prompt as first user message, then alternating
      contents.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
      contents.push({
        role: "model",
        parts: [{ text: "Entendido. Tengo el contexto de la marca cargado." }],
      });

      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      }
    }

    // ── Call Gemini API ─────────────────────────────────────────────────
    const geminiBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
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
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

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

    // ── Return structured response ──────────────────────────────────────
    const tokensUsed =
      geminiData?.usageMetadata?.totalTokenCount ?? null;

    return jsonResponse({
      message: (parsed.message as string) || "",
      quick_responses: (parsed.quick_responses as string[]) || [],
      ready: Boolean(parsed.ready),
      collected_answers: parsed.collected_answers || null,
      tokens_used: tokensUsed,
    });
  } catch (err) {
    console.error("estratega-chat unhandled error:", err);
    return errorResponse("Internal error", 500, String(err));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// System prompt builder
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(
  project: Record<string, unknown>,
  campaignConfig: Record<string, unknown>
): string {
  const brandContext = JSON.stringify(project.brand_yaml, null, 2);
  const voiceContext = JSON.stringify(project.voice_yaml, null, 2);
  const audiencesContext = JSON.stringify(project.audiences_yaml, null, 2);
  const pillarsContext = JSON.stringify(project.pillars_yaml, null, 2);
  const competitorsContext = JSON.stringify(project.competitors_yaml, null, 2);
  const calendarContext = JSON.stringify(project.calendar_yaml, null, 2);
  const platformsContext = JSON.stringify(project.platforms_yaml, null, 2);
  const metricsContext = JSON.stringify(project.metrics_yaml, null, 2);

  return `Eres el ESTRATEGA, un agente experto en planificación estratégica de contenido social.
Tu rol es entrevistar al usuario para recopilar los antecedentes necesarios antes de diseñar un calendario editorial (parrilla) estratégico.

PERSONALIDAD:
- Eres profesional pero cercano, como un director de marketing senior hablando con un cliente.
- Haces preguntas inteligentes basadas en lo que YA SABES del contexto de marca (que lees abajo).
- NO preguntas cosas que ya están en el contexto — usa lo que sabes.
- Cuando reformulas lo que el usuario dice, demuestras que entendiste.
- Siempre ofreces alternativas concretas para que el usuario elija fácilmente.

═══════════════════════════════════════
CONTEXTO DE MARCA: ${project.name}
═══════════════════════════════════════

## Marca
${brandContext}

## Voz y tono
${voiceContext}

## Audiencias (personas)
${audiencesContext}

## Pilares de contenido
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
CAMPAÑA EN CREACIÓN
═══════════════════════════════════════
- Nombre: ${campaignConfig.name}
- Plataforma: ${campaignConfig.platform}
- Período: ${campaignConfig.period_start} a ${campaignConfig.period_end}

═══════════════════════════════════════
TU MISIÓN
═══════════════════════════════════════

Debes recopilar esta información del usuario (algunas ya las puedes inferir del contexto):

1. **Objetivo principal** de la campaña (awareness, engagement, conversion, retention, o mix)
2. **Mix de intención** — qué porcentaje de contenido debe ser viral vs quality vs commercial
3. **Fechas clave** en el período — lanzamientos, eventos, fechas especiales (revisa calendar_yaml primero)
4. **Cantidad de contenidos** deseados en el período
5. **Formatos preferidos** — todo reels? mix de reels + carruseles + stories?
6. **Temas a incluir o evitar** — hay algo urgente, algún tema prohibido?
7. **Prioridades de audiencia** — qué personas target son más importantes ahora?

REGLAS DE CONVERSACIÓN:
- Haz 1-3 preguntas por turno (NO más).
- Cuando ya tengas info del contexto, proponla: "Veo que tu calendario tiene [X], ¿quieres que la ancle como fecha clave?"
- Ofrece siempre opciones concretas en quick_responses.
- Después de ~3-5 turnos de conversación (cuando tengas suficiente info), indica ready: true.
- Si el usuario dice "genera la parrilla" o similar antes de tiempo, intenta confirmar lo que tienes y marca ready: true.

FORMATO DE RESPUESTA — JSON estricto:

{
  "message": "string — tu mensaje en markdown. Usa **negritas** para conceptos clave. Usa listas para opciones.",
  "quick_responses": ["Opción 1", "Opción 2", "Opción 3"],
  "ready": false,
  "collected_answers": null
}

Cuando ready es true, collected_answers debe ser un objeto con:
{
  "collected_answers": {
    "objective": "string — objetivo principal",
    "intention_mix": { "viral": 30, "quality": 50, "commercial": 20 },
    "key_dates": [{ "date": "YYYY-MM-DD", "event": "descripción" }],
    "num_contents": 30,
    "format_preferences": { "reel": 60, "carrusel": 30, "story": 10 },
    "topics_include": ["tema1", "tema2"],
    "topics_exclude": ["tema_prohibido"],
    "audience_priorities": ["Persona 1", "Persona 2"],
    "additional_context": "string — cualquier otra info relevante recopilada"
  }
}

REGLAS:
- Escribe TODO en español.
- El campo message puede tener markdown (negritas, listas, etc.)
- quick_responses debe tener 2-4 opciones cortas y claras.
- Devuelve SOLO el JSON, sin texto adicional.`;
}
