"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { approveBriefAction, advanceSlotAction, saveSimulationMdAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Slot, Brief, Variante, Feedback, SlotStep } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ArtStatus = "pending" | "generating" | "done" | "error";
export type ImgStatus = "pending" | "generating" | "retrying" | "done" | "error";

export interface HookItem {
  id: number;
  text: string;
  tone: string;
  scores: Record<string, number>;
  total: number;
  reasoning: string;
}

export const PHASE_LABELS: Record<string, string> = {
  queued: "En cola...",
  building_personas: "Generando personas...",
  building_graph: "Construyendo grafo Neo4j...",
  extracting_entities: "Extrayendo entidades...",
  generating_profiles: "Generando perfiles OASIS...",
  building_config: "Configurando simulacion...",
  launching_simulation: "Lanzando simulacion...",
  simulating: "Simulando engagement...",
  failed: "Error en setup",
};

export const PHASE_PROGRESS: Record<string, number> = {
  queued: 5,
  building_personas: 15,
  building_graph: 30,
  extracting_entities: 45,
  generating_profiles: 60,
  building_config: 72,
  launching_simulation: 82,
  simulating: 92,
};

const OP_STEP_MAP: Record<string, SlotStep> = {
  brief: "1-brief",
  "approve-brief": "1-brief",
  "regen-brief": "1-brief",
  hooks: "2-content",
  variantes: "2-content",
  "auto-art": "3-art",
  "batch-images": "3-art",
  "advance-art": "3-art",
  "panel-evaluate": "4-simulation",
  "deep-sim": "4-simulation",
  survey: "4-simulation",
  mirofish: "4-simulation",
  "panel-seed": "4-simulation",
  "approve-final": "5-approved",
};

export function opBelongsToStep(op: string | null, stepKey: SlotStep): boolean {
  if (!op) return false;
  if (OP_STEP_MAP[op]) return OP_STEP_MAP[op] === stepKey;
  if (op.startsWith("art-")) return stepKey === "3-art";
  return false;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseSlotWorkflowParams {
  slot: Slot;
  brief: Brief | null;
  variantes: Variante[];
  feedbackItems: Feedback[];
  simulationData: Record<string, unknown>;
  projectId: string;
  campaignId: string;
}

export function useSlotWorkflow({
  slot,
  brief,
  variantes,
  projectId,
  campaignId,
}: UseSlotWorkflowParams) {
  const router = useRouter();
  const { toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────
  const [activeOp, setActiveOp] = React.useState<string | null>(null);
  const [stepErrors, setStepErrors] = React.useState<Record<string, string | null>>({});
  const [mirofishMd, setMirofishMd] = React.useState<string | null>(null);
  const [artProgress, setArtProgress] = React.useState<Record<string, ArtStatus>>({});
  const [imgProgress, setImgProgress] = React.useState<Record<string, ImgStatus>>({});
  const [hooks, setHooks] = React.useState<HookItem[]>([]);
  const [selectedHooks, setSelectedHooks] = React.useState<number[]>([]);
  const [panelResult, setPanelResult] = React.useState<Record<string, unknown> | null>(null);
  const [deepSimResult, setDeepSimResult] = React.useState<Record<string, unknown> | null>(
    slot.deep_sim_result ?? null
  );
  const [deepSimPhase, setDeepSimPhase] = React.useState<string | null>(null);
  const [deepSimMeta, setDeepSimMeta] = React.useState<{
    railwayUrl: string;
    simulationId: string;
  } | null>(() => {
    const r = slot.deep_sim_result;
    if (r?.railway_url && slot.deep_sim_id) {
      return { railwayUrl: r.railway_url as string, simulationId: slot.deep_sim_id };
    }
    return null;
  });

  // Optimistic state for brief approval
  const [briefApprovedOptimistic, setBriefApprovedOptimistic] = React.useState(false);
  const [currentStepOverride, setCurrentStepOverride] = React.useState<SlotStep | null>(null);

  const autoImageTriggered = React.useRef(false);
  const deepSimPollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  // ── Effective current step (supports optimistic overrides) ─────────────
  const effectiveCurrentStep = currentStepOverride ?? slot.current_step;

  // ── Helpers ────────────────────────────────────────────────────────────
  function setStepError(stepKey: string, msg: string) {
    setStepErrors((prev) => ({ ...prev, [stepKey]: msg }));
    toast(msg, "error");
  }

  function clearStepError(stepKey: string) {
    setStepErrors((prev) => ({ ...prev, [stepKey]: null }));
  }

  async function callEdgeFunction(name: string, body: Record<string, unknown>) {
    const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Error ${res.status}`);
    }
    return res.json();
  }

  // ── Step 1: Brief ──────────────────────────────────────────────────────
  async function handleGenerateBrief() {
    setActiveOp("brief");
    clearStepError("1-brief");
    try {
      await callEdgeFunction("generate-brief", {
        project_id: projectId,
        campaign_id: campaignId,
        slot_id: slot.id,
      });
      toast("Brief generado exitosamente", "success");
      router.refresh();
    } catch (e) {
      setStepError("1-brief", `Error generando brief: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handleApproveBrief() {
    if (!brief) return;
    setActiveOp("approve-brief");
    clearStepError("1-brief");
    // Optimistic: show step 2 as active immediately
    setBriefApprovedOptimistic(true);
    setCurrentStepOverride("2-content");
    try {
      await approveBriefAction(brief.id, slot.id, "usuario@viralscope.dev");
      toast("Brief aprobado", "success");
      router.refresh();
    } catch (e) {
      // Revert optimistic update
      setBriefApprovedOptimistic(false);
      setCurrentStepOverride(null);
      setStepError("1-brief", `Error aprobando brief: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handleRegenerateBrief() {
    setActiveOp("regen-brief");
    clearStepError("1-brief");
    try {
      await callEdgeFunction("generate-brief", {
        project_id: projectId,
        campaign_id: campaignId,
        slot_id: slot.id,
      });
      toast("Brief regenerado", "success");
      router.refresh();
    } catch (e) {
      setStepError("1-brief", `Error regenerando brief: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  // ── Step 2: Content ────────────────────────────────────────────────────
  async function handleGenerateHooks() {
    setActiveOp("hooks");
    clearStepError("2-content");
    try {
      const data = await callEdgeFunction("generate-hooks", { slot_id: slot.id });
      if (data.hooks && Array.isArray(data.hooks)) {
        setHooks(data.hooks);
        const top3 = data.hooks.slice(0, 3).map((h: { id: number }) => h.id);
        setSelectedHooks(top3);
        toast(`${data.hooks.length} hooks generados`, "success");
      }
    } catch (e) {
      setStepError("2-content", `Error generando hooks: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handleGenerateVariantes() {
    setActiveOp("variantes");
    clearStepError("2-content");
    try {
      await callEdgeFunction("generate-variantes", { slot_id: slot.id });
      toast("Variantes generadas", "success");
      router.refresh();
    } catch (e) {
      setStepError("2-content", `Error generando variantes: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handleGenerateVariantesFromHooks(hookTexts: string[]) {
    setActiveOp("variantes");
    clearStepError("2-content");
    try {
      await callEdgeFunction("generate-variantes", {
        slot_id: slot.id,
        selected_hooks: hookTexts,
      });
      toast("Variantes generadas desde hooks", "success");
      router.refresh();
    } catch (e) {
      setStepError("2-content", `Error generando variantes: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  // ── Step 3: Art Direction ──────────────────────────────────────────────
  async function handleAutoGenerateArt() {
    if (activeOp) return;
    setActiveOp("auto-art");
    clearStepError("3-art");

    const labels = variantes.map((v) => v.variant_label);
    const progress: Record<string, ArtStatus> = {};
    labels.forEach((l) => (progress[l] = "pending"));
    setArtProgress({ ...progress });

    try {
      await advanceSlotAction(slot.id, "art_review", "3-art");
      setCurrentStepOverride("3-art");

      const artResults = await Promise.allSettled(
        labels.map(async (label) => {
          setArtProgress((prev) => ({ ...prev, [label]: "generating" }));
          await callEdgeFunction("generate-art", {
            slot_id: slot.id,
            variant_label: label,
          });
          setArtProgress((prev) => ({ ...prev, [label]: "done" }));
        })
      );

      const artFailed = artResults.filter((r) => r.status === "rejected").length;
      if (artFailed > 0) {
        setStepError("3-art", `${artFailed} variante(s) fallaron al generar arte.`);
      } else {
        toast("Arte generado para todas las variantes", "success");
      }

      autoImageTriggered.current = false;
      router.refresh();
    } catch (e) {
      setStepError("3-art", `Error generando arte: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function generateWithRetry(
    job: {
      prompt_string: string;
      negative_prompt: string;
      aspect_ratio: string;
      slot_id: string;
      variant_label: string;
      slideKey?: string;
    },
    maxRetries: number
  ): Promise<{ image_url: string }> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await callEdgeFunction("generate-image", job);
        if (result.image_url) return result;
        throw new Error(result.error || "No image returned");
      } catch (err) {
        if (attempt === maxRetries) throw err;
        const key = job.slideKey || job.variant_label;
        setImgProgress((prev) => ({ ...prev, [key]: "retrying" }));
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    throw new Error("Max retries exceeded");
  }

  async function handleGenerateAllImages() {
    if (activeOp) return;
    setActiveOp("batch-images");
    clearStepError("3-art");

    type ImageJob = {
      prompt_string: string;
      negative_prompt: string;
      aspect_ratio: string;
      slot_id: string;
      variant_label: string;
      slide_number?: number;
      slideKey?: string;
    };

    const jobs: ImageJob[] = [];
    for (const v of variantes) {
      const imgJson = v.art_direction_image_json as Record<string, unknown>;
      if (!imgJson) continue;

      if (imgJson.type === "carousel" && Array.isArray(imgJson.slides)) {
        for (const slide of imgJson.slides as Array<Record<string, unknown>>) {
          const slideNum = slide.slide_number as number;
          const key = `${v.variant_label}-s${slideNum}`;
          jobs.push({
            prompt_string: (slide.prompt_string as string) || "",
            negative_prompt: (slide.negative_prompt as string) || "",
            aspect_ratio: "1:1",
            slot_id: slot.id,
            variant_label: v.variant_label,
            slide_number: slideNum,
            slideKey: key,
          });
        }
      } else {
        const prompt = (imgJson.prompt_string as string) || "";
        if (!prompt) continue;
        jobs.push({
          prompt_string: prompt,
          negative_prompt: (imgJson.negative_prompt as string) || "",
          aspect_ratio:
            slot.format === "reel" || slot.format === "story" ? "9:16" : "1:1",
          slot_id: slot.id,
          variant_label: v.variant_label,
        });
      }
    }

    if (jobs.length === 0) {
      setStepError("3-art", "No hay prompts de imagen disponibles. Genera art direction primero.");
      setActiveOp(null);
      return;
    }

    const progress: Record<string, ImgStatus> = {};
    jobs.forEach((j) => (progress[j.slideKey || j.variant_label] = "pending"));
    setImgProgress({ ...progress });

    const MAX_PARALLEL = 3;
    const MAX_RETRIES = 2;
    let localFailCount = 0;

    for (let i = 0; i < jobs.length; i += MAX_PARALLEL) {
      const batch = jobs.slice(i, i + MAX_PARALLEL);
      const results = await Promise.allSettled(
        batch.map(async (job) => {
          const key = job.slideKey || job.variant_label;
          setImgProgress((prev) => ({ ...prev, [key]: "generating" }));
          const result = await generateWithRetry(job, MAX_RETRIES);
          setImgProgress((prev) => ({ ...prev, [key]: "done" }));
          return result;
        })
      );

      results.forEach((r, idx) => {
        if (r.status === "rejected") {
          const key = batch[idx].slideKey || batch[idx].variant_label;
          setImgProgress((prev) => ({ ...prev, [key]: "error" }));
          localFailCount++;
        }
      });
    }

    if (localFailCount > 0) {
      setStepError("3-art", `${localFailCount} imagen(es) fallaron despues de ${MAX_RETRIES + 1} intentos`);
    } else {
      toast(`${jobs.length} imagenes generadas`, "success");
    }

    setActiveOp(null);
    router.refresh();
  }

  async function handleAdvanceToSimulation() {
    setActiveOp("advance-art");
    clearStepError("3-art");
    setCurrentStepOverride("4-simulation");
    try {
      await advanceSlotAction(slot.id, "simulating", "4-simulation");
      toast("Avanzando a simulacion", "success");
      router.refresh();
    } catch (e) {
      setCurrentStepOverride(null);
      setStepError("3-art", `Error avanzando: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  // ── Step 4: Simulation ─────────────────────────────────────────────────
  async function handlePanelEvaluate() {
    setActiveOp("panel-evaluate");
    clearStepError("4-simulation");
    try {
      const data = await callEdgeFunction("panel-evaluate", { slot_id: slot.id });
      setPanelResult(data);
      toast("Evaluacion de panel completada", "success");
    } catch (e) {
      setStepError("4-simulation", `Error evaluando panel: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handlePanelSeed() {
    setActiveOp("panel-seed");
    clearStepError("4-simulation");
    try {
      await callEdgeFunction("panel-seed", { project_id: projectId });
      toast("Panel de agentes creado", "success");
    } catch (e) {
      setStepError("4-simulation", `Error creando panel: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handleDeepSimulation() {
    setActiveOp("deep-sim");
    setDeepSimPhase("queued");
    clearStepError("4-simulation");
    try {
      const data = await callEdgeFunction("simulate-deep", {
        slot_id: slot.id,
        persona_count: 50,
      });
      if (data.simulation_id && data.poll_url && data.railway_url) {
        setDeepSimMeta({
          railwayUrl: data.railway_url,
          simulationId: data.simulation_id,
        });
        const pollUrl = `${data.railway_url}${data.poll_url}`;
        const pollStart = Date.now();
        const MAX_POLL_MS = 20 * 60 * 1000;
        deepSimPollRef.current = setInterval(async () => {
          if (Date.now() - pollStart > MAX_POLL_MS) {
            if (deepSimPollRef.current) clearInterval(deepSimPollRef.current);
            setStepError("4-simulation", "Simulacion excedio el tiempo maximo (20 min).");
            setDeepSimPhase(null);
            setActiveOp(null);
            return;
          }
          try {
            const res = await fetch(pollUrl);
            const status = await res.json();
            if (status.phase) setDeepSimPhase(status.phase);
            if (status.seir?.trajectory) {
              setDeepSimResult((prev) => ({ ...(prev ?? {}), ...status }));
            }
            if (status.status === "error") {
              if (deepSimPollRef.current) clearInterval(deepSimPollRef.current);
              setStepError("4-simulation", `Error en simulacion: ${status.error || "Unknown error"}`);
              setDeepSimPhase(null);
              setActiveOp(null);
            } else if (!status.running) {
              if (deepSimPollRef.current) clearInterval(deepSimPollRef.current);
              setDeepSimResult(status);
              setDeepSimPhase(null);
              setActiveOp(null);
              toast("Simulacion profunda completada", "success");
            }
          } catch {
            /* keep polling */
          }
        }, 10000);
      }
    } catch (e) {
      setStepError("4-simulation", `Error lanzando simulacion: ${e instanceof Error ? e.message : e}`);
      setDeepSimPhase(null);
      setActiveOp(null);
    }
  }

  async function handleSurveyAgents() {
    setActiveOp("survey");
    clearStepError("4-simulation");
    try {
      const data = await callEdgeFunction("simulate-deep-survey", { slot_id: slot.id });
      setDeepSimResult((prev) => ({
        ...(prev ?? {}),
        survey: true,
        survey_scores: data.scores,
        survey_winner: data.winner,
      }));
      toast("Encuesta de agentes completada", "success");
      router.refresh();
    } catch (e) {
      setStepError("4-simulation", `Error en encuesta: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setActiveOp(null);
    }
  }

  async function handlePrepareMirofish() {
    setActiveOp("mirofish");
    clearStepError("4-simulation");
    try {
      const data = await callEdgeFunction("prepare-mirofish", { slot_id: slot.id });
      setMirofishMd(data.simulation_md);
      await saveSimulationMdAction(slot.id, data.simulation_md);
      toast("Seed de MiroFish preparado", "success");
    } catch (e) {
      setStepError("4-simulation", `Error preparando MiroFish: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  // ── Step 5: Approval ───────────────────────────────────────────────────
  async function handleApproveForPublish() {
    setActiveOp("approve-final");
    clearStepError("5-approved");
    try {
      await advanceSlotAction(slot.id, "ready", "5-approved");
      toast("Contenido aprobado para publicacion", "success");
      router.refresh();
    } catch (e) {
      setStepError("5-approved", `Error aprobando: ${e instanceof Error ? e.message : e}`);
    } finally {
      setActiveOp(null);
    }
  }

  // ── Effects ────────────────────────────────────────────────────────────

  // Auto-trigger image generation when art exists but images don't
  React.useEffect(() => {
    if (
      slot.current_step === "3-art" &&
      !autoImageTriggered.current &&
      variantes.length > 0 &&
      variantes.some(
        (v) => v.art_direction_image_json && Object.keys(v.art_direction_image_json).length > 0
      ) &&
      !variantes.some((v) => v.image_url)
    ) {
      autoImageTriggered.current = true;
      handleGenerateAllImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot.current_step, variantes]);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (deepSimPollRef.current) clearInterval(deepSimPollRef.current);
    };
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────
  const winnerVariant = variantes.reduce<Variante | null>((best, v) => {
    if (v.simulation_score === null) return best;
    if (!best || best.simulation_score === null) return v;
    return v.simulation_score > best.simulation_score ? v : best;
  }, null);

  return {
    // State
    activeOp,
    stepErrors,
    artProgress,
    imgProgress,
    hooks,
    selectedHooks,
    setSelectedHooks,
    panelResult,
    setPanelResult,
    deepSimResult,
    setDeepSimResult,
    deepSimPhase,
    deepSimMeta,
    setDeepSimMeta,
    mirofishMd,
    winnerVariant,
    briefApprovedOptimistic,
    effectiveCurrentStep,

    // Actions
    handleGenerateBrief,
    handleApproveBrief,
    handleRegenerateBrief,
    handleGenerateHooks,
    handleGenerateVariantes,
    handleGenerateVariantesFromHooks,
    handleAutoGenerateArt,
    handleGenerateAllImages,
    handleAdvanceToSimulation,
    handlePanelEvaluate,
    handlePanelSeed,
    handleDeepSimulation,
    handleSurveyAgents,
    handlePrepareMirofish,
    handleApproveForPublish,
  };
}
