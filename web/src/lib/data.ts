import type {
  Project,
  Campaign,
  Slot,
  SlotStatus,
  SlotStep,
  Brief,
  Variante,
  Feedback,
} from "./types";

// Check if Supabase is configured with a real project
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key || url.length < 10) return false;
  const placeholders = ["YOUR_PROJECT", "tu_proyecto", "your-project", "example"];
  return !placeholders.some((p) => url.toLowerCase().includes(p.toLowerCase()));
}

// Dynamic import to avoid loading seed data when Supabase is configured
async function getSeedData() {
  const mod = await import("./seed-data");
  return mod;
}

export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("projects").select("*");
      if (!error && data && data.length > 0) return data as Project[];
    } catch {
      // Supabase failed — fall through to seed data
    }
  }
  const seed = await getSeedData();
  return [seed.seedProject];
}

export async function getProject(slug: string): Promise<Project | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).single();
      if (!error && data) return data as Project;
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedProject.slug === slug ? seed.seedProject : null;
}

export async function getCampaigns(projectId: string): Promise<Campaign[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("campaigns").select("*").eq("project_id", projectId);
      if (!error && data && data.length > 0) return data as Campaign[];
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedCampaign.project_id === projectId ? [seed.seedCampaign] : [];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
      if (!error && data) return data as Campaign;
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedCampaign.id === id ? seed.seedCampaign : null;
}

export async function getSlots(campaignId: string): Promise<Slot[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("slots").select("*").eq("campaign_id", campaignId).order("slot_number");
      if (!error && data && data.length > 0) return data as Slot[];
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedSlot.campaign_id === campaignId ? [seed.seedSlot] : [];
}

export async function getSlot(campaignId: string, slotNumber: number): Promise<Slot | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("slots").select("*").eq("campaign_id", campaignId).eq("slot_number", slotNumber).single();
      if (!error && data) return data as Slot;
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedSlot.campaign_id === campaignId && seed.seedSlot.slot_number === slotNumber ? seed.seedSlot : null;
}

export async function getBrief(slotId: string): Promise<Brief | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("briefs").select("*").eq("slot_id", slotId).order("version", { ascending: false }).limit(1).single();
      if (!error && data) return data as Brief;
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedBrief.slot_id === slotId ? seed.seedBrief : null;
}

export async function getVariantes(slotId: string): Promise<Variante[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("variantes").select("*").eq("slot_id", slotId).order("variant_label");
      if (!error && data && data.length > 0) return data as Variante[];
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedVariantes.filter((v) => v.slot_id === slotId);
}

export async function getFeedback(slotId: string): Promise<Feedback[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.from("feedback").select("*").eq("slot_id", slotId).order("created_at");
      if (!error && data && data.length > 0) return data as Feedback[];
    } catch { /* fall through */ }
  }
  const seed = await getSeedData();
  return seed.seedFeedback.filter((f) => f.slot_id === slotId);
}

export function getSimulationData() {
  return import("./seed-data").then((mod) => mod.simulationData);
}

// ─── Write operations (require Supabase) ───

async function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }
  // Try admin client (service role, bypasses RLS) first
  // Fall back to regular server client if service role key is not available
  try {
    const { createAdminClient } = await import("./supabase/admin");
    return createAdminClient();
  } catch {
    const { createClient } = await import("./supabase/server");
    return createClient();
  }
}

export async function createProject(data: {
  name: string;
  slug: string;
  brand_yaml?: Record<string, unknown>;
  voice_yaml?: Record<string, unknown>;
  audiences_yaml?: Record<string, unknown>;
  pillars_yaml?: Record<string, unknown>;
  competitors_yaml?: Record<string, unknown>;
  platforms_yaml?: Record<string, unknown>;
  metrics_yaml?: Record<string, unknown>;
  calendar_yaml?: Record<string, unknown>;
}): Promise<Project> {
  const supabase = await getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("projects")
    .insert({
      name: data.name,
      slug: data.slug,
      brand_yaml: data.brand_yaml || {},
      voice_yaml: data.voice_yaml || {},
      audiences_yaml: data.audiences_yaml || {},
      pillars_yaml: data.pillars_yaml || {},
      competitors_yaml: data.competitors_yaml || {},
      platforms_yaml: data.platforms_yaml || {},
      metrics_yaml: data.metrics_yaml || {},
      calendar_yaml: data.calendar_yaml || {},
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Project;
}

export async function createCampaign(data: {
  project_id: string;
  name: string;
  slug: string;
  period_start: string;
  period_end: string;
  platform: string;
  objectives_json?: Record<string, unknown>;
}): Promise<Campaign> {
  const supabase = await getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("campaigns")
    .insert({
      project_id: data.project_id,
      name: data.name,
      slug: data.slug,
      period_start: data.period_start,
      period_end: data.period_end,
      platform: data.platform,
      objectives_json: data.objectives_json || {},
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Campaign;
}

export async function createSlot(data: {
  campaign_id: string;
  slot_number: number;
  date: string;
  format: string;
  pillar: string;
  objective: string;
  intention?: string;
  topic: string;
}): Promise<Slot> {
  const supabase = await getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("slots")
    .insert({
      campaign_id: data.campaign_id,
      slot_number: data.slot_number,
      date: data.date,
      format: data.format,
      pillar: data.pillar,
      objective: data.objective,
      intention: data.intention || "quality",
      topic: data.topic,
      status: "draft",
      current_step: "1-brief",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Slot;
}

export async function upsertBrief(
  slotId: string,
  briefYaml: Record<string, unknown>,
  version: number = 1
): Promise<Brief> {
  const supabase = await getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("briefs")
    .insert({
      slot_id: slotId,
      brief_yaml: briefYaml,
      version,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Brief;
}

export async function approveBrief(briefId: string, approvedBy: string): Promise<void> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase
    .from("briefs")
    .update({ approved_by: approvedBy, approved_at: new Date().toISOString() })
    .eq("id", briefId);
  if (error) throw new Error(error.message);
}

export async function deleteVariantesForSlot(slotId: string): Promise<void> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase
    .from("variantes")
    .delete()
    .eq("slot_id", slotId);
  if (error) throw new Error(error.message);
}

export async function insertVariante(
  slotId: string,
  label: "A" | "B" | "C",
  data: {
    copy_md: string;
    art_direction_image_json?: Record<string, unknown>;
    art_direction_video_json?: Record<string, unknown>;
    status?: string;
  }
): Promise<Variante> {
  const supabase = await getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("variantes")
    .insert({
      slot_id: slotId,
      variant_label: label,
      copy_md: data.copy_md,
      art_direction_image_json: data.art_direction_image_json || {},
      art_direction_video_json: data.art_direction_video_json || {},
      status: data.status || "draft",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Variante;
}

export async function updateVarianteArt(
  varianteId: string,
  artImageJson: Record<string, unknown>,
  artVideoJson: Record<string, unknown>
): Promise<void> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase
    .from("variantes")
    .update({
      art_direction_image_json: artImageJson,
      art_direction_video_json: artVideoJson,
      status: "art_review",
    })
    .eq("id", varianteId);
  if (error) throw new Error(error.message);
}

export async function updateSlotStatus(
  slotId: string,
  status: SlotStatus,
  currentStep: SlotStep
): Promise<void> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase
    .from("slots")
    .update({ status, current_step: currentStep })
    .eq("id", slotId);
  if (error) throw new Error(error.message);
}

export async function updateSlotSimulationMd(
  slotId: string,
  simulationMd: string
): Promise<void> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase
    .from("slots")
    .update({ simulation_md: simulationMd })
    .eq("id", slotId);
  if (error) throw new Error(error.message);
}

export async function addFeedback(data: {
  slot_id: string;
  variante_id?: string;
  user_id: string;
  user_email?: string;
  step: "brief" | "content" | "art" | "simulation";
  comment: string;
}): Promise<Feedback> {
  const supabase = await getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("feedback")
    .insert({
      slot_id: data.slot_id,
      variante_id: data.variante_id || null,
      user_id: data.user_id,
      user_email: data.user_email,
      step: data.step,
      comment: data.comment,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Feedback;
}

export async function addGenerationLog(data: {
  slot_id: string;
  step: string;
  input_json: Record<string, unknown>;
  output_json: Record<string, unknown>;
  model_used: string;
  tokens_used?: number;
}): Promise<void> {
  const supabase = await getSupabaseAdmin();
  const { error } = await supabase.from("generation_logs").insert(data);
  if (error) throw new Error(error.message);
}
