// Supabase Edge Function: simulate-deep-survey (v2 — 3-layer evaluation)
// Layer 1: Technical checklist (1× pro model, objective)
// Layer 2: Behavioral simulation (50 agents, flash-lite, behavioral YES/NO)
// Layer 3: Synthesis (1× pro model, insights + verdict)
// Input: { slot_id }
// Env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_PRO = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent";
const GEMINI_LITE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent";

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

// ── Gemini call helper ──────────────────────────────────────
async function callGemini(
  url: string,
  key: string,
  prompt: string,
  opts: { temperature?: number; maxTokens?: number; thinking?: string } = {},
): Promise<Record<string, unknown>> {
  const res = await fetch(`${url}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens ?? 2048,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: opts.thinking ?? "low" },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const allParts = data?.candidates?.[0]?.content?.parts ?? [];
  const rawText = allParts.find(
    (p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature
  )?.text || allParts[allParts.length - 1]?.text || null;

  if (!rawText) throw new Error("Empty Gemini response");

  try {
    return JSON.parse(rawText);
  } catch {
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    throw new Error(`JSON parse failed: ${rawText.slice(0, 200)}`);
  }
}

// ── LAYER 1: Technical Checklist ────────────────────────────
const CHECKLIST_CRITERIA = [
  { key: "hook_3_words", label: "Hook en 3 palabras", group: "Hook" },
  { key: "pattern_interrupt", label: "Pattern interrupt", group: "Hook" },
  { key: "works_muted", label: "Funciona sin audio", group: "Hook" },
  { key: "practical_value", label: "Utilidad practica", group: "Valor" },
  { key: "save_worthy", label: "Vale guardar", group: "Valor" },
  { key: "trigger_frequency", label: "Trigger cotidiano", group: "Valor" },
  { key: "send_trigger", label: "Send trigger", group: "Distribucion" },
  { key: "conversation_starter", label: "Genera debate", group: "Distribucion" },
  { key: "format_fit", label: "Formato correcto", group: "Distribucion" },
  { key: "organic_brand", label: "Marca organica", group: "Marca" },
];

async function runChecklist(
  variantes: Array<Record<string, unknown>>,
  slot: Record<string, unknown>,
  geminiKey: string,
): Promise<Record<string, Record<string, boolean>>> {
  const variantBlocks = variantes
    .map((v) => `VARIANTE ${v.variant_label}:\n${(v.copy_md as string) || "(sin copy)"}`)
    .join("\n\n");

  const criteriaList = CHECKLIST_CRITERIA
    .map((c, i) => `${i + 1}. ${c.key}: ${c.label}`)
    .join("\n");

  const exampleObj = Object.fromEntries(CHECKLIST_CRITERIA.map((c) => [c.key, true]));
  const variantExample = variantes
    .map((v) => `"${v.variant_label}":${JSON.stringify(exampleObj)}`)
    .join(",");

  const prompt = `Analiza estas variantes de Instagram ${slot.format || "post"} para "${slot.topic || ""}".

${variantBlocks}

Para CADA variante, evalua estos 10 criterios con true/false:

HOOK (primeros 1-3 segundos)
1. hook_3_words: Las primeras 3 palabras generan curiosidad o sorpresa?
2. pattern_interrupt: Rompe el patron visual/textual del feed tipico?
3. works_muted: Se entiende sin audio (solo visual/texto)?

VALOR
4. practical_value: Tiene utilidad practica concreta (ensena, resuelve, informa)?
5. save_worthy: Vale la pena guardarlo para referencia futura?
6. trigger_frequency: Hay algo cotidiano que recuerde este contenido frecuentemente?

DISTRIBUCION
7. send_trigger: Alguien pensaria "tengo que mandarselo a X"?
8. conversation_starter: Genera opinion, debate o ganas de comentar?
9. format_fit: El formato es correcto para Instagram ${slot.format || "post"}?

MARCA
10. organic_brand: La marca aparece de forma organica, no forzada?

Responde SOLO JSON: {${variantExample}}`;

  const parsed = await callGemini(GEMINI_PRO, geminiKey, prompt, { temperature: 0.3, thinking: "medium" });

  // Normalize: ensure all criteria are boolean
  const result: Record<string, Record<string, boolean>> = {};
  for (const v of variantes) {
    const label = v.variant_label as string;
    const raw = parsed[label] as Record<string, unknown> | undefined;
    result[label] = {};
    for (const c of CHECKLIST_CRITERIA) {
      result[label][c.key] = raw?.[c.key] === true;
    }
  }
  return result;
}

// ── LAYER 2: Behavioral Simulation ──────────────────────────
interface BehavioralResponse {
  stop: boolean;
  send_to: string;
  save: boolean;
  comment: string | null;
  emotion: string;
  improve: string;
}

async function surveyPersonaBehavioral(
  persona: Record<string, unknown>,
  variantes: Array<Record<string, unknown>>,
  slot: Record<string, unknown>,
  geminiKey: string,
): Promise<Record<string, BehavioralResponse>> {
  const name = (persona.display_name as string) || (persona.name as string) || "Agente";
  const age = (persona.age as number) || "";
  const bio = (persona.description as string) || "";
  const interests = Array.isArray(persona.interested_topics)
    ? (persona.interested_topics as string[]).join(", ")
    : (persona.interested_topics as string) || "";
  const behavior = (persona.interaction_style as string) || "";

  const variantBlocks = variantes
    .map((v) => `VARIANTE ${v.variant_label}:\n${(v.copy_md as string) || "(sin copy)"}`)
    .join("\n\n");

  const variantExample = variantes
    .map((v) => `"${v.variant_label}":{"stop":true,"send_to":"mi hermana","save":false,"comment":null,"emotion":"curiosidad","improve":"agregar CTA"}`)
    .join(",");

  const prompt = `Eres ${name}${age ? `, ${age} anos` : ""}. ${bio}
Intereses: ${interests}.
${behavior ? `Comportamiento en redes: ${behavior}.` : ""}

Estas haciendo scroll en Instagram y ves estas variantes de ${slot.format || "post"} sobre "${slot.topic || "el tema"}":

${variantBlocks}

Para CADA variante, responde honestamente desde tu perfil:
1. stop: Detendrias tu scroll? (true/false)
2. send_to: A quien se lo mandarias por DM? (ej: "mi hermana", "un amigo chef", o "nadie")
3. save: Lo guardarias? (true/false)
4. comment: Que comentarias? (texto corto o null si nada)
5. emotion: Que sentiste al verlo? (1 palabra)
6. improve: Que le mejorarias? (1 frase corta)

Responde SOLO JSON: {${variantExample}}`;

  const parsed = await callGemini(GEMINI_LITE, geminiKey, prompt, { temperature: 1.0, maxTokens: 1024 });

  const result: Record<string, BehavioralResponse> = {};
  for (const v of variantes) {
    const label = v.variant_label as string;
    const raw = parsed[label] as Record<string, unknown> | undefined;
    result[label] = {
      stop: raw?.stop === true,
      send_to: typeof raw?.send_to === "string" ? raw.send_to : "nadie",
      save: raw?.save === true,
      comment: typeof raw?.comment === "string" ? raw.comment : null,
      emotion: typeof raw?.emotion === "string" ? raw.emotion : "neutro",
      improve: typeof raw?.improve === "string" ? raw.improve : "",
    };
  }
  return result;
}

// ── LAYER 3: Synthesis ──────────────────────────────────────
async function runSynthesis(
  checklist: Record<string, Record<string, boolean>>,
  metrics: Record<string, { stop_rate: number; send_rate: number; save_rate: number; comment_rate: number }>,
  emotions: Record<string, Record<string, number>>,
  improvements: Record<string, string[]>,
  slot: Record<string, unknown>,
  intention: string,
  geminiKey: string,
): Promise<Record<string, unknown>> {
  const checklistSummary = Object.entries(checklist)
    .map(([label, criteria]) => {
      const passed = Object.values(criteria).filter(Boolean).length;
      const details = Object.entries(criteria).map(([k, v]) => `${k}: ${v ? "SI" : "NO"}`).join(", ");
      return `Variante ${label}: ${passed}/10 (${details})`;
    })
    .join("\n");

  const metricsSummary = Object.entries(metrics)
    .map(([label, m]) => `Variante ${label}: stop=${Math.round(m.stop_rate * 100)}%, send=${Math.round(m.send_rate * 100)}%, save=${Math.round(m.save_rate * 100)}%, comment=${Math.round(m.comment_rate * 100)}%`)
    .join("\n");

  const emotionsSummary = Object.entries(emotions)
    .map(([label, emo]) => {
      const top = Object.entries(emo).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([e, c]) => `${e} (${c})`).join(", ");
      return `Variante ${label}: ${top}`;
    })
    .join("\n");

  const improveSummary = Object.entries(improvements)
    .map(([label, items]) => `Variante ${label}: ${items.slice(0, 10).join(" | ")}`)
    .join("\n");

  const prompt = `Analiza estos resultados de evaluacion de contenido Instagram.

CHECKLIST TECNICO:
${checklistSummary}

METRICAS DE COMPORTAMIENTO (agentes simulados):
${metricsSummary}

EMOCIONES MAS FRECUENTES:
${emotionsSummary}

MEJORAS SUGERIDAS POR AGENTES:
${improveSummary}

Intencion del slot: ${intention}
Formato: ${slot.format || "post"}
Tema: ${slot.topic || ""}

Genera un analisis con:
1. Por cada variante:
   - fortalezas: array de 2-3 puntos fuertes (basado en datos concretos)
   - debilidades: array de 2-3 puntos debiles (basado en datos concretos)
   - mejoras: array de 2-3 acciones concretas y accionables
2. veredicto: parrafo de 3-4 oraciones. Cual publicar y por que. Si se puede combinar lo mejor de varias variantes, indicarlo.
3. winner: label de la variante ganadora

JSON:
{"variants":{"A":{"fortalezas":["..."],"debilidades":["..."],"mejoras":["..."]},"B":{...}},"veredicto":"string","winner":"A"}`;

  return await callGemini(GEMINI_PRO, geminiKey, prompt, { temperature: 0.5, maxTokens: 4096, thinking: "medium" });
}

// ── Composite score ─────────────────────────────────────────
const INTENTION_WEIGHTS: Record<string, Record<string, number>> = {
  viral:      { send_rate: 0.35, stop_rate: 0.25, comment_rate: 0.20, save_rate: 0.20 },
  quality:    { save_rate: 0.35, stop_rate: 0.25, send_rate: 0.20, comment_rate: 0.20 },
  commercial: { stop_rate: 0.30, send_rate: 0.25, save_rate: 0.25, comment_rate: 0.20 },
};

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

    // ── 1. Load data ──────────────────────────────────────────
    const { data: slot, error: slotErr } = await sb
      .from("slots")
      .select("*, campaign:campaigns(*, project:projects(*))")
      .eq("id", slot_id)
      .single();

    if (slotErr || !slot) return jsonResponse({ error: "Slot not found" }, 404);

    const project = slot.campaign?.project;
    if (!project) return jsonResponse({ error: "Project not found" }, 404);

    const intention = (slot.intention as string) || "quality";

    const { data: variantes, error: varErr } = await sb
      .from("variantes")
      .select("id, variant_label, copy_md")
      .eq("slot_id", slot_id)
      .order("variant_label", { ascending: true });

    if (varErr || !variantes || variantes.length === 0) return jsonResponse({ error: "No variantes found" }, 404);

    const personas = (project.sim_personas as Array<Record<string, unknown>>) ?? [];
    if (personas.length === 0) return jsonResponse({ error: "No sim_personas found" }, 400);

    // ── 2. LAYER 1 + LAYER 2 in PARALLEL ─────────────────────
    const checklistPromise = runChecklist(variantes, slot, geminiKey);

    // Layer 2: behavioral survey in batches
    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 200;
    const behavioralResults: PromiseSettledResult<Record<string, BehavioralResponse>>[] = [];

    const behavioralPromise = (async () => {
      for (let i = 0; i < personas.length; i += BATCH_SIZE) {
        const batch = personas.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
          batch.map((p) => surveyPersonaBehavioral(p, variantes, slot, geminiKey))
        );
        behavioralResults.push(...batchResults);
        if (i + BATCH_SIZE < personas.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
    })();

    // Wait for both layers
    const [checklist] = await Promise.all([checklistPromise, behavioralPromise]);

    // ── 3. Aggregate behavioral data ──────────────────────────
    const behavioral: Record<string, { age: number; gender: string; responses: Record<string, BehavioralResponse> }> = {};
    const failed: string[] = [];

    behavioralResults.forEach((result, i) => {
      const persona = personas[i];
      const name = ((persona.display_name as string) || (persona.name as string) || `Persona_${i}`)
        .replace(/\s+/g, "_");

      if (result.status === "fulfilled") {
        behavioral[name] = {
          age: (persona.age as number) || 0,
          gender: (persona.gender as string) || "otro",
          responses: result.value,
        };
      } else {
        failed.push(`${name}: ${result.reason?.message ?? String(result.reason)}`);
      }
    });

    if (Object.keys(behavioral).length === 0) {
      return jsonResponse({ error: "All behavioral surveys failed", failures: failed }, 502);
    }

    const n = Object.keys(behavioral).length;
    const labels = variantes.map((v) => v.variant_label as string);

    // Compute metrics per variant
    const metrics: Record<string, { stop_rate: number; send_rate: number; save_rate: number; comment_rate: number }> = {};
    const emotions: Record<string, Record<string, number>> = {};
    const improvements: Record<string, string[]> = {};

    for (const label of labels) {
      let stops = 0, sends = 0, saves = 0, comments = 0;
      emotions[label] = {};
      improvements[label] = [];

      for (const [, pData] of Object.entries(behavioral)) {
        const r = pData.responses[label];
        if (!r) continue;
        if (r.stop) stops++;
        if (r.send_to && r.send_to.toLowerCase() !== "nadie") sends++;
        if (r.save) saves++;
        if (r.comment) comments++;
        // Emotions
        const emo = (r.emotion || "neutro").toLowerCase();
        emotions[label][emo] = (emotions[label][emo] || 0) + 1;
        // Improvements
        if (r.improve && r.improve.trim()) improvements[label].push(r.improve.trim());
      }

      metrics[label] = {
        stop_rate: stops / n,
        send_rate: sends / n,
        save_rate: saves / n,
        comment_rate: comments / n,
      };
    }

    // ── 4. LAYER 3: Synthesis ─────────────────────────────────
    let synthesis: Record<string, unknown> = {};
    try {
      synthesis = await runSynthesis(checklist, metrics, emotions, improvements, slot, intention, geminiKey);
    } catch {
      synthesis = { variants: {}, veredicto: "No se pudo generar sintesis", winner: null };
    }

    // ── 5. Composite score ────────────────────────────────────
    const weights = INTENTION_WEIGHTS[intention] || INTENTION_WEIGHTS.quality;
    const compositeScores: Record<string, number> = {};
    for (const label of labels) {
      const m = metrics[label];
      compositeScores[label] = Math.round(
        (m.stop_rate * (weights.stop_rate || 0) +
         m.send_rate * (weights.send_rate || 0) +
         m.save_rate * (weights.save_rate || 0) +
         m.comment_rate * (weights.comment_rate || 0)) * 10 * 100
      ) / 100;
    }

    const winner = (synthesis.winner as string) ||
      (Object.entries(compositeScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null);

    // ── 6. Save to Supabase ───────────────────────────────────
    const existing = (slot.deep_sim_result as Record<string, unknown>) ?? {};
    const surveyData = {
      checklist,
      behavioral,
      metrics,
      emotions,
      synthesis,
      survey_scores: compositeScores,
      survey_winner: winner,
    };
    const updated = { ...existing, survey: surveyData };

    const { error: updateErr } = await sb
      .from("slots")
      .update({ deep_sim_result: updated })
      .eq("id", slot_id);

    if (updateErr) return jsonResponse({ error: "Failed to save", details: updateErr.message }, 500);

    await Promise.allSettled(
      variantes.map((v) =>
        sb.from("variantes")
          .update({ simulation_score: compositeScores[v.variant_label as string] })
          .eq("id", v.id)
      )
    );

    // ── 7. Return ─────────────────────────────────────────────
    return jsonResponse({
      ok: true,
      personas_surveyed: n,
      personas_failed: failed.length,
      checklist,
      metrics,
      synthesis,
      scores: compositeScores,
      winner,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
