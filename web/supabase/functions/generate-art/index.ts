// Supabase Edge Function: Generate Art Direction via Gemini (Director de Arte)
// Deploy: supabase functions deploy generate-art
// Env vars needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Carousel mode: slide-by-slide prompt generation with flash-lite (fast, no timeout)
// Other formats: single-call with gemini-pro (original behavior)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_PRO =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent";
const GEMINI_FLASH_LITE =
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

// ── Parse slides from copy_md ─────────────────────────────────
function parseSlides(copyMd: string): { number: number; content: string }[] {
  const slideRegex = /### Slide (\d+)[^\n]*\n([\s\S]*?)(?=### Slide \d|## Hashtags|## CTA|## Alt|$)/gi;
  const slides: { number: number; content: string }[] = [];
  let match;
  while ((match = slideRegex.exec(copyMd)) !== null) {
    slides.push({ number: parseInt(match[1]), content: match[2].trim() });
  }
  return slides;
}

// ── Generate prompt for a single slide via flash-lite ──────────
async function generateSlidePrompt(
  geminiKey: string,
  slideContent: string,
  slideNumber: number,
  totalSlides: number,
  brandContext: string,
  visualRules: string,
): Promise<{ slide_number: number; concept: string; prompt_string: string; negative_prompt: string; reference_image_urls?: string[] }> {
  const prompt = `Generate a single image prompt for slide ${slideNumber}/${totalSlides} of an Instagram carousel.

## Brand
${brandContext}

## Slide ${slideNumber} Content
${slideContent}

## Design Rules
${visualRules}

CRITICAL: The prompt_string must NEVER include instructions to draw dimension markers, pixel measurements, arrows, rulers, or safe zone indicators on the image. Those are composition guidelines, not visual elements.

Return ONLY a JSON: {"concept": "one line description", "prompt_string": "full image generation prompt including text rendering on the image, 80-150 words. Must specify 3:4 vertical portrait aspect ratio.", "negative_prompt": "what to avoid, must include: dimension markers, pixel measurements, rulers, arrows, safe zone indicators"}`;

  const res = await fetch(`${GEMINI_FLASH_LITE}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.8 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini flash-lite error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.find((p: { text?: string }) => typeof p.text === "string")?.text || "";

  const parsed = JSON.parse(text);
  return {
    slide_number: slideNumber,
    concept: parsed.concept || `Slide ${slideNumber}`,
    prompt_string: parsed.prompt_string || "",
    negative_prompt: parsed.negative_prompt || "plastic skin, AI look, uncanny valley",
  };
}

// ── Process slides in batches of N ────────────────────────────
async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<unknown>,
): Promise<unknown[]> {
  const results: unknown[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
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
    const { slot_id, variant_label } = await req.json();

    if (!slot_id || !variant_label) {
      return jsonResponse({ error: "slot_id and variant_label required" }, 400);
    }

    // ── 1. Read the variante ───────────────────────────────────
    const { data: variante, error: varErr } = await sb
      .from("variantes")
      .select("*")
      .eq("slot_id", slot_id)
      .eq("variant_label", variant_label)
      .single();

    if (varErr || !variante) {
      return jsonResponse(
        { error: "Variante not found", details: varErr?.message },
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

    // ── 2b. Load template, visual specs & brand assets ─────────
    const toneMap: Record<string, string> = { A: "emocional", B: "educativo", C: "directo" };
    const variantTone = toneMap[variant_label] || "emocional";

    const { data: ptRows } = await sb
      .from("project_templates")
      .select("*, template:content_templates(*)")
      .eq("project_id", project.id)
      .eq("is_default", true);

    const matchedPt = (ptRows || []).find(
      (pt: { template?: { format?: string; tone?: string; is_active?: boolean } }) =>
        pt.template?.format === slot.format && pt.template?.tone === variantTone && pt.template?.is_active,
    );
    const template = matchedPt?.template ?? null;
    const templateOverrides = matchedPt?.overrides_json ?? {};

    const { data: visualSpecs } = await sb
      .from("visual_specs")
      .select("*")
      .eq("project_id", project.id)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    const { data: brandAssets } = await sb
      .from("brand_assets")
      .select("*")
      .eq("project_id", project.id)
      .eq("is_active", true);

    // ── 3. Build brand context ────────────────────────────────
    const brandVisual = project.brand_yaml?.visual ?? {};
    const brandName = project.brand_yaml?.name ?? project.name;
    const brandStyle = brandVisual.style ?? "";
    const brandMood = brandVisual.mood ?? "";
    const brandColors = brandVisual.colors ?? {};
    const brandRestrictions = project.brand_yaml?.restrictions ?? {};

    const brandContext = `- Name: ${brandName}
- Style: ${brandStyle}
- Mood: ${brandMood}
- Colors: primary=${brandColors.primary ?? "N/A"}, secondary=${brandColors.secondary ?? "N/A"}, accent=${brandColors.accent ?? "N/A"}, background=${brandColors.background ?? "N/A"}
- Typography: headings=${brandVisual.typography?.headings ?? "N/A"}, body=${brandVisual.typography?.body ?? "N/A"}
- Never do: ${JSON.stringify(brandRestrictions.never_do ?? [])}`;

    const visualRules = `- Aspect ratio: 3:4 portrait (taller than wide). CRITICAL: generate a VERTICAL image, not square.
- Keep all text and key elements away from the edges of the image. Leave generous margins on all sides.
- DO NOT draw dimension markers, arrows, rulers, or pixel measurements on the image. No "180px" or "50px" labels.
- Slide text (title, body) MUST be rendered directly on the image as part of the design
- Title: bold, large, high contrast against background
- Body: smaller, clear readable font
- Max 2 fonts, max 3 colors
- Style: warm editorial, natural lighting, organic grain, slight asymmetry
- Anti-AI: natural skin texture, tactile textures (linen, paper, wood), no plastic skin
${template ? `- Template: ${template.prompt_injection}` : ""}
${visualSpecs?.length ? visualSpecs.map((s: { prompt_text: string }) => `- ${s.prompt_text}`).filter(Boolean).join("\n") : ""}`;

    // ══════════════════════════════════════════════════════════
    // CAROUSEL: slide-by-slide with flash-lite
    // ══════════════════════════════════════════════════════════
    if (slot.format === "carrusel") {
      const slides = parseSlides(variante.copy_md || "");

      if (slides.length === 0) {
        return jsonResponse({ error: "No slides found in copy_md" }, 400);
      }

      // Pick a brand logo for the closing slide (prefer color, fallback to white)
      const logos = (brandAssets ?? []).filter((a: { asset_type: string }) => a.asset_type === "logo");
      const logoColor = logos.find((a: { name: string }) => a.name?.toLowerCase().includes("color")) ?? logos[0];
      const logoAsset = logoColor as { public_url?: string; name?: string } | undefined;

      // Generate LLM prompts only for non-closing slides when logo exists
      const lastSlideNumber = slides[slides.length - 1].number;
      const slidesForLLM = logoAsset ? slides.slice(0, -1) : slides;

      const slideResults: { slide_number: number; concept: string; prompt_string: string; negative_prompt: string; reference_image_urls?: string[] }[] = [];

      const batchResults = await processInBatches(slidesForLLM, 3, (slide) =>
        generateSlidePrompt(
          geminiKey,
          slide.content,
          slide.number,
          slides.length,
          brandContext,
          visualRules,
        ),
      );

      for (const result of batchResults) {
        if ((result as PromiseSettledResult<unknown>).status === "fulfilled") {
          slideResults.push((result as PromiseFulfilledResult<typeof slideResults[0]>).value);
        }
      }

      // Deterministic closing slide with brand logo
      if (logoAsset?.public_url) {
        const lastSlideContent = slides[slides.length - 1].content;
        slideResults.push({
          slide_number: lastSlideNumber,
          concept: "Closing brand slide with logo",
          prompt_string: `Final closing slide of a 3:4 vertical Instagram carousel. Warm editorial photograph background with muted earth tones (amber, cream, soft purple accent), soft natural afternoon light, Kinfolk magazine aesthetic. The provided brand logo image must appear prominently centered with generous whitespace around it — preserve its exact shape, proportions and colors, do NOT recreate or restyle it. Include a short elegant tagline text below the logo derived from this content: "${lastSlideContent.replace(/"/g, "'").slice(0, 200)}". Clean minimal composition, Instagram-ready.`,
          negative_prompt: "distorted logo, recreated logo, stylized logo, multiple logos, text on logo, dimension markers, pixel measurements, rulers, arrows, safe zone indicators, cartoon, clip art",
          reference_image_urls: [logoAsset.public_url],
        });
      }

      // Build carousel JSON (same schema the frontend expects)
      const art_direction_image_json = {
        type: "carousel",
        generator: "nanobanana_2",
        settings: { aspect_ratio: "3:4", quality: "2k_unlimited" },
        art_direction: {
          style: brandStyle || "warm editorial",
          mood: brandMood || "emotional, warm",
          color_palette: {
            dominant: brandColors.primary || "#F5E6D3",
            accents: [brandColors.accent || "#D4956A"],
            temperature: "warm",
          },
          anti_ai_directives: ["organic grain", "natural skin texture", "slight asymmetry"],
          reference_styles: ["Kinfolk editorial", "analog film"],
        },
        slides: slideResults.sort((a, b) => a.slide_number - b.slide_number),
      };

      // Minimal video placeholder for carousels
      const art_direction_video_json = {
        type: "video",
        generator: "manual",
        settings: { aspect_ratio: "9:16", duration_seconds: 15 },
        art_direction: {
          concept: `Video version of carousel: ${brief?.brief_yaml?.topic || slot.topic || "content"}`,
          style: brandStyle || "warm editorial",
          mood: brandMood || "emotional",
          scenes: [{ scene_number: 1, description: "Derived from carousel slides", duration_seconds: 15 }],
        },
        prompt_string: "Video to be created manually from carousel content.",
        negative_prompt: "text on screen, subtitles",
      };

      // Save
      const { error: updateErr } = await sb
        .from("variantes")
        .update({ art_direction_image_json, art_direction_video_json, status: "art_review" })
        .eq("id", variante.id);

      if (updateErr) {
        return jsonResponse({ error: "Failed to update variante", details: updateErr.message }, 500);
      }

      await sb.from("slots").update({ status: "art_review", current_step: "3-art" }).eq("id", slot_id);

      await sb.from("generation_logs").insert({
        slot_id,
        step: "generate-art",
        input_json: { slot_id, variant_label, mode: "carousel-slide-by-slide", slides_parsed: slides.length, slides_generated: slideResults.length },
        output_json: { art_direction_image_json },
        model_used: "gemini-3.1-flash-lite-preview",
        tokens_used: null,
      });

      return jsonResponse({
        ok: true,
        variant_label,
        mode: "carousel-slide-by-slide",
        slides_parsed: slides.length,
        slides_generated: slideResults.length,
        art_direction_image_json,
        art_direction_video_json,
      });
    }

    // ══════════════════════════════════════════════════════════
    // NON-CAROUSEL: original single-call with gemini-pro
    // ══════════════════════════════════════════════════════════
    const systemPrompt = `You are an elite Art Director ("Director de Arte") for social media content.
Your mission: generate TWO art direction JSON objects — one for IMAGE and one for VIDEO — for a single content variant.

## Brand Context
${brandContext}

${template ? `## Template de Layout (OBLIGATORIO)
${template.prompt_injection}

## Reglas de Composición del Template
${JSON.stringify(templateOverrides && Object.keys(templateOverrides).length > 0 ? { ...template.composition_rules, ...templateOverrides } : template.composition_rules)}
` : ""}${visualSpecs && visualSpecs.length > 0 ? `## Especificaciones Visuales del Proyecto (OBLIGATORIO)
${visualSpecs.map((s: { prompt_text: string }) => s.prompt_text).filter(Boolean).join("\n")}
` : ""}${brandAssets && brandAssets.length > 0 ? `## Assets de Marca Disponibles
${brandAssets.map((a: { name: string; asset_type: string; public_url: string; description?: string }) => `- ${a.name} (${a.asset_type}): ${a.public_url} — ${a.description || "sin restricciones"}`).join("\n")}

IMPORTANTE: Si hay assets de marca, referéncialos en un campo "brand_assets_overlay" dentro del JSON de art_direction_image_json. Cada entrada debe tener: asset_url, placement (posición), slide_numbers (array, -1 = último), size_hint.
` : ""}
## Anti-AI Directives (CRITICAL)
Every piece of art direction MUST embed anti-AI aesthetics:
- Include organic imperfections: dust, grain, micro scratches, slight asymmetry
- Natural lighting with realistic falloff — no perfectly even studio light
- Reference real photography styles: Kinfolk editorial, Cereal Magazine, analog film looks
- Avoid: plastic skin, hyper-symmetry, uncanny valley expressions, oversaturated neon colors
- Textures should feel tactile: linen, paper grain, canvas, weathered wood
- Human subjects need micro-expressions, imperfect posture, natural skin texture with pores

## Format Rules
- Content format: ${slot.format} (e.g., reel, carrusel, single)
- Platform: ${campaign.platform ?? "instagram"}
- The prompt_string in each JSON must be a ready-to-use prompt optimized for NanoBanana 2 image generation
- The negative_prompt MUST always include: "text on screen, subtitles, captions, written words, perfect symmetry, plastic skin, AI look, uncanny valley, oversaturated"
- ASPECT RATIO: ${slot.format === "reel" || slot.format === "story" ? "9:16 (vertical)" : "1:1 (square)"}

## Output Schema — SINGLE IMAGE
Return a JSON object with exactly two keys:

{
  "art_direction_image_json": {
    "type": "image",
    "generator": "nanobanana_2",
    "settings": { "aspect_ratio": "${slot.format === "reel" || slot.format === "story" ? "9:16" : "1:1"}", "count": 8, "quality": "2k_unlimited" },
    "art_direction": {
      "concept": "one-line concept for the image",
      "style": "visual style description",
      "mood": "emotional tone",
      "color_palette": {
        "dominant": "#hex",
        "accents": ["#hex", "#hex"],
        "temperature": "warm/cool/neutral"
      },
      "composition": {
        "framing": "close-up/medium/wide/etc",
        "rule": "rule of thirds/golden ratio/center/etc",
        "focal_point": "what draws the eye",
        "negative_space": "how negative space is used"
      },
      "lighting": {
        "type": "natural/studio/mixed/etc",
        "direction": "side/front/back/overhead/etc",
        "quality": "soft/hard/diffused/etc"
      },
      "subjects": [
        {
          "description": "detailed subject description",
          "expression": "facial expression or mood",
          "action": "what the subject is doing"
        }
      ],
      "environment": {
        "setting": "where the scene takes place",
        "props": ["prop1", "prop2"],
        "textures": ["texture1", "texture2"]
      },
      "anti_ai_directives": ["specific imperfections to include"],
      "reference_styles": ["Kinfolk editorial", "other references"]
    },
    "prompt_string": "Complete NanoBanana-optimized prompt. 150-300 words.",
    "negative_prompt": "text on screen, subtitles, captions, written words, perfect symmetry, plastic skin, AI look, uncanny valley, oversaturated, [plus brand-specific negatives]"
  },
  "art_direction_video_json": {
    "type": "video",
    "generator": "manual",
    "settings": { "aspect_ratio": "9:16", "duration_seconds": 15 },
    "art_direction": {
      "concept": "one-line concept for the video",
      "style": "visual style description",
      "mood": "emotional tone",
      "color_palette": {
        "dominant": "#hex",
        "accents": ["#hex", "#hex"],
        "temperature": "warm/cool/neutral"
      },
      "scenes": [
        {
          "scene_number": 1,
          "duration_seconds": 3,
          "description": "what happens in this scene",
          "framing": "close-up/medium/wide",
          "camera_movement": "static/pan/zoom/tracking",
          "subjects": [{ "description": "...", "action": "..." }],
          "transition": "cut/dissolve/swipe"
        }
      ],
      "lighting": {
        "type": "natural/studio/mixed",
        "direction": "side/front/back",
        "quality": "soft/hard/diffused"
      },
      "environment": {
        "setting": "where",
        "props": [],
        "textures": []
      },
      "audio_direction": {
        "music_mood": "upbeat/calm/emotional/etc",
        "sound_effects": [],
        "pacing": "fast/medium/slow"
      },
      "anti_ai_directives": ["specific imperfections"],
      "reference_styles": ["editorial references"]
    },
    "prompt_string": "A compiled prompt describing the video for reference (even though generation is manual).",
    "negative_prompt": "text on screen, subtitles, captions, written words, perfect symmetry, plastic skin"
  }
}`;

    const userPrompt = `Generate art direction for this content variant:

## Slot Context
- Slot #${slot.slot_number} — Date: ${slot.date}
- Format: ${slot.format}
- Pillar: ${slot.pillar}
- Objective: ${slot.objective}
- Topic: ${slot.topic}
- Intention: ${slot.intention}

## Brief
${brief ? JSON.stringify(brief.brief_yaml, null, 2) : "No brief available — infer from slot context."}

## Variant "${variant_label}"
Copy/content:
${variante.copy_md || "No copy yet — infer from brief and slot context."}

Generate the two art direction JSONs now. The image art direction must be highly specific and ready for NanoBanana 2 generation. The video art direction should have 3-5 scenes covering a ${slot.format === "reel" ? "15-second vertical video" : "short video"}.`;

    // ── Call Gemini Pro ────────────────────────────────────────
    const geminiResponse = await fetch(`${GEMINI_PRO}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.0,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return jsonResponse(
        { error: "Gemini API error", status: geminiResponse.status, details: errText },
        502,
      );
    }

    const geminiData = await geminiResponse.json();

    const allParts = geminiData?.candidates?.[0]?.content?.parts ?? [];
    const textPart = allParts.find((p: Record<string, unknown>) => typeof p.text === "string" && !p.thoughtSignature);
    const rawText = textPart?.text || allParts[allParts.length - 1]?.text || "";

    if (!rawText) {
      return jsonResponse(
        { error: "Gemini returned empty response", raw: geminiData },
        502,
      );
    }

    let parsed: {
      art_direction_image_json: Record<string, unknown>;
      art_direction_video_json: Record<string, unknown>;
    };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      return jsonResponse(
        { error: "Failed to parse Gemini JSON", raw_text: rawText },
        502,
      );
    }

    const { art_direction_image_json, art_direction_video_json } = parsed;

    if (!art_direction_image_json || !art_direction_video_json) {
      return jsonResponse(
        {
          error: "Gemini response missing required keys",
          keys: Object.keys(parsed),
        },
        502,
      );
    }

    // ── Save & respond ────────────────────────────────────────
    const { error: updateErr } = await sb
      .from("variantes")
      .update({
        art_direction_image_json,
        art_direction_video_json,
        status: "art_review",
      })
      .eq("id", variante.id);

    if (updateErr) {
      return jsonResponse(
        { error: "Failed to update variante", details: updateErr.message },
        500,
      );
    }

    await sb
      .from("slots")
      .update({ status: "art_review", current_step: "3-art" })
      .eq("id", slot_id);

    const tokensUsed =
      geminiData?.usageMetadata?.totalTokenCount ??
      geminiData?.usageMetadata?.candidatesTokenCount ??
      null;

    await sb.from("generation_logs").insert({
      slot_id,
      step: "generate-art",
      input_json: { slot_id, variant_label, slot_context: slot, brief_yaml: brief?.brief_yaml, template_slug: template?.slug ?? null, visual_specs_count: visualSpecs?.length ?? 0, brand_assets_count: brandAssets?.length ?? 0 },
      output_json: { art_direction_image_json, art_direction_video_json },
      model_used: "gemini-3.1-pro-preview",
      tokens_used: tokensUsed,
    });

    return jsonResponse({
      ok: true,
      variant_label,
      art_direction_image_json,
      art_direction_video_json,
    });
  } catch (error) {
    return jsonResponse(
      { error: "Internal error", message: String(error) },
      500,
    );
  }
});
