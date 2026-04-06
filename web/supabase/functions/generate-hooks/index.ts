// Supabase Edge Function: Generate 12 Hooks + Auto-Score (6 dimensions)
// Model: gemini-3.1-pro-preview
// Env vars needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!geminiKey) return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);

  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    const { slot_id } = await req.json();
    if (!slot_id) return jsonResponse({ error: "slot_id required" }, 400);

    // Load context
    const { data: slot } = await sb.from("slots").select("*, campaign:campaigns(*, project:projects(*))").eq("id", slot_id).single();
    if (!slot) return jsonResponse({ error: "Slot not found" }, 404);

    const { data: brief } = await sb.from("briefs").select("*").eq("slot_id", slot_id).order("version", { ascending: false }).limit(1).single();

    const campaign = slot.campaign;
    const project = campaign?.project;
    const briefData = brief?.brief_yaml || {};
    const brandData = project?.brand_yaml || {};
    const voiceData = project?.voice_yaml || {};
    const platform = campaign?.platform || "instagram";

    const prompt = buildPrompt(briefData, brandData, voiceData, slot, platform);

    // Call Gemini
    const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return jsonResponse({ error: "Gemini API error", details: errText.slice(0, 500) }, 502);
    }

    const geminiData = await geminiRes.json();
    const allParts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const textPart = allParts.find((p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature);
    const rawText = textPart?.text || allParts[allParts.length - 1]?.text || null;

    if (!rawText) return jsonResponse({ error: "Empty response" }, 502);

    let parsed: { hooks: Array<Record<string, unknown>> };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1].trim());
      else return jsonResponse({ error: "Failed to parse JSON", raw: rawText.slice(0, 500) }, 502);
    }

    if (!parsed.hooks || !Array.isArray(parsed.hooks)) {
      return jsonResponse({ error: "No hooks array in response" }, 502);
    }

    // Calculate totals and sort by score
    const hooks = parsed.hooks.map((h, i) => {
      const scores = (h.scores || {}) as Record<string, number>;
      const total = Object.values(scores).reduce((sum: number, v: number) => sum + (v || 0), 0);
      return { ...h, id: i + 1, total };
    }).sort((a, b) => (b.total as number) - (a.total as number));

    const tokensUsed = geminiData?.usageMetadata?.totalTokenCount ?? null;

    // Log
    await sb.from("generation_logs").insert({
      slot_id,
      step: "generate-hooks",
      input_json: { slot_id, format: slot.format, platform },
      output_json: { hooks_count: hooks.length },
      model_used: "gemini-3.1-pro-preview",
      tokens_used: tokensUsed,
    });

    return jsonResponse({ hooks, tokens_used: tokensUsed });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});

function buildPrompt(
  brief: Record<string, unknown>,
  brand: Record<string, unknown>,
  voice: Record<string, unknown>,
  slot: Record<string, unknown>,
  platform: string
): string {
  const format = (brief.format || slot.format || "reel") as string;

  return `Eres un experto en hooks virales para redes sociales. Tu trabajo: generar 12 hooks DIFERENTES para un contenido, y auto-evaluarlos con 6 dimensiones de calidad.

═══════════════════════════════════
CONTEXTO
═══════════════════════════════════

**Marca:** ${JSON.stringify(brand)}
**Voz:** ${JSON.stringify(voice)}
**Plataforma:** ${platform}
**Formato:** ${format}

**Brief del contenido:**
- Tema: ${brief.topic || slot.topic || "Sin tema"}
- Angulo: ${brief.topic_angle || "Libre"}
- Pilar: ${brief.pillar || slot.pillar || "General"}
- Objetivo: ${brief.objective || slot.objective || "Engagement"}
- Intencion: ${brief.intention || slot.intention || "quality"}
- Persona target: ${brief.persona_target || "General"}
- Direccion del hook: ${brief.hook_direction || "Libre"}

═══════════════════════════════════
FORMULAS DE REFERENCIA (${format} / ${platform})
═══════════════════════════════════

Usa estas como INSPIRACION, no copies literal:

**Curiosidad:** "Probe [X] por [Y] tiempo y esto paso", "Nadie te dice esto sobre [tema]"
**Urgencia:** "Si haces [error comun], mira esto", "No cometas este error con [tema]"
**Empatia:** "POV: cuando descubres que [insight]", "Reminder: [verdad reconfortante]"
**Sorpresa:** "La verdad sobre [mito popular]", "[Dato estadistico sorprendente]"
**Autoridad:** "[N] cosas que aprendi sobre [tema]", "La guia completa de [tema]"
**FOMO:** "Solo hoy: [exclusivo]", "Antes vs despues de [accion]"

═══════════════════════════════════
TU TAREA
═══════════════════════════════════

Genera EXACTAMENTE 12 hooks con esta distribucion:
- 4 hooks de tono EMOCIONAL (storytelling, empatia, conexion personal)
- 4 hooks de tono EDUCATIVO (datos, autoridad, tips practicos)
- 4 hooks de tono DIRECTO (urgencia, CTA, conversion, FOMO)

Cada hook debe:
- Ser una sola oracion potente (max 15 palabras)
- Estar adaptado al formato ${format} y plataforma ${platform}
- Ser DIFERENTE a los demas (no variaciones del mismo concepto)
- Respetar la voz de marca

═══════════════════════════════════
SISTEMA DE SCORING (6 dimensiones, 1-10)
═══════════════════════════════════

Evalua CADA hook con:

1. **hook_strength** (1-10): ¿Detiene el scroll en 1.5 segundos? ¿Es imposible de ignorar?
2. **emotional_resonance** (1-10): ¿Conecta emocionalmente con la persona target? ¿Genera identificacion?
3. **cta_potential** (1-10): ¿Abre camino natural a un CTA? ¿El usuario querra actuar despues?
4. **value_promise** (1-10): ¿Promete valor claro? ¿El usuario espera recibir algo util?
5. **scroll_stop** (1-10): ¿Visualmente/textualmente es diferente al feed? ¿Rompe el patron?
6. **brand_fit** (1-10): ¿Se alinea con la voz, tono y valores de la marca?

Se HONESTO en los scores. No todos deben ser 8+. Un hook mediocre debe tener scores mediocres.

═══════════════════════════════════
FORMATO DE RESPUESTA — JSON estricto
═══════════════════════════════════

{
  "hooks": [
    {
      "id": 1,
      "text": "string — el hook (max 15 palabras)",
      "tone": "emocional | educativo | directo",
      "scores": {
        "hook_strength": 8,
        "emotional_resonance": 7,
        "cta_potential": 6,
        "value_promise": 8,
        "scroll_stop": 9,
        "brand_fit": 7
      },
      "total": 45,
      "reasoning": "string — por que este hook funciona o no (1 oracion)"
    }
  ]
}

REGLAS:
- Escribe todo en espanol.
- 12 hooks exactos (4 emocional + 4 educativo + 4 directo).
- Se critico y honesto en los scores.
- El campo reasoning debe explicar la fortaleza o debilidad principal.
- Devuelve SOLO el JSON.`.trim();
}
