"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProject,
  createCampaign,
  createSlot,
  createSlotsAndBriefsBulk,
  approveBrief,
  updateSlotStatus,
  addFeedback,
  updateSlotSimulationMd,
  updateProjectYamls,
  updateProjectOnboardingStatus,
  assignDefaultTemplates,
  toggleProjectTemplate,
  removeProjectTemplate,
  createBrandAsset,
  deleteBrandAsset,
  upsertVisualSpec,
  deleteVisualSpec,
  createContentTemplate,
  updateContentTemplate,
  deleteContentTemplate,
} from "@/lib/data";
import type { ParrillaSlot, WizardConfig, BrandAsset, ContentTemplate } from "@/lib/types";

// ─── Project CRUD ───

export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  let projectSlug: string;
  try {
    const project = await createProject({ name, slug });
    projectSlug = project.slug;
  } catch (e) {
    console.error("createProjectAction error:", e);
    throw new Error(`Error creando proyecto: ${e instanceof Error ? e.message : e}`);
  }
  redirect(`/projects/${projectSlug}`);
}

export async function createProjectWithOnboardingAction(formData: FormData) {
  const name = formData.get("name") as string;
  const websiteUrl = formData.get("website_url") as string;
  const instagramHandle = formData.get("instagram_handle") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  let projectSlug: string;
  try {
    const project = await createProject({
      name,
      slug,
      website_url: websiteUrl || undefined,
      instagram_handle: instagramHandle || undefined,
      onboarding_status: "researching",
    });
    projectSlug = project.slug;
  } catch (e) {
    console.error("createProjectWithOnboardingAction error:", e);
    throw new Error(`Error creando proyecto: ${e instanceof Error ? e.message : e}`);
  }
  redirect(`/projects/${projectSlug}/onboarding`);
}

export async function createProjectForOnboardingAction(
  name: string,
  websiteUrl: string,
  instagramHandle: string,
): Promise<{ id: string; slug: string }> {
  const baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  // Add random suffix to avoid slug collisions
  const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
  const project = await createProject({
    name,
    slug,
    website_url: websiteUrl || undefined,
    instagram_handle: instagramHandle || undefined,
    onboarding_status: "researching",
  });
  return { id: project.id, slug: project.slug };
}

export async function updateProjectYamlsAction(
  projectId: string,
  yamls: Record<string, Record<string, unknown>>,
) {
  await updateProjectYamls(projectId, yamls);
  revalidatePath("/projects");
}

export async function updateOnboardingStatusAction(
  projectId: string,
  status: "pending" | "researching" | "wizard" | "complete",
) {
  await updateProjectOnboardingStatus(projectId, status);
  revalidatePath("/projects");
}

// ─── Campaign CRUD ───

export async function createCampaignAction(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const projectSlug = formData.get("project_slug") as string;
  const name = formData.get("name") as string;
  const platform = formData.get("platform") as string || "instagram";
  const periodStart = formData.get("period_start") as string;
  const periodEnd = formData.get("period_end") as string;
  const numSlots = parseInt(formData.get("num_slots") as string || "0", 10);
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  let campaignId: string;
  try {
    const campaign = await createCampaign({
      project_id: projectId,
      name,
      slug,
      period_start: periodStart,
      period_end: periodEnd,
      platform,
    });
    campaignId = campaign.id;

    // Auto-create empty slots distributed across the period
    if (numSlots > 0) {
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const interval = totalDays / numSlots;

      for (let i = 0; i < numSlots; i++) {
        const slotDate = new Date(start.getTime() + interval * i * 24 * 60 * 60 * 1000);
        await createSlot({
          campaign_id: campaignId,
          slot_number: i + 1,
          date: slotDate.toISOString(),
          format: "reel",
          pillar: "general",
          objective: "engagement",
          intention: "quality",
          topic: `Contenido #${i + 1}`,
        });
      }
    }
  } catch (e) {
    console.error("createCampaignAction error:", e);
    throw new Error(`Error creando campana: ${e instanceof Error ? e.message : e}`);
  }

  redirect(`/projects/${projectSlug}/campaigns/${campaignId}`);
}

// ─── Campaign with Parrilla (Wizard) ───

export async function createCampaignWithParrillaAction(data: {
  project_id: string;
  project_slug: string;
  config: WizardConfig;
  collected_answers: Record<string, unknown>;
  parrilla: ParrillaSlot[];
}): Promise<{ campaignId: string }> {
  const slug = data.config.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let campaignId: string;
  try {
    const campaign = await createCampaign({
      project_id: data.project_id,
      name: data.config.name,
      slug,
      period_start: data.config.period_start,
      period_end: data.config.period_end,
      platform: data.config.platform,
      objectives_json: data.collected_answers,
    });
    campaignId = campaign.id;

    await createSlotsAndBriefsBulk(campaignId, data.parrilla);
  } catch (e) {
    console.error("createCampaignWithParrillaAction error:", e);
    throw new Error(
      `Error creando campana con parrilla: ${e instanceof Error ? e.message : e}`
    );
  }

  return { campaignId };
}

// ─── Brief Actions ───

export async function approveBriefAction(briefId: string, slotId: string, approvedBy: string) {
  await approveBrief(briefId, approvedBy);
  await updateSlotStatus(slotId, "generating", "2-content");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateBriefAction(briefId: string, briefYaml: Record<string, unknown>) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("briefs")
    .update({ brief_yaml: briefYaml })
    .eq("id", briefId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Slot Status ───

export async function advanceSlotAction(slotId: string, status: string, step: string) {
  await updateSlotStatus(
    slotId,
    status as Parameters<typeof updateSlotStatus>[1],
    step as Parameters<typeof updateSlotStatus>[2]
  );
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Feedback ───

export async function addFeedbackAction(
  slotId: string,
  step: "brief" | "content" | "art" | "simulation",
  comment: string,
  varianteId?: string
) {
  await addFeedback({
    slot_id: slotId,
    variante_id: varianteId,
    user_id: "00000000-0000-0000-0000-000000000000",
    user_email: "usuario@viralscope.dev",
    step,
    comment,
  });
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── MiroFish Prep ───

export async function saveSimulationMdAction(slotId: string, md: string) {
  await updateSlotSimulationMd(slotId, md);
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Content Templates (system-wide CRUD) ───

export async function createContentTemplateAction(data: {
  slug: string;
  name: string;
  format: string;
  tone: string;
  structure_json: Record<string, unknown>;
  composition_rules: Record<string, unknown>;
  prompt_injection: string;
}): Promise<{ success: boolean; template?: ContentTemplate; error?: string }> {
  try {
    const template = await createContentTemplate(data);
    revalidatePath("/templates");
    return { success: true, template };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function updateContentTemplateAction(
  id: string,
  data: Partial<{
    name: string;
    structure_json: Record<string, unknown>;
    composition_rules: Record<string, unknown>;
    prompt_injection: string;
    is_active: boolean;
  }>,
) {
  await updateContentTemplate(id, data);
  revalidatePath("/templates");
  return { success: true };
}

export async function deleteContentTemplateAction(id: string) {
  await deleteContentTemplate(id);
  revalidatePath("/templates");
  return { success: true };
}

// ─── Project Templates (per-project assignment) ───

export async function assignDefaultTemplatesAction(projectId: string) {
  const count = await assignDefaultTemplates(projectId);
  revalidatePath("/projects");
  return { success: true, count };
}

export async function toggleProjectTemplateAction(
  projectId: string,
  templateId: string,
  isDefault: boolean,
) {
  await toggleProjectTemplate(projectId, templateId, isDefault);
  revalidatePath("/projects");
  return { success: true };
}

export async function removeProjectTemplateAction(
  projectId: string,
  templateId: string,
) {
  await removeProjectTemplate(projectId, templateId);
  revalidatePath("/projects");
  return { success: true };
}

// ─── Brand Assets ───

export async function uploadBrandAssetAction(
  projectId: string,
  formData: FormData,
): Promise<{ success: boolean; asset?: BrandAsset; error?: string }> {
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string;
  const assetType = formData.get("asset_type") as BrandAsset["asset_type"];
  const description = formData.get("description") as string | null;

  if (!file || !name || !assetType) {
    return { success: false, error: "Faltan campos requeridos (file, name, asset_type)" };
  }

  try {
    // Upload to Supabase Storage
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const ext = file.name.split(".").pop() || "bin";
    const storagePath = `brand-assets/${projectId}/${assetType}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Error subiendo archivo: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Create DB record
    const asset = await createBrandAsset({
      project_id: projectId,
      asset_type: assetType,
      name,
      description: description || undefined,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: file.type,
      metadata_json: { original_name: file.name, size_bytes: file.size },
    });

    revalidatePath("/projects");
    return { success: true, asset };
  } catch (e) {
    return { success: false, error: `Error: ${e instanceof Error ? e.message : e}` };
  }
}

export async function deleteBrandAssetAction(
  assetId: string,
  storagePath: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from Storage
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    await supabase.storage.from("media").remove([storagePath]);

    // Delete DB record (trigger cleans asset_references in visual_specs)
    await deleteBrandAsset(assetId);

    revalidatePath("/projects");
    return { success: true };
  } catch (e) {
    return { success: false, error: `Error: ${e instanceof Error ? e.message : e}` };
  }
}

// ─── Visual Specs ───

export async function upsertVisualSpecAction(
  projectId: string,
  specKey: string,
  specValue: Record<string, unknown>,
  assetReferences: string[],
  promptText: string,
  priority?: number,
) {
  await upsertVisualSpec({
    project_id: projectId,
    spec_key: specKey,
    spec_value: specValue,
    asset_references: assetReferences,
    prompt_text: promptText,
    priority,
  });
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteVisualSpecAction(specId: string) {
  await deleteVisualSpec(specId);
  revalidatePath("/projects");
  return { success: true };
}

// ─── Video Upload ───

export async function uploadVideoAction(
  varianteId: string,
  slotId: string,
  variantLabel: string,
  formData: FormData,
): Promise<{ success: boolean; video_url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const ext = file.name.split(".").pop() || "mp4";
    const storagePath = `videos/${slotId}/${variantLabel}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload error: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(storagePath);
    const videoUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from("variantes")
      .update({ video_url: videoUrl })
      .eq("id", varianteId);

    if (dbError) {
      return { success: false, error: `DB error: ${dbError.message}` };
    }

    revalidatePath("/projects");
    return { success: true, video_url: videoUrl };
  } catch (e) {
    return { success: false, error: `Error: ${e instanceof Error ? e.message : e}` };
  }
}
