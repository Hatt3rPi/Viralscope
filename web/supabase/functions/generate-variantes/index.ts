// Supabase Edge Function: Generate 3 Content Variants (A/B/C) via Gemini
// Deploy: supabase functions deploy generate-variantes
// Env vars needed: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(
  brief: Record<string, unknown>,
  brand: Record<string, unknown>,
  voice: Record<string, unknown>,
  slot: Record<string, unknown>,
  platform: string,
): string {
  const format = (brief.format || slot.format || "post") as string;
  const formatLower = format.toLowerCase();

  // Format-specific generation instructions
  let formatInstructions = "";
  if (formatLower.includes("reel") || formatLower.includes("video")) {
    formatInstructions = `
### Instrucciones para Reels / Video
Genera un guion escena por escena con estos bloques de tiempo:
- **0-3s**: Hook visual + texto gancho (debe detener el scroll)
- **3-15s**: Contexto / problema / situación identificable
- **15-35s**: Valor central / enseñanza / demostración
- **35-40s**: CTA claro + cierre memorable

En la sección "## Guion" usa formato:
\`\`\`
[0-3s] ESCENA 1 — Hook
Visual: ...
Texto en pantalla: ...
Audio/Voz: ...

[3-15s] ESCENA 2 — Contexto
Visual: ...
Texto en pantalla: ...
Audio/Voz: ...
\`\`\`
`;
  } else if (formatLower.includes("carrusel") || formatLower.includes("carousel")) {
    formatInstructions = `
### Instrucciones para Carrusel
Genera contenido slide por slide (mínimo 5, máximo 10 slides):
- **Slide 1**: Portada con hook potente (pregunta, dato impactante, declaración provocadora)
- **Slides 2-N**: Contenido de valor (un punto por slide, texto conciso)
- **Slide final**: CTA + resumen de 1 línea

En la sección "## Slides" usa formato:
\`\`\`
### Slide 1 — Portada
Título: ...
Subtítulo: ...
Visual sugerido: ...

### Slide 2 — [Tema]
Texto principal: ...
Dato/Ejemplo: ...
Visual sugerido: ...
\`\`\`
`;
  } else {
    // Static post / image post
    formatInstructions = `
### Instrucciones para Post estático
Genera caption en 3 versiones de largo dentro de la misma variante:
- **Corto** (~50 palabras): para engagement rápido
- **Medio** (~120 palabras): para educación ligera
- **Largo** (~250 palabras): para storytelling completo

En la sección "## Caption" incluye las 3 versiones claramente separadas.
`;
  }

  return `
Eres el **Generador de Contenido** de un Content Engine profesional para redes sociales.
Tu trabajo: crear 3 variantes completas de contenido para una publicación, cada una con un tono diferente.

---

## Datos de la marca

**Marca:** ${JSON.stringify(brand)}

**Voz y tono:** ${JSON.stringify(voice)}

---

## Brief de contenido

**Tema:** ${brief.topic || slot.topic || "Sin tema definido"}
**Ángulo:** ${brief.angle || "Libre"}
**Dirección del hook:** ${brief.hook_direction || "Libre"}
**Dirección del CTA:** ${brief.cta_direction || "Libre"}
**Formato:** ${format}
**Plataforma:** ${platform}
**Pilar de contenido:** ${brief.pillar || slot.pillar || "General"}
**Objetivo:** ${brief.objective || slot.objective || "Engagement"}
**Intención:** ${brief.intention || slot.intention || "quality"}
**Fecha de publicación:** ${slot.date || "No definida"}
**Notas adicionales:** ${brief.notes || brief.additional_notes || "Ninguna"}

---

## Tu tarea

Genera exactamente 3 variantes:

### Variante A — Emocional / Storytelling
- Tono cálido, personal, narrativo
- Usa anécdotas, metáforas, lenguaje sensorial
- Conecta emocionalmente con la audiencia
- El hook debe generar curiosidad o empatía

### Variante B — Educativo / Datos
- Tono informativo, confiable, basado en evidencia
- Usa datos, estadísticas, pasos claros, tips prácticos
- Posiciona la marca como autoridad
- El hook debe presentar un dato sorprendente o una pregunta que invita a reflexionar

### Variante C — Directo / CTA Pesado
- Tono urgente, accionable, orientado a conversión
- Usa lenguaje directo, beneficios claros, escasez/urgencia
- Múltiples llamados a la acción a lo largo del contenido
- El hook debe crear urgencia o FOMO

${formatInstructions}

---

## Estructura de cada variante

Cada variante debe incluir estas secciones en markdown:

\`\`\`
## Hook
(La primera línea que ve el usuario — debe detener el scroll)

## Caption
(Cuerpo del texto adaptado al formato y plataforma)

## ${formatLower.includes("reel") || formatLower.includes("video") ? "Guion" : formatLower.includes("carrusel") || formatLower.includes("carousel") ? "Slides" : "Caption"}
(Contenido principal según formato — ver instrucciones arriba)

## Hashtags
(5-10 hashtags: mix de branded, nicho y descubrimiento)

## CTA
(Llamado a la acción principal — claro y accionable)

## Alt Text
(Descripción accesible de la imagen/contenido para lectores de pantalla)
\`\`\`

---

## Reglas estrictas

1. **Idioma:** Escribe en español (${brand.language || "es-CL"}). Si la marca tiene anglicismos aceptados, úsalos.
2. **Voz de marca:** Respeta el tono, vocabulario y restricciones definidas en la voz de marca.
3. **Adaptación a plataforma:** Adapta largo, formato y estilo a ${platform}.
4. **No inventes datos:** Si usas estadísticas en Variante B, marca con [dato verificar] las que no sean de conocimiento general.
5. **Hashtags:** Incluye al menos 1 hashtag de marca (si existe) y 4-9 de nicho/descubrimiento.
6. **Emojis:** Usa con moderación según el tono de la marca. Si la marca es formal, evítalos.
7. **Largo del copy:** Respeta las convenciones de ${platform} (IG: ~2200 chars max, TikTok: ~300 chars caption).

---

## Formato de respuesta

Responde EXACTAMENTE con este JSON (sin texto adicional):

{
  "variants": [
    {
      "label": "A",
      "tone": "emocional",
      "copy_md": "## Hook\\n...\\n\\n## Caption\\n...\\n\\n## Guion/Slides\\n...\\n\\n## Hashtags\\n...\\n\\n## CTA\\n...\\n\\n## Alt Text\\n..."
    },
    {
      "label": "B",
      "tone": "educativo",
      "copy_md": "..."
    },
    {
      "label": "C",
      "tone": "directo",
      "copy_md": "..."
    }
  ]
}
`.trim();
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({ error: "Supabase credentials not configured" }, 500);
  }
  if (!geminiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // -----------------------------------------------------------------------
    // 1. Parse input
    // -----------------------------------------------------------------------
    const { slot_id } = await req.json();

    if (!slot_id) {
      return jsonResponse({ error: "slot_id is required" }, 400);
    }

    // -----------------------------------------------------------------------
    // 2. Load slot
    // -----------------------------------------------------------------------
    const { data: slot, error: slotError } = await supabase
      .from("slots")
      .select("*")
      .eq("id", slot_id)
      .single();

    if (slotError || !slot) {
      return jsonResponse(
        { error: "Slot not found", details: slotError?.message },
        404,
      );
    }

    // -----------------------------------------------------------------------
    // 3. Load latest brief for this slot
    // -----------------------------------------------------------------------
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .select("*")
      .eq("slot_id", slot_id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (briefError || !brief) {
      return jsonResponse(
        { error: "Brief not found for this slot", details: briefError?.message },
        404,
      );
    }

    // -----------------------------------------------------------------------
    // 4. Load campaign to get project_id and platform
    // -----------------------------------------------------------------------
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", slot.campaign_id)
      .single();

    if (campaignError || !campaign) {
      return jsonResponse(
        { error: "Campaign not found", details: campaignError?.message },
        404,
      );
    }

    // -----------------------------------------------------------------------
    // 5. Load project brand context
    // -----------------------------------------------------------------------
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", campaign.project_id)
      .single();

    if (projectError || !project) {
      return jsonResponse(
        { error: "Project not found", details: projectError?.message },
        404,
      );
    }

    // -----------------------------------------------------------------------
    // 6. Build the prompt
    // -----------------------------------------------------------------------
    const briefData = brief.brief_yaml || {};
    const brandData = project.brand_yaml || {};
    const voiceData = project.voice_yaml || {};
    const platform = campaign.platform || "instagram";

    const prompt = buildPrompt(briefData, brandData, voiceData, slot, platform);

    // -----------------------------------------------------------------------
    // 7. Call Gemini API
    // -----------------------------------------------------------------------
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
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

    // -----------------------------------------------------------------------
    // 8. Parse Gemini response
    // -----------------------------------------------------------------------
    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      return jsonResponse(
        { error: "Gemini returned no candidates", raw: geminiData },
        502,
      );
    }

    const textContent = candidate.content?.parts?.[0]?.text;
    if (!textContent) {
      return jsonResponse(
        { error: "Gemini returned empty content", raw: candidate },
        502,
      );
    }

    let parsed: { variants: Array<{ label: string; tone?: string; copy_md: string }> };
    try {
      parsed = JSON.parse(textContent);
    } catch {
      return jsonResponse(
        { error: "Failed to parse Gemini JSON response", raw: textContent },
        502,
      );
    }

    if (!parsed.variants || !Array.isArray(parsed.variants) || parsed.variants.length < 3) {
      return jsonResponse(
        { error: "Gemini response missing 3 variants", raw: parsed },
        502,
      );
    }

    // Normalize labels
    const labelMap = ["A", "B", "C"];
    const variants = parsed.variants.slice(0, 3).map((v, i) => ({
      label: labelMap[i],
      tone: v.tone || ["emocional", "educativo", "directo"][i],
      copy_md: v.copy_md || "",
    }));

    // -----------------------------------------------------------------------
    // 9. Delete existing variantes for this slot (idempotent regeneration)
    // -----------------------------------------------------------------------
    const { error: deleteError } = await supabase
      .from("variantes")
      .delete()
      .eq("slot_id", slot_id);

    if (deleteError) {
      console.error("Warning: failed to delete old variantes:", deleteError.message);
      // Continue — insertion may still work if there were no prior rows
    }

    // -----------------------------------------------------------------------
    // 10. Insert 3 new variantes
    // -----------------------------------------------------------------------
    const rows = variants.map((v) => ({
      slot_id,
      variant_label: v.label,
      copy_md: v.copy_md,
      status: "draft",
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("variantes")
      .insert(rows)
      .select();

    if (insertError) {
      return jsonResponse(
        { error: "Failed to insert variantes", details: insertError.message },
        500,
      );
    }

    // -----------------------------------------------------------------------
    // 11. Update slot status
    // -----------------------------------------------------------------------
    const { error: updateError } = await supabase
      .from("slots")
      .update({ status: "generating", current_step: "2-content" })
      .eq("id", slot_id);

    if (updateError) {
      console.error("Warning: failed to update slot status:", updateError.message);
    }

    // -----------------------------------------------------------------------
    // 12. Log to generation_logs
    // -----------------------------------------------------------------------
    const tokensUsed = geminiData.usageMetadata?.totalTokenCount ||
      (geminiData.usageMetadata?.promptTokenCount || 0) +
        (geminiData.usageMetadata?.candidatesTokenCount || 0);

    const { error: logError } = await supabase.from("generation_logs").insert({
      slot_id,
      step: "2-content",
      input_json: {
        prompt_length: prompt.length,
        brief_id: brief.id,
        platform,
        format: briefData.format || slot.format,
      },
      output_json: {
        variants_count: variants.length,
        labels: variants.map((v) => v.label),
        tones: variants.map((v) => v.tone),
      },
      model_used: "gemini-2.5-flash",
      tokens_used: tokensUsed || null,
    });

    if (logError) {
      console.error("Warning: failed to write generation log:", logError.message);
    }

    // -----------------------------------------------------------------------
    // 13. Return result
    // -----------------------------------------------------------------------
    return jsonResponse({
      success: true,
      slot_id,
      variants: inserted,
    });
  } catch (error) {
    return jsonResponse(
      { error: "Internal error", message: String(error) },
      500,
    );
  }
});
