// Supabase Edge Function: Prepare MiroFish Simulation Seed Document
// Deploy: supabase functions deploy prepare-mirofish
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (!geminiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    const { slot_id } = await req.json();

    if (!slot_id) {
      return jsonResponse({ error: "slot_id required" }, 400);
    }

    // ── 1. Read all variantes for this slot ────────────────────
    const { data: variantes, error: varErr } = await sb
      .from("variantes")
      .select("*")
      .eq("slot_id", slot_id)
      .order("variant_label", { ascending: true });

    if (varErr) {
      return jsonResponse(
        { error: "Failed to read variantes", details: varErr.message },
        500,
      );
    }

    if (!variantes || variantes.length === 0) {
      return jsonResponse(
        { error: "No variantes found for this slot" },
        404,
      );
    }

    // ── 2. Read slot + brief + campaign + project ──────────────
    const { data: slot, error: slotErr } = await sb
      .from("slots")
      .select("*, campaign:campaigns(*, project:projects(*))")
      .eq("id", slot_id)
      .single();

    if (slotErr || !slot) {
      return jsonResponse(
        { error: "Slot not found", details: slotErr?.message },
        404,
      );
    }

    const campaign = slot.campaign;
    const project = campaign?.project;

    if (!project) {
      return jsonResponse({ error: "Project context not found" }, 404);
    }

    const { data: brief } = await sb
      .from("briefs")
      .select("*")
      .eq("slot_id", slot_id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    // ── 3. Build Gemini prompt ─────────────────────────────────
    const audiencesYaml = project.audiences_yaml ?? {};
    const metricsYaml = project.metrics_yaml ?? {};
    const brandName = project.brand_yaml?.name ?? project.name;
    const platform = campaign.platform ?? "instagram";

    const variantSummaries = variantes
      .map((v: Record<string, unknown>) => {
        const artImage = v.art_direction_image_json as Record<string, unknown> | null;
        const artVideo = v.art_direction_video_json as Record<string, unknown> | null;
        const artDir = artImage?.art_direction as Record<string, unknown> | undefined;
        return `### Variant ${v.variant_label}
- **Copy:** ${(v.copy_md as string)?.slice(0, 500) || "N/A"}
- **Image concept:** ${artDir?.concept ?? "Not generated yet"}
- **Image style:** ${artDir?.style ?? "N/A"}
- **Video concept:** ${(artVideo?.art_direction as Record<string, unknown>)?.concept ?? "Not generated yet"}
- **Status:** ${v.status}`;
      })
      .join("\n\n");

    const systemPrompt = `You are an "Analista de Viralizacion" — a virality simulation analyst.
Your job: produce a comprehensive seed document (in English, Markdown format) that will be fed into MiroFish for multi-agent viral content simulation.

The document must be self-contained, structured, and include everything a simulation engine needs to evaluate content variants for viral potential.

## Output Rules
- Write EVERYTHING in English (even though source data may be in Spanish)
- Use Markdown with clear section headers
- Be specific, quantitative where possible
- Include actionable evaluation criteria
- The document should be 800-1500 words
- Do NOT include any JSON — only Markdown text`;

    const userPrompt = `Generate a MiroFish simulation seed document for the following content slot.

## Brand
- Name: ${brandName}
- Positioning: ${project.brand_yaml?.positioning ?? "N/A"}
- Niche: ${project.brand_yaml?.niche ?? "N/A"}
- Market: ${project.brand_yaml?.market?.country ?? "N/A"} / ${project.brand_yaml?.market?.language ?? "N/A"}

## Campaign
- Name: ${campaign.name}
- Platform: ${platform}
- Period: ${campaign.period_start} to ${campaign.period_end}
- Objectives: ${JSON.stringify(campaign.objectives_json)}

## Slot #${slot.slot_number}
- Date: ${slot.date}
- Format: ${slot.format}
- Pillar: ${slot.pillar}
- Objective: ${slot.objective}
- Topic: ${slot.topic}
- Intention: ${slot.intention}

## Brief
${brief ? JSON.stringify(brief.brief_yaml, null, 2) : "No brief available."}

## Content Variants
${variantSummaries}

## Audience Definitions (from audiences_yaml)
${JSON.stringify(audiencesYaml, null, 2)}

## Metrics Framework (from metrics_yaml)
${JSON.stringify(metricsYaml, null, 2)}

---

Now generate the MiroFish seed document. Structure it with these sections:

1. **Content Overview** — Slot context, brand, campaign goal
2. **Variant Comparison Matrix** — A/B/C side-by-side with hooks, copy highlights, visual approach
3. **Target Audience Personas** — Mapped from audiences_yaml, with behavioral patterns on ${platform}
4. **Platform Context: ${platform.charAt(0).toUpperCase() + platform.slice(1)}** — Algorithm signals, engagement patterns, optimal posting insights for this format
5. **Simulation Evaluation Criteria** — Score each variant on:
   - Attention capture (first 1.5 seconds / first slide)
   - Emotional resonance (does it trigger a feeling?)
   - Shareability (would someone send this to a friend?)
   - Brand fit (coherence with brand identity and voice)
   - CTA clarity (is the desired action obvious?)
   - Memorability (will they remember this tomorrow?)
   - Scroll-stop power (visual distinctiveness in feed)
6. **Cross-Platform Mapping Hints** — How this content could be adapted for Twitter/X, Reddit, TikTok, including equivalent audience segments on each platform
7. **Risk Flags** — Potential issues (cultural sensitivity, brand-off moments, fatigue signals)
8. **Simulation Instructions** — Specific instructions for MiroFish agents on what to evaluate and how to score`;

    // ── 4. Call Gemini API ──────────────────────────────────────
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 1.0,
          thinkingConfig: { thinkingLevel: "medium" },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return jsonResponse(
        {
          error: "Gemini API error",
          status: geminiResponse.status,
          details: errText,
        },
        502,
      );
    }

    const geminiData = await geminiResponse.json();

    const simulationMd =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!simulationMd) {
      return jsonResponse(
        { error: "Gemini returned empty response", raw: geminiData },
        502,
      );
    }

    // ── 5. Save to slots.simulation_md ─────────────────────────
    const { error: updateErr } = await sb
      .from("slots")
      .update({ simulation_md: simulationMd })
      .eq("id", slot_id);

    if (updateErr) {
      return jsonResponse(
        {
          error: "Failed to save simulation_md to slot",
          details: updateErr.message,
        },
        500,
      );
    }

    // ── 6. Log to generation_logs ──────────────────────────────
    const tokensUsed =
      geminiData?.usageMetadata?.totalTokenCount ??
      geminiData?.usageMetadata?.candidatesTokenCount ??
      null;

    await sb.from("generation_logs").insert({
      slot_id,
      step: "prepare-mirofish",
      input_json: {
        slot_id,
        slot_context: {
          slot_number: slot.slot_number,
          format: slot.format,
          pillar: slot.pillar,
          topic: slot.topic,
        },
        variant_count: variantes.length,
        variant_labels: variantes.map(
          (v: Record<string, unknown>) => v.variant_label,
        ),
      },
      output_json: { simulation_md_length: simulationMd.length },
      model_used: "gemini-3.1-pro-preview",
      tokens_used: tokensUsed,
    });

    // ── 7. Return the Markdown document ────────────────────────
    return jsonResponse({
      ok: true,
      simulation_md: simulationMd,
    });
  } catch (error) {
    return jsonResponse(
      { error: "Internal error", message: String(error) },
      500,
    );
  }
});
