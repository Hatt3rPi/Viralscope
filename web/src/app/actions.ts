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
} from "@/lib/data";
import type { ParrillaSlot, WizardConfig } from "@/lib/types";

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
