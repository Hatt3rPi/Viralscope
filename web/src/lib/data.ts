import type {
  Project,
  Campaign,
  Slot,
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
