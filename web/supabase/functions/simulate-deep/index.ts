// Supabase Edge Function: Deep Simulation — bridge to Viralscope_sim (Railway)
// Sends project data + variantes to Railway for full multi-agent Instagram simulation
// Deploy: supabase functions deploy simulate-deep
// Env vars needed: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAILWAY_API_URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  const railwayUrl = Deno.env.get("RAILWAY_API_URL") || "https://miroshark-production.up.railway.app";

  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    const { slot_id, persona_count = 50 } = await req.json();
    if (!slot_id) return jsonResponse({ error: "slot_id required" }, 400);

    // ── 1. Load full context from Supabase ────────────────────
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

    // Load variantes
    const { data: variantes } = await sb
      .from("variantes")
      .select("*")
      .eq("slot_id", slot_id)
      .order("variant_label", { ascending: true });

    // Load latest brief
    const { data: brief } = await sb
      .from("briefs")
      .select("*")
      .eq("slot_id", slot_id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    // ── 2. Load or generate pre-built personas ─────────────────
    let prebuilt_personas = project.sim_personas ?? null;

    if (!prebuilt_personas && project.sim_personas_status !== "generating") {
      // No personas cached — trigger on-demand generation and wait
      try {
        const personaRes = await fetch(
          `${supabaseUrl}/functions/v1/persona-generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ project_id: project.id }),
          }
        );
        if (personaRes.ok) {
          // Reload personas from project
          const { data: refreshed } = await sb
            .from("projects")
            .select("sim_personas")
            .eq("id", project.id)
            .single();
          prebuilt_personas = refreshed?.sim_personas ?? null;
        }
      } catch {
        // Fallback: Railway will generate personas from scratch
      }
    }

    // ── 3. Build payload for Railway ──────────────────────────
    const payload = {
      // Pre-built personas (skip generation on Railway if present)
      prebuilt_personas,

      // Project context (8 YAMLs)
      brand_yaml: project.brand_yaml ?? {},
      voice_yaml: project.voice_yaml ?? {},
      audiences_yaml: project.audiences_yaml ?? {},
      pillars_yaml: project.pillars_yaml ?? {},
      competitors_yaml: project.competitors_yaml ?? {},
      platforms_yaml: project.platforms_yaml ?? {},
      metrics_yaml: project.metrics_yaml ?? {},
      calendar_yaml: project.calendar_yaml ?? {},

      // Slot context
      slot: {
        id: slot.id,
        format: slot.format,
        pillar: slot.pillar,
        objective: slot.objective,
        intention: slot.intention,
        topic: slot.topic,
        date: slot.date,
      },

      // Brief
      brief_yaml: brief?.brief_yaml ?? {},

      // Variantes (content being tested)
      variantes: (variantes || []).map((v: Record<string, unknown>) => ({
        variant_label: v.variant_label,
        copy_md: v.copy_md,
        image_url: v.image_url,
        format: slot.format,
        art_direction: (v.art_direction_image_json as Record<string, unknown>)?.art_direction ?? null,
      })),

      // Simulation config
      persona_count,
      simulation_goal: `Predict Instagram engagement for ${(variantes || []).length} content variants about "${slot.topic}" in ${slot.format} format. Determine which variant will perform best for ${slot.intention} intention.`,

      // Callback URL for results
      callback_url: `${supabaseUrl}/functions/v1/simulate-deep-callback`,
      callback_slot_id: slot_id,
      callback_railway_url: railwayUrl,
    };

    // ── 3. Send to Railway ────────────────────────────────────
    const railwayRes = await fetch(`${railwayUrl}/api/instagram/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!railwayRes.ok) {
      const errText = await railwayRes.text();
      return jsonResponse({
        error: "Railway API error",
        status: railwayRes.status,
        details: errText.slice(0, 500),
      }, 502);
    }

    const result = await railwayRes.json();

    // ── 4. Store simulation reference ─────────────────────────
    if (result.simulation_id) {
      await sb.from("generation_logs").insert({
        slot_id,
        step: "simulate-deep",
        input_json: {
          slot_id,
          persona_count,
          railway_simulation_id: result.simulation_id,
        },
        output_json: {
          status: "launched",
          simulation_id: result.simulation_id,
          poll_url: result.poll_url,
        },
        model_used: "viralscope_sim",
        tokens_used: null,
      });
    }

    return jsonResponse({
      ok: true,
      simulation_id: result.simulation_id,
      poll_url: result.poll_url,
      railway_url: railwayUrl,
      message: `Deep simulation launched with ${persona_count} agents`,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
