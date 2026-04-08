// Supabase Edge Function: Brand Wizard
// Conversational wizard that refines brand YAMLs based on research data
// Pattern: identical to estratega-chat (1 question per turn, JSON response)
// Deploy: supabase functions deploy brand-wizard
// Env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

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
    const { project_id, conversation_history } = await req.json();
    if (!project_id) return jsonResponse({ error: "project_id required" }, 400);

    // Load project with all YAMLs + research data
    const { data: project, error: projErr } = await sb
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    if (projErr || !project) {
      return jsonResponse({ error: "Project not found" }, 404);
    }

    const systemPrompt = buildSystemPrompt(project);
    const history: Array<{ role: string; text: string }> = conversation_history || [];

    // Build Gemini multi-turn contents (same pattern as estratega-chat)
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (history.length === 0) {
      contents.push({
        role: "user",
        parts: [{
          text: systemPrompt +
            "\n\n---\nEl usuario acaba de terminar el research automatico de su marca. " +
            "Presentate en 1 oracion como el Estratega de Marca y haz UNA sola pregunta " +
            "para empezar a refinar el perfil. Empieza por las secciones con confianza BAJA.",
        }],
      });
    } else {
      contents.push({ role: "user", parts: [{ text: systemPrompt }] });
      contents.push({ role: "model", parts: [{ text: "Entendido. Tengo el contexto de la marca cargado." }] });
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Call Gemini
    const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
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

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1].trim());
      else return jsonResponse({ error: "Failed to parse JSON" }, 502);
    }

    // Apply yaml_updates to project if present
    const yamlUpdates = parsed.yaml_updates as Record<string, Record<string, unknown>> | undefined;
    if (yamlUpdates && typeof yamlUpdates === "object") {
      const updateFields: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(yamlUpdates)) {
        if (key.endsWith("_yaml") && typeof value === "object") {
          // Deep merge: get current, merge new on top
          const current = (project as Record<string, unknown>)[key] as Record<string, unknown> || {};
          updateFields[key] = { ...current, ...value };
        }
      }
      if (Object.keys(updateFields).length > 0) {
        await sb.from("projects").update(updateFields).eq("id", project_id);
      }
    }

    // If ready, mark onboarding complete and trigger persona generation
    if (parsed.ready) {
      await sb.from("projects").update({ onboarding_status: "complete" }).eq("id", project_id);

      // Fire-and-forget: generate simulation personas in background
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      fetch(`${supabaseUrl}/functions/v1/persona-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ project_id }),
      }).catch(() => {});
    }

    const tokensUsed = geminiData?.usageMetadata?.totalTokenCount ?? null;

    return jsonResponse({
      message: (parsed.message as string) || "",
      quick_responses: (parsed.quick_responses as string[]) || [],
      yaml_updates: yamlUpdates || null,
      section_complete: (parsed.section_complete as string[]) || [],
      progress: (parsed.progress as number) || 0,
      ready: Boolean(parsed.ready),
      tokens_used: tokensUsed,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});

function buildSystemPrompt(project: Record<string, unknown>): string {
  const researchData = project.research_data as Record<string, unknown> || {};
  const confidence = (researchData.raw_confidence || {}) as Record<string, string>;

  return `Eres el ESTRATEGA DE MARCA, un experto en branding y estrategia de contenido.
Tu rol: refinar el perfil de marca que el research automatico genero, llenando gaps y expandiendo las audiencias.

PERSONALIDAD:
- Profesional pero cercano
- Haces 1 pregunta por turno (NO mas)
- Priorizas las secciones con confianza BAJA
- Cuando validas algo, lo confirmas brevemente y sigues
- Ofreces opciones concretas en quick_responses

═══════════════════════════════════════
PERFIL ACTUAL DE LA MARCA (del research)
═══════════════════════════════════════

## Marca
${JSON.stringify(project.brand_yaml, null, 2)}

## Voz
${JSON.stringify(project.voice_yaml, null, 2)}

## Audiencias
${JSON.stringify(project.audiences_yaml, null, 2)}

## Pilares
${JSON.stringify(project.pillars_yaml, null, 2)}

## Competidores
${JSON.stringify(project.competitors_yaml, null, 2)}

## Plataformas
${JSON.stringify(project.platforms_yaml, null, 2)}

## Metricas
${JSON.stringify(project.metrics_yaml, null, 2)}

## Calendario
${JSON.stringify(project.calendar_yaml, null, 2)}

═══════════════════════════════════════
CONFIANZA POR SECCION (del research)
═══════════════════════════════════════
${Object.entries(confidence).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

═══════════════════════════════════════
TU MISION
═══════════════════════════════════════

1. Validar lo que el research encontro (empezando por confianza ALTA — confirmar rapido)
2. Llenar gaps en secciones con confianza BAJA (preguntar al usuario)
3. EXPANDIR audiencias: de los segmentos basicos a 50+ personas detalladas
   - Pregunta por tipos de clientes, sus motivaciones, objeciones, comportamientos
   - Para cada segmento, genera 5-10 personas con nombre, edad, ciudad, profesion, familia, IG behavior
4. Refinar competidores: preguntar por competidores que el research no encontro
5. Validar metricas y KPIs

REGLAS:
- Haz EXACTAMENTE 1 pregunta por turno
- Cuando el usuario responde, actualiza los YAMLs correspondientes en yaml_updates
- Ofrece 2-4 quick_responses siempre
- Despues de ~8-12 turnos, marca ready: true
- progress debe ser un float 0-1 estimando el avance total

FORMATO DE RESPUESTA — JSON estricto:
{
  "message": "string — tu mensaje en markdown",
  "quick_responses": ["Opcion 1", "Opcion 2", "Opcion 3"],
  "yaml_updates": {
    "brand_yaml": { "campo": "valor actualizado" },
    "audiences_yaml": { "personas": [...] }
  },
  "section_complete": ["brand_yaml"],
  "progress": 0.3,
  "ready": false
}

REGLAS:
- yaml_updates es un merge parcial — solo incluye los campos que cambian
- section_complete lista las secciones que consideras finalizadas
- Escribe TODO en espanol
- Devuelve SOLO el JSON`;
}
