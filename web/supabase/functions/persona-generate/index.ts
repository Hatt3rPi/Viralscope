// Supabase Edge Function: Generate simulation personas for a project
// Called once after onboarding completes. Results cached in projects.sim_personas.
// Deploy: supabase functions deploy persona-generate

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
    const { project_id } = await req.json();
    if (!project_id) return jsonResponse({ error: "project_id required" }, 400);

    // Load project
    const { data: project, error: projErr } = await sb
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .single();

    if (projErr || !project) {
      return jsonResponse({ error: "Project not found", details: projErr?.message }, 404);
    }

    // Mark as generating
    await sb
      .from("projects")
      .update({ sim_personas_status: "generating" })
      .eq("id", project_id);

    // Call Railway to generate personas (~30-60s)
    const railwayRes = await fetch(`${railwayUrl}/api/instagram/generate-personas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_yaml: project.brand_yaml ?? {},
        voice_yaml: project.voice_yaml ?? {},
        audiences_yaml: project.audiences_yaml ?? {},
        pillars_yaml: project.pillars_yaml ?? {},
        competitors_yaml: project.competitors_yaml ?? {},
        platforms_yaml: project.platforms_yaml ?? {},
        metrics_yaml: project.metrics_yaml ?? {},
        calendar_yaml: project.calendar_yaml ?? {},
        persona_count: 50,
      }),
    });

    if (!railwayRes.ok) {
      const errText = await railwayRes.text();
      await sb
        .from("projects")
        .update({ sim_personas_status: "error" })
        .eq("id", project_id);
      return jsonResponse({
        error: "Railway persona generation failed",
        status: railwayRes.status,
        details: errText.slice(0, 500),
      }, 502);
    }

    const result = await railwayRes.json();

    if (!result.success || !result.personas) {
      await sb
        .from("projects")
        .update({ sim_personas_status: "error" })
        .eq("id", project_id);
      return jsonResponse({ error: "No personas returned", details: result.error }, 500);
    }

    // Store personas in project
    await sb
      .from("projects")
      .update({
        sim_personas: result.personas,
        sim_personas_status: "ready",
      })
      .eq("id", project_id);

    // Log generation
    await sb.from("generation_logs").insert({
      slot_id: null,
      step: "persona-generate",
      input_json: { project_id, persona_count: 50 },
      output_json: { count: result.count, status: "ready" },
      model_used: "viralscope_sim",
      tokens_used: null,
    });

    return jsonResponse({
      ok: true,
      count: result.count,
      message: `${result.count} personas generated and cached`,
    });
  } catch (error) {
    return jsonResponse({ error: "Internal error", message: String(error) }, 500);
  }
});
