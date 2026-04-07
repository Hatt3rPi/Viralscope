// Supabase Edge Function: Panel de Evaluacion — Evaluate content variants with AI panel agents
// Each agent evaluates ALL variants in a single multimodal call, then composite scores are computed
// Deploy: supabase functions deploy panel-evaluate
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

// ── Composite Score Weights by Intention ───────────────────────
const INTENTION_WEIGHTS: Record<string, Record<string, number>> = {
  viral: {
    stop_look: 0.10, read_caption: 0.05, like: 0.10, comment: 0.15,
    share: 0.25, save: 0.10, follow: 0.10, attention_avg: 0.05,
    sentiment_positive: 0.05, cta_action: 0.05,
  },
  quality: {
    stop_look: 0.10, read_caption: 0.15, like: 0.10, comment: 0.10,
    share: 0.05, save: 0.20, follow: 0.15, attention_avg: 0.10,
    sentiment_positive: 0.05, cta_action: 0.00,
  },
  commercial: {
    stop_look: 0.10, read_caption: 0.10, like: 0.05, comment: 0.05,
    share: 0.05, save: 0.10, follow: 0.10, attention_avg: 0.10,
    sentiment_positive: 0.05, cta_action: 0.30,
  },
};

const POSITIVE_SENTIMENTS = [
  "inspired", "informed", "curious", "motivated", "amused",
  "excited", "happy", "touched", "entertained", "empowered",
  "inspirado", "informado", "curioso", "motivado", "divertido",
  "emocionado", "feliz", "conmovido", "entretenido",
];

const ACTION_KEYS = ["stop_look", "read_caption", "like", "comment", "share", "save", "follow"];

// ── Helper: fetch image as base64 ─────────────────────────────
async function fetchImageBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();
    // Use chunked encoding to avoid stack overflow with large images
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    return { data: base64, mimeType: contentType.split(";")[0] };
  } catch {
    return null;
  }
}

// ── Helper: build agent evaluation prompt parts ───────────────
async function buildAgentParts(
  agent: Record<string, unknown>,
  variantes: Array<Record<string, unknown>>,
  slot: Record<string, unknown>,
  brandData: Record<string, unknown>,
  intention: string,
): Promise<Array<Record<string, unknown>>> {
  const parts: Array<Record<string, unknown>> = [];
  const profile = agent.persona_profile as Record<string, unknown>;
  const history = (agent.history as Array<Record<string, unknown>>) ?? [];
  const memoryEnabled = agent.memory_enabled !== false;

  // Part 1: System context + agent profile
  let systemText = `Eres ${agent.persona_name}, una persona REAL que usa Instagram a diario.
Tu rol: evaluar contenido como lo haria un usuario real haciendo scroll en su feed.

═══════════════════════════════════
TU PERFIL
═══════════════════════════════════
${JSON.stringify(profile, null, 2)}
`;

  if (memoryEnabled && history.length > 0) {
    systemText += `
═══════════════════════════════════
TU HISTORIAL DE EVALUACIONES
═══════════════════════════════════
${JSON.stringify(history.slice(-5), null, 2)}
Usa tu historial para mantener coherencia en tus gustos y preferencias.
`;
  }

  systemText += `
═══════════════════════════════════
CONTEXTO DEL CONTENIDO
═══════════════════════════════════
- Marca: ${(brandData as Record<string, unknown>)?.name ?? "Sin nombre"}
- Plataforma: Instagram
- Formato: ${slot.format}
- Pilar: ${slot.pillar}
- Objetivo: ${slot.objective}
- Intencion: ${intention}
- Tema: ${slot.topic}
`;

  parts.push({ text: systemText });

  // Parts 2-N: Images (one per variant)
  for (const v of variantes) {
    const imageUrl = v.image_url as string | null;
    if (imageUrl) {
      const img = await fetchImageBase64(imageUrl);
      if (img) {
        parts.push({
          inline_data: { mime_type: img.mimeType, data: img.data },
        });
        parts.push({ text: `[Imagen de la Variante ${v.variant_label}]` });
      } else {
        const artDir = (v.art_direction_image_json as Record<string, unknown>)?.art_direction as Record<string, unknown> | undefined;
        parts.push({ text: `[Variante ${v.variant_label} — sin imagen. Concepto visual: ${artDir?.concept ?? "no definido"}]` });
      }
    } else {
      const artDir = (v.art_direction_image_json as Record<string, unknown>)?.art_direction as Record<string, unknown> | undefined;
      parts.push({ text: `[Variante ${v.variant_label} — sin imagen. Concepto visual: ${artDir?.concept ?? "no definido"}]` });
    }
  }

  // Final part: copy + survey instructions
  const variantCopies = variantes.map((v) =>
    `### Variante ${v.variant_label}\n${(v.copy_md as string) || "(sin copy)"}`
  ).join("\n\n");

  let conditionalQ = "";
  if (intention === "commercial") {
    conditionalQ = `\n4. **Comercial**: "would_buy": true | false | "maybe"`;
  } else if (intention === "viral") {
    conditionalQ = `\n4. **Viral**: "would_repost_story": true | false`;
  }
  if ((slot.objective as string) === "retention") {
    conditionalQ += `\n${conditionalQ ? "5" : "4"}. **Retencion**: "would_enable_notifications": true | false`;
  }

  const variantLabels = variantes.map((v) => v.variant_label as string);
  const evalTemplate = variantLabels.map((l) => `"${l}": { "actions": { "scroll_past": false, "stop_look": true, "read_caption": true, "like": true, "comment": false, "share": false, "save": true, "follow": false }, "scores": { "hook_strength": 7, "emotional_resonance": 6, "message_clarity": 8, "cta_effectiveness": 5, "brand_fit": 7, "memorability": 6 }, "qualitative": { "attention_seconds": 15, "sentiment": "informado", "best_thing": "...", "worst_thing": "...", "would_share_with": "familiar", "comment_if_any": null } }`).join(",\n    ");

  const surveyText = `
═══════════════════════════════════
COPY DE LAS VARIANTES
═══════════════════════════════════
${variantCopies}

═══════════════════════════════════
TU TAREA — ENCUESTA ESTRUCTURADA
═══════════════════════════════════

Imagina que ves CADA variante mientras haces scroll en Instagram.
Para CADA variante, responde desde tu perspectiva personal:

1. **Acciones** (true/false para cada una):
   scroll_past, stop_look, read_caption, like, comment, share, save, follow
   NOTA: si scroll_past=true, las demas acciones deben ser false (pasaste de largo)

2. **Scores** (1-10, se honesto y critico segun tu perfil):
   - hook_strength: ¿Detiene tu scroll en 1.5 segundos?
   - emotional_resonance: ¿Conecta contigo emocionalmente?
   - message_clarity: ¿Entiendes el mensaje al instante?
   - cta_effectiveness: ¿Te impulsa a actuar?
   - brand_fit: ¿Se siente coherente con la marca?
   - memorability: ¿Lo recordaras manana?
   Calibracion: 3=malo, 5=neutral, 7=bueno, 9=excelente. NO pongas todo en 7-8.

3. **Cualitativos**:
   - attention_seconds (number): cuantos segundos le darias realmente (2-120)
   - sentiment (string): una palabra que describa lo que sentiste
   - best_thing (string): lo mejor del contenido (1 oracion)
   - worst_thing (string): lo peor o mas debil (1 oracion)
   - would_share_with (string): nadie | familiar | amigo | colega
   - comment_if_any (string | null): que comentario dejarias, null si ninguno
${conditionalQ}

═══════════════════════════════════
FORMATO DE RESPUESTA — JSON estricto
═══════════════════════════════════

{
  "evaluations": {
    ${evalTemplate}
  }
}

REGLAS:
- Responde DESDE tu perspectiva personal basada en tu perfil
- Se critico y honesto — no todo te va a gustar
- Si scroll_past=true, pon scores bajos (1-4) y attention_seconds=2
- Varia tus respuestas entre variantes — es poco probable que todas te gusten igual
- Devuelve SOLO el JSON
`;

  parts.push({ text: surveyText });

  return parts;
}

// ── Helper: evaluate single agent ─────────────────────────────
async function evaluateAgent(
  agent: Record<string, unknown>,
  variantes: Array<Record<string, unknown>>,
  slot: Record<string, unknown>,
  brandData: Record<string, unknown>,
  intention: string,
  geminiKey: string,
): Promise<{ agent_name: string; agent_id: string; evaluations: Record<string, unknown> }> {
  const parts = await buildAgentParts(agent, variantes, slot, brandData, intention);

  const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    throw new Error(`Gemini error for ${agent.persona_name}: ${errText.slice(0, 200)}`);
  }

  const geminiData = await geminiRes.json();
  const allParts = geminiData?.candidates?.[0]?.content?.parts ?? [];
  const textPart = allParts.find((p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature);
  const rawText = textPart?.text || allParts[allParts.length - 1]?.text || null;

  if (!rawText) throw new Error(`Empty response for ${agent.persona_name}`);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) parsed = JSON.parse(match[1].trim());
    else throw new Error(`JSON parse failed for ${agent.persona_name}`);
  }

  // Handle both { evaluations: { A: ... } } and { A: ... } formats
  const evaluations = (parsed.evaluations ?? parsed) as Record<string, unknown>;
  if (!evaluations || typeof evaluations !== "object") {
    throw new Error(`Invalid evaluations format for ${agent.persona_name}`);
  }

  return {
    agent_name: agent.persona_name as string,
    agent_id: agent.id as string,
    evaluations,
    // @ts-ignore — attach for token tracking
    _tokens: geminiData?.usageMetadata?.totalTokenCount ?? 0,
  };
}

// ── Composite Score Engine ────────────────────────────────────
function computeCompositeScores(
  agentResults: Array<{ evaluations: Record<string, Record<string, unknown>> }>,
  intention: string,
  variantLabels: string[],
): { composite_scores: Record<string, number>; winner: string; confidence: string } {
  const weights = INTENTION_WEIGHTS[intention] || INTENTION_WEIGHTS.quality;
  const scores: Record<string, number> = {};

  for (const label of variantLabels) {
    const evals = agentResults
      .map((r) => r.evaluations[label])
      .filter(Boolean) as Array<Record<string, unknown>>;
    const n = evals.length;
    if (n === 0) { scores[label] = 0; continue; }

    const actions = evals.map((e) => e.actions as Record<string, boolean>);
    const qualitative = evals.map((e) => e.qualitative as Record<string, unknown>);

    // Action percentages
    const actionPcts: Record<string, number> = {};
    for (const key of ACTION_KEYS) {
      actionPcts[key] = actions.filter((a) => a[key]).length / n;
    }

    // Average attention (normalized 0-1, max 120s)
    const attentionAvg = qualitative.reduce(
      (s, q) => s + ((q.attention_seconds as number) || 0), 0
    ) / n / 120;

    // Sentiment positive ratio
    const sentimentPositive = qualitative.filter((q) =>
      POSITIVE_SENTIMENTS.includes(((q.sentiment as string) || "").toLowerCase())
    ).length / n;

    // CTA action by intention
    let ctaAction = 0;
    if (intention === "commercial") {
      ctaAction = qualitative.filter((q) => q.would_buy === true).length / n;
    } else if (intention === "viral") {
      ctaAction = qualitative.filter((q) => q.would_repost_story === true).length / n;
    } else {
      ctaAction = (actionPcts.comment + actionPcts.follow) / 2;
    }

    // Weighted composite
    scores[label] = (
      actionPcts.stop_look * weights.stop_look +
      actionPcts.read_caption * weights.read_caption +
      actionPcts.like * weights.like +
      actionPcts.comment * weights.comment +
      actionPcts.share * weights.share +
      actionPcts.save * weights.save +
      actionPcts.follow * weights.follow +
      attentionAvg * weights.attention_avg +
      sentimentPositive * weights.sentiment_positive +
      ctaAction * weights.cta_action
    ) * 10; // Scale to 0-10
  }

  // Determine winner + confidence
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0];
  const margin = sorted.length > 1 ? sorted[0][1] - sorted[1][1] : 10;
  const confidence = margin > 1.5 ? "alta" : margin > 0.5 ? "media" : "baja";

  // Round scores to 2 decimals
  for (const key of Object.keys(scores)) {
    scores[key] = Math.round(scores[key] * 100) / 100;
  }

  return { composite_scores: scores, winner, confidence };
}

// ── Verdict Generator (LLM) ──────────────────────────────────
async function generateVerdict(
  agentResults: Array<Record<string, unknown>>,
  compositeData: { composite_scores: Record<string, number>; winner: string; confidence: string },
  slot: Record<string, unknown>,
  intention: string,
  geminiKey: string,
): Promise<Record<string, unknown>> {
  const prompt = `Eres un analista de contenido para Instagram. Analiza estos resultados de evaluacion de panel y genera un veredicto final.

═══════════════════════════════════
RESULTADOS
═══════════════════════════════════

Composite Scores: ${JSON.stringify(compositeData.composite_scores)}
Ganadora: Variante ${compositeData.winner} (confianza: ${compositeData.confidence})
Intencion: ${intention}
Formato: ${slot.format}
Tema: ${slot.topic}

Resumen de evaluaciones por agente:
${agentResults.map((r) => {
  const name = r.agent_name;
  const evals = r.evaluations as Record<string, Record<string, unknown>>;
  const summary = Object.entries(evals).map(([label, ev]) => {
    const actions = ev.actions as Record<string, boolean>;
    const qual = ev.qualitative as Record<string, unknown>;
    const activeActions = Object.entries(actions).filter(([, v]) => v).map(([k]) => k);
    return `  ${label}: acciones=[${activeActions.join(",")}] sentiment=${qual.sentiment} attention=${qual.attention_seconds}s best="${qual.best_thing}"`;
  }).join("\n");
  return `**${name}**:\n${summary}`;
}).join("\n\n")}

═══════════════════════════════════
TU TAREA
═══════════════════════════════════

Genera un veredicto con:
1. reasoning: por que la ganadora es la mejor opcion (2-3 oraciones)
2. risk_flags: posibles riesgos o puntos debiles (array de strings, maximo 3)
3. variant_recommendations: para CADA variante, una accion recomendada y su razon

Acciones posibles: publish (publicar como feed), story (publicar como story), reserve (guardar para despues), repurpose (rehacer con cambios), archive (descartar)

{
  "reasoning": "string",
  "risk_flags": ["string"],
  "variant_recommendations": {
    "A": { "action": "publish|story|reserve|repurpose|archive", "reason": "string" },
    "B": { "action": "...", "reason": "..." },
    "C": { "action": "...", "reason": "..." }
  }
}

Devuelve SOLO el JSON.`;

  const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
  });

  if (!geminiRes.ok) {
    return { reasoning: "No se pudo generar veredicto", risk_flags: [], variant_recommendations: {} };
  }

  const geminiData = await geminiRes.json();
  const allParts = geminiData?.candidates?.[0]?.content?.parts ?? [];
  const textPart = allParts.find((p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature);
  const rawText = textPart?.text || allParts[allParts.length - 1]?.text || null;

  if (!rawText) {
    return { reasoning: "Respuesta vacia de Gemini", risk_flags: [], variant_recommendations: {} };
  }

  try {
    return JSON.parse(rawText);
  } catch {
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    return { reasoning: rawText.slice(0, 500), risk_flags: [], variant_recommendations: {} };
  }
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

    // ── 1. Load slot + context ────────────────────────────────
    const { data: slot, error: slotErr } = await sb
      .from("slots")
      .select("*, campaign:campaigns(*, project:projects(*))")
      .eq("id", slot_id)
      .single();

    if (slotErr || !slot) {
      return jsonResponse({ error: "Slot not found", details: slotErr?.message }, 404);
    }

    const campaign = slot.campaign;
    const project = campaign?.project;
    if (!project) return jsonResponse({ error: "Project context not found" }, 404);

    const intention = slot.intention || "quality";
    const brandData = project.brand_yaml ?? {};

    // ── 2. Load variantes ─────────────────────────────────────
    const { data: variantes, error: varErr } = await sb
      .from("variantes")
      .select("*")
      .eq("slot_id", slot_id)
      .order("variant_label", { ascending: true });

    if (varErr || !variantes || variantes.length === 0) {
      return jsonResponse({ error: "No variantes found for this slot" }, 404);
    }

    // ── 3. Load panel agents ──────────────────────────────────
    const { data: agents, error: agentErr } = await sb
      .from("panel_agents")
      .select("*")
      .eq("project_id", project.id);

    if (agentErr || !agents || agents.length === 0) {
      return jsonResponse({
        error: "No panel agents found. Run panel-seed first.",
        details: agentErr?.message,
      }, 400);
    }

    // ── 4. Evaluate: 1 LLM call per agent, batched ───────────
    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 500;
    const allResults: Array<PromiseSettledResult<{
      agent_name: string;
      agent_id: string;
      evaluations: Record<string, unknown>;
      _tokens?: number;
    }>> = [];

    for (let i = 0; i < agents.length; i += BATCH_SIZE) {
      const batch = agents.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((agent) =>
          evaluateAgent(agent, variantes, slot, brandData, intention, geminiKey)
        ),
      );
      allResults.push(...batchResults);

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < agents.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    // Separate successes and failures
    const successResults: Array<{
      agent_name: string;
      agent_id: string;
      evaluations: Record<string, unknown>;
      _tokens?: number;
    }> = [];
    const failedAgents: Array<{ agent: string; error: string }> = [];

    allResults.forEach((r, i) => {
      if (r.status === "fulfilled") {
        successResults.push(r.value);
      } else {
        failedAgents.push({
          agent: agents[i]?.persona_name ?? `agent-${i}`,
          error: r.reason?.message ?? String(r.reason),
        });
      }
    });

    if (successResults.length === 0) {
      return jsonResponse({ error: "All agent evaluations failed", failures: failedAgents }, 502);
    }

    // ── 5. Compute composite scores ──────────────────────────
    const variantLabels = variantes.map((v) => v.variant_label as string);
    const compositeData = computeCompositeScores(
      successResults as Array<{ evaluations: Record<string, Record<string, unknown>> }>,
      intention,
      variantLabels,
    );

    // ── 6. Generate verdict via LLM ──────────────────────────
    const verdictData = await generateVerdict(
      successResults as Array<Record<string, unknown>>,
      compositeData,
      slot,
      intention,
      geminiKey,
    );

    const verdict = {
      winner: compositeData.winner,
      composite_scores: compositeData.composite_scores,
      confidence: compositeData.confidence,
      ...verdictData,
    };

    // ── 7. Save to panel_evaluations ─────────────────────────
    const totalTokens = successResults.reduce(
      (sum, r) => sum + ((r as Record<string, unknown>)._tokens as number || 0), 0
    );

    const { data: evaluation, error: evalErr } = await sb
      .from("panel_evaluations")
      .insert({
        slot_id,
        intention,
        agent_results: successResults.map(({ agent_name, agent_id, evaluations }) => ({
          agent_name, agent_id, evaluations,
        })),
        composite_scores: compositeData.composite_scores,
        verdict,
        total_tokens_used: totalTokens || null,
      })
      .select()
      .single();

    if (evalErr) {
      return jsonResponse({ error: "Failed to save evaluation", details: evalErr.message }, 500);
    }

    // ── 8. Update agent histories ────────────────────────────
    for (const result of successResults) {
      const agent = agents.find((a) => a.id === result.agent_id);
      if (agent && agent.memory_enabled !== false) {
        const winnerEval = result.evaluations[compositeData.winner] as Record<string, unknown> | undefined;
        const historyEntry = {
          slot_id,
          date: new Date().toISOString(),
          format: slot.format,
          topic: slot.topic,
          winner: compositeData.winner,
          my_sentiment: (winnerEval?.qualitative as Record<string, unknown>)?.sentiment ?? null,
        };
        const updatedHistory = [...((agent.history as unknown[]) || []).slice(-9), historyEntry];
        await sb.from("panel_agents").update({ history: updatedHistory }).eq("id", agent.id);
      }
    }

    // ── 9. Log ────────────────────────────────────────────────
    await sb.from("generation_logs").insert({
      slot_id,
      step: "panel-evaluate",
      input_json: {
        slot_id,
        agents_count: agents.length,
        variants_count: variantes.length,
        intention,
      },
      output_json: {
        success_count: successResults.length,
        failed_count: failedAgents.length,
        winner: compositeData.winner,
        confidence: compositeData.confidence,
      },
      model_used: "gemini-3.1-pro-preview",
      tokens_used: totalTokens || null,
    });

    // ── 10. Return results ───────────────────────────────────
    return jsonResponse({
      ok: true,
      evaluation_id: evaluation?.id,
      agents_evaluated: successResults.length,
      agents_failed: failedAgents.length,
      failures: failedAgents.length > 0 ? failedAgents : undefined,
      verdict,
      agent_results: successResults.map(({ agent_name, evaluations }) => ({
        agent_name, evaluations,
      })),
      tokens_used: totalTokens,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
