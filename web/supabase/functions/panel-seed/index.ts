// Supabase Edge Function: Seed Panel Agents from audiences_yaml
// Expands minimal persona definitions into rich Instagram user profiles
// Deploy: supabase functions deploy panel-seed
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
    const { project_id } = await req.json();
    if (!project_id) return jsonResponse({ error: "project_id required" }, 400);

    // ── 1. Load project ───────────────────────────────────────
    const { data: project, error: projErr } = await sb
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    if (projErr || !project) {
      return jsonResponse({ error: "Project not found", details: projErr?.message }, 404);
    }

    const audiencesYaml = project.audiences_yaml ?? {};
    const personas = audiencesYaml.personas ?? audiencesYaml.segments ?? [];

    if (!Array.isArray(personas) || personas.length === 0) {
      return jsonResponse({ error: "No personas found in audiences_yaml" }, 400);
    }

    const brandData = project.brand_yaml ?? {};

    // ── 2. Call Gemini to expand personas ──────────────────────
    const prompt = `Eres un investigador de UX que crea perfiles de usuario detallados para simulacion de contenido en Instagram.

═══════════════════════════════════
MARCA
═══════════════════════════════════
${JSON.stringify(brandData, null, 2)}

═══════════════════════════════════
PERSONAS BASE (de audiences_yaml)
═══════════════════════════════════
${JSON.stringify(personas, null, 2)}

═══════════════════════════════════
TU TAREA
═══════════════════════════════════

Para CADA persona, expande su perfil minimo en un perfil de usuario de Instagram detallado y realista.
Cada perfil debe sentirse como una persona real, no un arquetipo de marketing.

Genera para cada persona:

1. **demographics**: age_range (string), gender (string), location (string), profession (string), income_level (bajo|medio|alto)
2. **instagram_behavior**: daily_time_minutes (number), content_preferences (array de strings), interaction_style (active_creator|casual_engager|passive_scroller), peak_hours (array de numbers 0-23), favorite_formats (array: reel|carousel|story|static)
3. **psychology**: primary_motivation (string), purchase_triggers (array de strings), content_fatigue_signals (array de strings), trust_builders (array de strings)
4. **brand_relationship**: awareness_level (unknown|aware|follower|customer|advocate), sentiment (positive|neutral|skeptical), past_interactions (string breve)

REGLAS:
- Mantiene el nombre y descripcion original de cada persona
- Los perfiles deben ser coherentes con la marca y su mercado
- Varía los estilos de interaccion — no todos pueden ser "casual_engager"
- Se realista con los tiempos de uso (15-120 min/dia)
- Escribe todo en espanol excepto los valores de enums

═══════════════════════════════════
FORMATO DE RESPUESTA — JSON estricto
═══════════════════════════════════

{
  "agents": [
    {
      "persona_name": "nombre original",
      "persona_profile": {
        "base_description": "descripcion original",
        "demographics": { ... },
        "instagram_behavior": { ... },
        "psychology": { ... },
        "brand_relationship": { ... }
      }
    }
  ]
}

Devuelve SOLO el JSON. Un objeto por cada persona del input.`;

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

    if (!rawText) return jsonResponse({ error: "Empty response from Gemini" }, 502);

    let parsed: { agents: Array<{ persona_name: string; persona_profile: Record<string, unknown> }> };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1].trim());
      else return jsonResponse({ error: "Failed to parse JSON", raw: rawText.slice(0, 500) }, 502);
    }

    if (!parsed.agents || !Array.isArray(parsed.agents)) {
      return jsonResponse({ error: "No agents array in response" }, 502);
    }

    // ── 3. Upsert: delete existing, insert new ───────────────
    await sb.from("panel_agents").delete().eq("project_id", project_id);

    const rows = parsed.agents.map((a) => ({
      project_id,
      persona_name: a.persona_name,
      persona_profile: a.persona_profile,
      history: [],
      memory_enabled: true,
    }));

    const { data: inserted, error: insertErr } = await sb
      .from("panel_agents")
      .insert(rows)
      .select();

    if (insertErr) {
      return jsonResponse({ error: "Failed to insert agents", details: insertErr.message }, 500);
    }

    // ── 4. Log ────────────────────────────────────────────────
    const tokensUsed = geminiData?.usageMetadata?.totalTokenCount ?? null;

    await sb.from("generation_logs").insert({
      slot_id: null,
      step: "panel-seed",
      input_json: { project_id, persona_count: personas.length },
      output_json: { agents_created: inserted?.length ?? 0 },
      model_used: "gemini-3.1-pro-preview",
      tokens_used: tokensUsed,
    });

    return jsonResponse({
      ok: true,
      agents_created: inserted?.length ?? 0,
      agents: inserted,
      tokens_used: tokensUsed,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
