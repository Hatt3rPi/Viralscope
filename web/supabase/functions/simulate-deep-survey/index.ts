// Supabase Edge Function: simulate-deep-survey
// Post-simulation agent survey: each sim persona scores all variants on 6 axes
// Input: { slot_id }
// Deploy: supabase functions deploy simulate-deep-survey
// Env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

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

// ── Composite score weights by intention ──────────────────────
const INTENTION_WEIGHTS: Record<string, Record<string, number>> = {
  viral: {
    shareability: 0.25,
    resonancia: 0.20,
    atencion: 0.15,
    memorabilidad: 0.15,
    claridad_cta: 0.15,
    brand_fit: 0.10,
  },
  quality: {
    memorabilidad: 0.20,
    brand_fit: 0.20,
    resonancia: 0.20,
    atencion: 0.15,
    claridad_cta: 0.15,
    shareability: 0.10,
  },
  commercial: {
    claridad_cta: 0.30,
    atencion: 0.20,
    brand_fit: 0.20,
    resonancia: 0.15,
    shareability: 0.10,
    memorabilidad: 0.05,
  },
};

const AXES = ["atencion", "resonancia", "shareability", "brand_fit", "claridad_cta", "memorabilidad"];

// ── Survey a single persona via Gemini ───────────────────────
async function surveyPersona(
  persona: Record<string, unknown>,
  variantes: Array<Record<string, unknown>>,
  slot: Record<string, unknown>,
  geminiKey: string,
): Promise<Record<string, Record<string, number>>> {
  const name = (persona.display_name as string) || (persona.name as string) || "Agente";
  const age = (persona.age as number) || "";
  const bio = (persona.description as string) || "";
  const interests = Array.isArray(persona.interested_topics)
    ? (persona.interested_topics as string[]).join(", ")
    : (persona.interested_topics as string) || "";
  const behavior = (persona.interaction_style as string) || "";

  const variantBlocks = variantes
    .map((v) => {
      const label = v.variant_label as string;
      const copy = (v.copy_md as string) || "(sin copy)";
      return `VARIANTE ${label}:\n${copy}`;
    })
    .join("\n\n");

  const variantExample = variantes
    .map((v) => `"${v.variant_label}":{"atencion":7,"resonancia":6,"shareability":5,"brand_fit":8,"claridad_cta":6,"memorabilidad":7}`)
    .join(",");

  const prompt = `Eres ${name}${age ? `, ${age} años` : ""}. ${bio}
Intereses: ${interests}.
${behavior ? `Comportamiento en redes: ${behavior}.` : ""}

Evalúa estas variantes de Instagram ${slot.format || "post"} sobre "${slot.topic || "el tema"}":

${variantBlocks}

Puntúa cada variante del 1 al 10 (sé honesto y crítico según tu perfil):
- atencion: ¿cuánto detendría tu scroll?
- resonancia: ¿resuena emocionalmente contigo?
- shareability: ¿qué tan probable es que la compartas?
- brand_fit: ¿se siente como una marca de calidad?
- claridad_cta: ¿qué tan claro es el llamado a la acción?
- memorabilidad: ¿la recordarías en 24 horas?

Calibración: 3=malo, 5=neutral, 7=bueno, 9=excelente. Varía tus puntuaciones entre variantes.

Responde SOLO con JSON válido:
{${variantExample}}`;

  const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error for ${name}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const allParts = data?.candidates?.[0]?.content?.parts ?? [];
  const rawText = allParts.find(
    (p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature
  )?.text || allParts[allParts.length - 1]?.text || null;

  if (!rawText) throw new Error(`Empty response for ${name}`);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) parsed = JSON.parse(match[1].trim());
    else throw new Error(`JSON parse failed for ${name}`);
  }

  // Validate: must have keys matching variant labels
  const result: Record<string, Record<string, number>> = {};
  for (const v of variantes) {
    const label = v.variant_label as string;
    const scores = parsed[label] as Record<string, number> | undefined;
    if (scores && typeof scores === "object") {
      result[label] = {};
      for (const axis of AXES) {
        result[label][axis] = Math.min(10, Math.max(1, Math.round((scores[axis] as number) || 5)));
      }
    }
  }

  return result;
}

// ── Compute composite score per variant ──────────────────────
function computeCompositeScore(
  allScores: Record<string, Record<string, Record<string, number>>>,
  variantLabel: string,
  intention: string,
): number {
  const weights = INTENTION_WEIGHTS[intention] || INTENTION_WEIGHTS.quality;
  const personaScores = Object.values(allScores)
    .map((p) => p[variantLabel])
    .filter(Boolean);

  if (personaScores.length === 0) return 0;

  const avgAxes: Record<string, number> = {};
  for (const axis of AXES) {
    avgAxes[axis] =
      personaScores.reduce((s, p) => s + (p[axis] || 5), 0) / personaScores.length;
  }

  const composite = AXES.reduce((sum, axis) => sum + avgAxes[axis] * (weights[axis] || 0), 0);
  return Math.round(composite * 100) / 100;
}

// ── Main Handler ──────────────────────────────────────────────
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

    // ── 1. Load slot + variantes + project ────────────────────
    const { data: slot, error: slotErr } = await sb
      .from("slots")
      .select("*, campaign:campaigns(*, project:projects(*))")
      .eq("id", slot_id)
      .single();

    if (slotErr || !slot) {
      return jsonResponse({ error: "Slot not found", details: slotErr?.message }, 404);
    }

    const project = slot.campaign?.project;
    if (!project) return jsonResponse({ error: "Project not found" }, 404);

    const intention = (slot.intention as string) || "quality";

    const { data: variantes, error: varErr } = await sb
      .from("variantes")
      .select("id, variant_label, copy_md")
      .eq("slot_id", slot_id)
      .order("variant_label", { ascending: true });

    if (varErr || !variantes || variantes.length === 0) {
      return jsonResponse({ error: "No variantes found" }, 404);
    }

    // ── 2. Load sim personas (up to 20 to avoid timeout) ─────
    const simPersonas = (project.sim_personas as Array<Record<string, unknown>>) ?? [];
    const personas = simPersonas.slice(0, 3); // debug: start small

    if (personas.length === 0) {
      return jsonResponse({ error: "No sim_personas found on project. Run persona-generate first." }, 400);
    }

    // ── 3. Survey personas in batches of 3 (avoid worker limits) ──
    const BATCH_SIZE = 3;
    const BATCH_DELAY_MS = 300;
    const results: PromiseSettledResult<Record<string, Record<string, number>>>[] = [];

    for (let i = 0; i < personas.length; i += BATCH_SIZE) {
      const batch = personas.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((persona) => surveyPersona(persona, variantes, slot, geminiKey))
      );
      results.push(...batchResults);
      if (i + BATCH_SIZE < personas.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    // ── 4. Build survey object (SimulationCard format) ────────
    const survey: Record<string, { weight: number; scores: Record<string, Record<string, number>> }> = {};
    const failed: string[] = [];

    results.forEach((result, i) => {
      const persona = personas[i];
      const name = ((persona.display_name as string) || (persona.name as string) || `Persona_${i}`)
        .replace(/\s+/g, "_");

      if (result.status === "fulfilled") {
        survey[name] = { weight: 1, scores: result.value };
      } else {
        failed.push(`${name}: ${result.reason?.message ?? String(result.reason)}`);
      }
    });

    if (Object.keys(survey).length === 0) {
      return jsonResponse({ error: "All persona surveys failed", failures: failed }, 502);
    }

    // ── 5. Compute composite scores per variant ───────────────
    const surveyScoresByPersona: Record<string, Record<string, Record<string, number>>> = {};
    for (const [pName, pData] of Object.entries(survey)) {
      surveyScoresByPersona[pName] = pData.scores;
    }

    const compositeScores: Record<string, number> = {};
    for (const v of variantes) {
      compositeScores[v.variant_label as string] = computeCompositeScore(
        surveyScoresByPersona,
        v.variant_label as string,
        intention,
      );
    }

    // Winner
    const winner = Object.entries(compositeScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // ── 6. Save survey to deep_sim_result.survey ──────────────
    const existing = (slot.deep_sim_result as Record<string, unknown>) ?? {};
    const updated = { ...existing, survey, survey_scores: compositeScores, survey_winner: winner };

    const { error: updateErr } = await sb
      .from("slots")
      .update({ deep_sim_result: updated })
      .eq("id", slot_id);

    if (updateErr) {
      return jsonResponse({ error: "Failed to save survey", details: updateErr.message }, 500);
    }

    // ── 7. Update simulation_score on variantes ───────────────
    await Promise.allSettled(
      variantes.map((v) =>
        sb
          .from("variantes")
          .update({ simulation_score: compositeScores[v.variant_label as string] })
          .eq("id", v.id)
      )
    );

    // ── 8. Return ─────────────────────────────────────────────
    return jsonResponse({
      ok: true,
      personas_surveyed: Object.keys(survey).length,
      personas_failed: failed.length,
      failures: failed.length > 0 ? failed : undefined,
      scores: compositeScores,
      winner,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
