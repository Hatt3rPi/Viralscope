"use client";

import * as React from "react";
import { Check, Circle, Loader2, Sparkles, AlertTriangle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BriefCard } from "@/components/slot/brief-card";
import { VarianteTabs } from "@/components/slot/variante-tabs";
import { ArtDirectionCard } from "@/components/slot/art-direction-card";
import { InstagramPreview } from "@/components/slot/instagram-preview";
import { SimulationCard } from "@/components/slot/simulation-card";
import { FeedbackPanel } from "@/components/feedback/feedback-panel";
import { approveBriefAction, advanceSlotAction, saveSimulationMdAction } from "@/app/actions";
import type { Slot, Brief, Variante, Feedback, SlotStep } from "@/lib/types";

interface TimelineViewProps {
  slot: Slot;
  brief: Brief | null;
  variantes: Variante[];
  feedbackItems: Feedback[];
  simulationData: Record<string, unknown>;
  projectId: string;
  campaignId: string;
}

const stepsConfig: {
  key: SlotStep;
  title: string;
  feedbackStep?: string;
}[] = [
  { key: "1-brief", title: "Brief", feedbackStep: "brief" },
  { key: "2-content", title: "Contenido", feedbackStep: "content" },
  { key: "3-art", title: "Dirección de Arte", feedbackStep: "art" },
  { key: "4-simulation", title: "Simulación", feedbackStep: "simulation" },
  { key: "5-approved", title: "Aprobación Final" },
];

const stepOrder: SlotStep[] = [
  "1-brief",
  "2-content",
  "3-art",
  "4-simulation",
  "5-approved",
];

function getStepStatus(
  stepKey: SlotStep,
  currentStep: SlotStep
): "completed" | "active" | "pending" {
  const currentIdx = stepOrder.indexOf(currentStep);
  const stepIdx = stepOrder.indexOf(stepKey);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export function TimelineView({
  slot,
  brief,
  variantes,
  feedbackItems,
  simulationData,
  projectId,
  campaignId,
}: TimelineViewProps) {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(() => {
    return new Set([slot.current_step]);
  });
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [mirofishMd, setMirofishMd] = React.useState<string | null>(null);
  const [artProgress, setArtProgress] = React.useState<Record<string, "pending" | "generating" | "done" | "error">>({});
  const [imgProgress, setImgProgress] = React.useState<Record<string, "pending" | "generating" | "retrying" | "done" | "error">>({});
  const [hooks, setHooks] = React.useState<Array<{ id: number; text: string; tone: string; scores: Record<string, number>; total: number; reasoning: string }>>([]);
  const [selectedHooks, setSelectedHooks] = React.useState<number[]>([]);
  const autoImageTriggered = React.useRef(false);
  const [panelResult, setPanelResult] = React.useState<Record<string, unknown> | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

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

  async function handleGenerateBrief() {
    setLoading("brief");
    setError(null);
    try {
      await callEdgeFunction("generate-brief", {
        project_id: projectId,
        campaign_id: campaignId,
        slot_id: slot.id,
      });
      window.location.reload();
    } catch (e) {
      setError(`Error generando brief: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleApproveBrief() {
    if (!brief) return;
    setLoading("approve-brief");
    setError(null);
    try {
      await approveBriefAction(brief.id, slot.id, "usuario@viralscope.dev");
      window.location.reload();
    } catch (e) {
      setError(`Error aprobando brief: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleRegenerateBrief() {
    setLoading("regen-brief");
    setError(null);
    try {
      await callEdgeFunction("generate-brief", {
        project_id: projectId,
        campaign_id: campaignId,
        slot_id: slot.id,
      });
      window.location.reload();
    } catch (e) {
      setError(`Error regenerando brief: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateVariantes() {
    setLoading("variantes");
    setError(null);
    try {
      await callEdgeFunction("generate-variantes", { slot_id: slot.id });
      window.location.reload();
    } catch (e) {
      setError(`Error generando variantes: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateHooks() {
    setLoading("hooks");
    setError(null);
    try {
      const data = await callEdgeFunction("generate-hooks", { slot_id: slot.id });
      if (data.hooks && Array.isArray(data.hooks)) {
        setHooks(data.hooks);
        // Auto-select top 3
        const top3 = data.hooks.slice(0, 3).map((h: { id: number }) => h.id);
        setSelectedHooks(top3);
      }
    } catch (e) {
      setError(`Error generando hooks: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateVariantesFromHooks(hookTexts: string[]) {
    setLoading("variantes");
    setError(null);
    try {
      await callEdgeFunction("generate-variantes", {
        slot_id: slot.id,
        selected_hooks: hookTexts,
      });
      window.location.reload();
    } catch (e) {
      setError(`Error generando variantes: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateArt(variantLabel: string) {
    setLoading(`art-${variantLabel}`);
    setError(null);
    try {
      await callEdgeFunction("generate-art", {
        slot_id: slot.id,
        variant_label: variantLabel,
      });
      window.location.reload();
    } catch (e) {
      setError(`Error generando arte ${variantLabel}: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handlePrepareMirofish() {
    setLoading("mirofish");
    setError(null);
    try {
      const data = await callEdgeFunction("prepare-mirofish", { slot_id: slot.id });
      setMirofishMd(data.simulation_md);
      await saveSimulationMdAction(slot.id, data.simulation_md);
    } catch (e) {
      setError(`Error preparando MiroFish: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handlePanelEvaluate() {
    setLoading("panel-evaluate");
    setError(null);
    try {
      const data = await callEdgeFunction("panel-evaluate", { slot_id: slot.id });
      setPanelResult(data);
    } catch (e) {
      setError(`Error evaluando panel: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handlePanelSeed() {
    setLoading("panel-seed");
    setError(null);
    try {
      await callEdgeFunction("panel-seed", { project_id: projectId });
    } catch (e) {
      setError(`Error creando panel: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleApproveForPublish() {
    setLoading("approve-final");
    setError(null);
    try {
      await advanceSlotAction(slot.id, "ready", "5-approved");
      window.location.reload();
    } catch (e) {
      setError(`Error aprobando: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  // ── Auto-trigger image generation when art exists but images don't ──
  React.useEffect(() => {
    if (
      slot.current_step === "3-art" &&
      !autoImageTriggered.current &&
      variantes.length > 0 &&
      variantes.some((v) => v.art_direction_image_json && Object.keys(v.art_direction_image_json).length > 0) &&
      !variantes.some((v) => v.image_url)
    ) {
      autoImageTriggered.current = true;
      handleGenerateAllImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot.current_step, variantes]);

  // ── Auto-generate art direction + images for all variants ──────────
  async function handleAutoGenerateArt() {
    if (loading) return;
    setLoading("auto-art");
    setError(null);

    const labels = variantes.map((v) => v.variant_label);
    const progress: Record<string, "pending" | "generating" | "done" | "error"> = {};
    labels.forEach((l) => (progress[l] = "pending"));
    setArtProgress({ ...progress });

    try {
      // 1. Advance slot
      await advanceSlotAction(slot.id, "art_review", "3-art");

      // 2. Generate art for all variants in parallel
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
        setError(`${artFailed} variante(s) fallaron al generar arte. Las imagenes se generaran para las exitosas.`);
      }

      // 3. Auto-generate images (reload page first to get updated art_direction data, then trigger images)
      window.location.reload();
    } catch (e) {
      setError(`Error generando arte: ${e instanceof Error ? e.message : e}`);
    } finally {
      setLoading(null);
    }
  }

  // ── Batch image generation with retry ─────────────────────────────
  async function generateWithRetry(
    job: { prompt_string: string; negative_prompt: string; aspect_ratio: string; slot_id: string; variant_label: string; slideKey?: string },
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
    if (loading) return;
    setLoading("batch-images");
    setError(null);

    type ImageJob = {
      prompt_string: string;
      negative_prompt: string;
      aspect_ratio: string;
      slot_id: string;
      variant_label: string;
      slide_number?: number;
      slideKey?: string;
    };

    // Collect all image jobs from all variants
    const jobs: ImageJob[] = [];
    for (const v of variantes) {
      const imgJson = v.art_direction_image_json as Record<string, unknown>;
      if (!imgJson) continue;

      if (imgJson.type === "carousel" && Array.isArray(imgJson.slides)) {
        // Carousel: one job per slide
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
        // Single image
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
      setError("No hay prompts de imagen disponibles. Genera art direction primero.");
      setLoading(null);
      return;
    }

    // Initialize progress
    const progress: Record<string, "pending" | "generating" | "retrying" | "done" | "error"> = {};
    jobs.forEach((j) => (progress[j.slideKey || j.variant_label] = "pending"));
    setImgProgress({ ...progress });

    const MAX_PARALLEL = 3;
    const MAX_RETRIES = 2;

    // Process in batches of MAX_PARALLEL
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
        }
      });
    }

    const failCount = Object.values(imgProgress).filter((s) => s === "error").length;
    if (failCount > 0) {
      setError(`${failCount} imagen(es) fallaron despues de ${MAX_RETRIES + 1} intentos`);
    }

    setLoading(null);
    window.location.reload();
  }

  function toggleStep(stepKey: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepKey)) {
        next.delete(stepKey);
      } else {
        next.add(stepKey);
      }
      return next;
    });
  }

  // Find the winning variant
  const winnerVariant = variantes.reduce<Variante | null>((best, v) => {
    if (v.simulation_score === null) return best;
    if (!best || best.simulation_score === null) return v;
    return v.simulation_score > best.simulation_score ? v : best;
  }, null);

  const typedSimData = simulationData as Record<
    string,
    { weight: number; scores: Record<string, Record<string, number>> }
  >;

  return (
    <div className="relative space-y-0">
      {stepsConfig.map((step, idx) => {
        const status = getStepStatus(step.key, slot.current_step);
        const isExpanded = expandedSteps.has(step.key);
        const isLast = idx === stepsConfig.length - 1;
        const stepFeedback = step.feedbackStep
          ? feedbackItems.filter((f) => f.step === step.feedbackStep)
          : [];

        return (
          <div key={step.key} className="relative flex gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <button
                type="button"
                onClick={() => toggleStep(step.key)}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-colors"
                style={{
                  borderColor:
                    status === "completed"
                      ? "#16a34a"
                      : status === "active"
                        ? "#9333ea"
                        : "#d1d5db",
                  backgroundColor:
                    status === "completed"
                      ? "#16a34a"
                      : status === "active"
                        ? "#f3e8ff"
                        : "#ffffff",
                }}
              >
                {status === "completed" ? (
                  <Check className="h-5 w-5 text-white" />
                ) : status === "active" ? (
                  <Circle className="h-4 w-4 animate-pulse fill-purple-600 text-purple-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
              </button>
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1",
                    status === "completed" ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-8">
              <button
                type="button"
                onClick={() => toggleStep(step.key)}
                className="flex items-center gap-3 text-left"
              >
                <h3
                  className={cn(
                    "text-lg font-semibold",
                    status === "completed"
                      ? "text-green-700"
                      : status === "active"
                        ? "text-purple-700"
                        : "text-gray-400"
                  )}
                >
                  {step.title}
                </h3>
                <Badge
                  variant={
                    status === "completed"
                      ? "success"
                      : status === "active"
                        ? "default"
                        : "info"
                  }
                >
                  {status === "completed"
                    ? "Completado"
                    : status === "active"
                      ? "En progreso"
                      : "Pendiente"}
                </Badge>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Error display */}
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Step 1: Brief */}
                  {step.key === "1-brief" && (
                    <div className="space-y-4">
                      {brief ? (
                        <BriefCard
                          brief={brief}
                          onApprove={handleApproveBrief}
                          onRegenerate={handleRegenerateBrief}
                        />
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center space-y-3">
                          <p className="text-sm text-gray-500">
                            No hay brief generado aun para este slot.
                          </p>
                          <Button
                            onClick={handleGenerateBrief}
                            disabled={loading === "brief"}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {loading === "brief" ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Brief...</>
                            ) : (
                              "Generar Brief con IA"
                            )}
                          </Button>
                        </div>
                      )}
                      {loading === "approve-brief" && (
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                          <Loader2 className="h-4 w-4 animate-spin" /> Aprobando brief...
                        </div>
                      )}
                      {loading === "regen-brief" && (
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                          <Loader2 className="h-4 w-4 animate-spin" /> Regenerando brief...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Content (Hook Funnel → Variants) */}
                  {step.key === "2-content" && (
                    <div className="space-y-6">

                      {/* Phase A: Hook Funnel */}
                      {variantes.length === 0 && (
                        <div className="space-y-4">
                          {/* Generate hooks button */}
                          {hooks.length === 0 && (
                            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center space-y-3">
                              <p className="text-sm text-gray-600">
                                Primero generamos 12 hooks y los evaluamos con 6 dimensiones de calidad.
                                Solo los mejores 3 avanzaran a variantes completas.
                              </p>
                              <Button
                                onClick={handleGenerateHooks}
                                disabled={loading === "hooks"}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {loading === "hooks" ? (
                                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando 12 hooks...</>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generar Hook Funnel
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* Hook results table */}
                          {hooks.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {hooks.length} hooks generados — selecciona 3 para desarrollar
                                </h4>
                                <span className="text-xs text-gray-400">Ordenados por score total</span>
                              </div>

                              <div className="space-y-2">
                                {hooks.map((hook, idx) => {
                                  const isSelected = selectedHooks.includes(hook.id);
                                  const toneColor = hook.tone === "emocional" ? "border-l-rose-400 bg-rose-50/30"
                                    : hook.tone === "educativo" ? "border-l-sky-400 bg-sky-50/30"
                                    : "border-l-amber-400 bg-amber-50/30";
                                  const toneLabel = hook.tone === "emocional" ? "EMO"
                                    : hook.tone === "educativo" ? "EDU" : "DIR";

                                  return (
                                    <button
                                      key={hook.id}
                                      onClick={() => {
                                        setSelectedHooks((prev) => {
                                          if (prev.includes(hook.id)) return prev.filter((id) => id !== hook.id);
                                          if (prev.length >= 3) return prev;
                                          return [...prev, hook.id];
                                        });
                                      }}
                                      className={cn(
                                        "w-full text-left rounded-lg border-l-[3px] px-4 py-3 transition-all",
                                        toneColor,
                                        isSelected
                                          ? "ring-2 ring-purple-400 bg-purple-50/50 border border-purple-200"
                                          : "border border-gray-100 hover:border-gray-200"
                                      )}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={cn(
                                          "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold mt-0.5",
                                          isSelected ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                                        )}>
                                          {isSelected ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] text-gray-900 font-medium leading-snug">
                                            &ldquo;{hook.text}&rdquo;
                                          </p>
                                          <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{toneLabel}</span>
                                            <span className="text-[10px] text-gray-400">·</span>
                                            <span className="text-[11px] text-gray-500">{hook.reasoning}</span>
                                          </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                          <span className={cn(
                                            "text-lg font-bold tabular-nums",
                                            hook.total >= 48 ? "text-green-600" : hook.total >= 40 ? "text-amber-600" : "text-gray-400"
                                          )}>
                                            {hook.total}
                                          </span>
                                          <p className="text-[9px] text-gray-400">/60</p>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Generate variants from selected hooks */}
                              <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-gray-400">
                                  {selectedHooks.length}/3 seleccionados
                                </p>
                                <Button
                                  onClick={() => {
                                    const selected = hooks
                                      .filter((h) => selectedHooks.includes(h.id))
                                      .map((h) => h.text);
                                    handleGenerateVariantesFromHooks(selected);
                                  }}
                                  disabled={selectedHooks.length !== 3 || loading === "variantes"}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  {loading === "variantes" ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Variantes...</>
                                  ) : (
                                    "Generar Variantes desde Hooks"
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Phase B: Generated variants */}
                      {variantes.length > 0 && (
                        <>
                          <VarianteTabs variantes={variantes} />
                          <div className="flex flex-wrap gap-3 items-center">
                            <Button
                              onClick={handleGenerateVariantes}
                              disabled={loading === "variantes"}
                              variant="outline"
                              size="sm"
                            >
                              Regenerar Variantes
                            </Button>
                            <Button
                              onClick={handleAutoGenerateArt}
                              disabled={loading === "auto-art"}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {loading === "auto-art" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Arte A, B, C...</>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Continuar a Direccion de Arte
                                </>
                              )}
                            </Button>
                          </div>
                          {/* Art generation progress chips */}
                          {Object.keys(artProgress).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(artProgress).map(([label, artStatus]) => (
                                <span
                                  key={label}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                                    artStatus === "done" && "bg-green-100 text-green-700",
                                    artStatus === "generating" && "bg-purple-100 text-purple-700",
                                    artStatus === "error" && "bg-red-100 text-red-700",
                                    artStatus === "pending" && "bg-gray-100 text-gray-500"
                                  )}
                                >
                                  {artStatus === "generating" && <Loader2 className="h-3 w-3 animate-spin" />}
                                  {artStatus === "done" && <Check className="h-3 w-3" />}
                                  {artStatus === "error" && <AlertTriangle className="h-3 w-3" />}
                                  Variante {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 3: Art Direction */}
                  {step.key === "3-art" && (
                    <div className="space-y-6">
                      {variantes.length === 0 && (
                        <p className="text-sm text-gray-400">Primero genera variantes en el paso anterior.</p>
                      )}

                      {/* Image generation progress (auto-triggered) */}
                      {(loading === "batch-images" || Object.keys(imgProgress).length > 0) && (
                        <div className="rounded-xl border border-purple-100 bg-white p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <Loader2 className={cn("h-5 w-5 text-purple-600", loading === "batch-images" && "animate-spin")} />
                            <div>
                              <h4 className="font-semibold text-gray-900">Generando imagenes...</h4>
                              <p className="text-sm text-gray-500">Max 3 en paralelo, con reintentos automaticos.</p>
                            </div>
                          </div>
                          {Object.keys(imgProgress).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(imgProgress).map(([key, imgStatus]) => (
                                <span
                                  key={key}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                                    imgStatus === "done" && "bg-green-100 text-green-700",
                                    imgStatus === "generating" && "bg-purple-100 text-purple-700",
                                    imgStatus === "retrying" && "bg-amber-100 text-amber-700",
                                    imgStatus === "error" && "bg-red-100 text-red-700",
                                    imgStatus === "pending" && "bg-gray-100 text-gray-500"
                                  )}
                                >
                                  {(imgStatus === "generating" || imgStatus === "retrying") && <Loader2 className="h-3 w-3 animate-spin" />}
                                  {imgStatus === "done" && <Check className="h-3 w-3" />}
                                  {imgStatus === "error" && <AlertTriangle className="h-3 w-3" />}
                                  {key}{imgStatus === "retrying" ? " (reintentando)" : ""}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AutoLab note */}
                      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        Proximamente: los prompts seran refinados automaticamente via AutoLab antes de generar.
                      </div>

                      {/* Per-variant: strategy card + preview */}
                      {variantes.map((v) => {
                        const toneConfig: Record<string, { label: string; accent: string; border: string; bg: string }> = {
                          A: { label: "Emocional", accent: "text-rose-600", border: "border-l-rose-400", bg: "bg-rose-50" },
                          B: { label: "Educativo", accent: "text-sky-600", border: "border-l-sky-400", bg: "bg-sky-50" },
                          C: { label: "Directo", accent: "text-amber-600", border: "border-l-amber-400", bg: "bg-amber-50" },
                        };
                        const tone = toneConfig[v.variant_label] || { label: v.variant_label, accent: "text-gray-600", border: "border-l-gray-300", bg: "bg-gray-50" };
                        const briefData = brief?.brief_yaml as Record<string, unknown> | undefined;

                        return (
                          <div key={v.id} className="space-y-4">
                            {/* Variant header */}
                            <div className="flex items-center gap-3">
                              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white", {
                                "bg-rose-500": v.variant_label === "A",
                                "bg-sky-500": v.variant_label === "B",
                                "bg-amber-500": v.variant_label === "C",
                              })}>
                                {v.variant_label}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Variante {v.variant_label} — <span className={tone.accent}>{tone.label}</span>
                                </h4>
                                <p className="text-[11px] text-gray-400">
                                  {slot.objective} · {slot.intention} · {slot.format}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
                              {/* Left: Strategy card */}
                              <div className={cn(
                                "rounded-xl border border-gray-100 bg-white overflow-hidden",
                              )}>
                                {briefData && (
                                  <div className="space-y-0">
                                    <div className={cn("px-5 py-4 border-l-[3px] border-b border-gray-50", tone.border)}>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Foco estrategico</p>
                                      <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                                        {String(briefData.topic_angle || briefData.topic || "—")}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 border-b border-gray-50">
                                      <div className="px-5 py-3 border-r border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">Hook</p>
                                        <p className="text-[12px] text-gray-700 leading-relaxed">{String(briefData.hook_direction || "—")}</p>
                                      </div>
                                      <div className="px-5 py-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">CTA</p>
                                        <p className="text-[12px] text-gray-700 leading-relaxed">{String(briefData.cta_direction || "—")}</p>
                                      </div>
                                    </div>
                                    <div className="px-5 py-3 border-b border-gray-50">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">Persona target</p>
                                      <p className="text-[12px] text-gray-700">{String(briefData.persona_target || "—")}</p>
                                    </div>
                                    {Boolean(briefData.reasoning) && (
                                      <div className={cn("px-5 py-4", tone.bg)}>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Razonamiento</p>
                                        <p className="text-[12px] text-gray-600 leading-relaxed">{String(briefData.reasoning)}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Right: Phone preview */}
                              <div className="flex items-start justify-center">
                                <InstagramPreview variante={v} format={slot.format} />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Regenerate images button (manual fallback) */}
                      {variantes.some((v) => v.art_direction_image_json && Object.keys(v.art_direction_image_json).length > 0) && (
                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateAllImages}
                            disabled={loading === "batch-images"}
                          >
                            {loading === "batch-images" ? (
                              <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Regenerando...</>
                            ) : (
                              <>
                                <ImageIcon className="mr-2 h-3.5 w-3.5" />
                                Regenerar imagenes
                              </>
                            )}
                          </Button>

                          {/* Advance to simulation */}
                          {variantes.some((v) => v.image_url) && (
                            <Button
                              onClick={async () => {
                                setLoading("advance-art");
                                setError(null);
                                try {
                                  await advanceSlotAction(slot.id, "simulating", "4-simulation");
                                  window.location.reload();
                                } catch (e) {
                                  setError(`Error avanzando: ${e instanceof Error ? e.message : e}`);
                                } finally {
                                  setLoading(null);
                                }
                              }}
                              disabled={loading === "advance-art"}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {loading === "advance-art" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Avanzando...</>
                              ) : (
                                "Continuar a Simulacion"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Simulation */}
                  {step.key === "4-simulation" && (
                    <div className="space-y-4">
                      {/* Panel de Evaluacion */}
                      <div className="rounded-xl border border-indigo-200 bg-white p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">Panel de Evaluacion</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              14 agentes IA evaluan las variantes con encuesta estructurada
                            </p>
                          </div>
                          {panelResult?.verdict ? (
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                              Ganadora: {String((panelResult.verdict as Record<string, unknown>).winner)}
                            </Badge>
                          ) : null}
                        </div>

                        {!panelResult && (
                          <div className="flex gap-2">
                            <Button
                              onClick={handlePanelEvaluate}
                              disabled={!!loading}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {loading === "panel-evaluate" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluando con panel (~45s)...</>
                              ) : (
                                <><Sparkles className="mr-2 h-4 w-4" /> Evaluar con Panel</>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handlePanelSeed}
                              disabled={!!loading}
                              size="sm"
                            >
                              {loading === "panel-seed" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando agentes...</>
                              ) : (
                                "Re-seed Agentes"
                              )}
                            </Button>
                          </div>
                        )}

                        {panelResult?.verdict ? (() => {
                          const verdict = panelResult.verdict as Record<string, unknown>;
                          const scores = (verdict.composite_scores || panelResult.composite_scores) as Record<string, number> | undefined;
                          const recs = verdict.variant_recommendations as Record<string, Record<string, string>> | undefined;
                          const agentResults = panelResult.agent_results as Array<Record<string, unknown>> | undefined;

                          const actionColorMap: Record<string, string> = {
                            publish: "bg-green-100 text-green-700",
                            story: "bg-blue-100 text-blue-700",
                            reserve: "bg-amber-100 text-amber-700",
                            repurpose: "bg-orange-100 text-orange-700",
                            archive: "bg-gray-100 text-gray-500",
                          };

                          return (
                            <div className="space-y-4">
                              {/* Composite Scores */}
                              {scores && (
                                <div className="flex gap-3">
                                  {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([label, score]) => (
                                    <div
                                      key={label}
                                      className={cn(
                                        "flex-1 rounded-lg border p-3 text-center",
                                        label === verdict.winner
                                          ? "border-indigo-300 bg-indigo-50"
                                          : "border-gray-200 bg-gray-50"
                                      )}
                                    >
                                      <div className="text-xs text-gray-500 uppercase">Variante {label}</div>
                                      <div className={cn(
                                        "text-2xl font-bold mt-1",
                                        label === verdict.winner ? "text-indigo-700" : "text-gray-700"
                                      )}>
                                        {typeof score === "number" ? score.toFixed(2) : score}
                                      </div>
                                      {label === verdict.winner && (
                                        <div className="text-xs text-indigo-600 font-medium mt-1">
                                          Ganadora ({verdict.confidence as string})
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reasoning */}
                              {verdict.reasoning && (
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                  {verdict.reasoning as string}
                                </p>
                              )}

                              {/* Variant Recommendations */}
                              {recs && (
                                <div className="space-y-2">
                                  <span className="text-xs font-semibold uppercase text-gray-400">Recomendaciones</span>
                                  {Object.entries(recs).map(([label, rec]) => (
                                    <div key={label} className="flex items-center gap-2 text-sm">
                                      <span className="font-medium text-gray-700 w-6">
                                        {label}
                                      </span>
                                      <span className={cn(
                                        "rounded-full px-2 py-0.5 text-xs font-medium",
                                        actionColorMap[rec.action] || "bg-gray-100 text-gray-500"
                                      )}>
                                        {rec.action}
                                      </span>
                                      <span className="text-gray-500 truncate">{rec.reason}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Risk Flags */}
                              {Array.isArray(verdict.risk_flags) && (verdict.risk_flags as string[]).length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-xs font-semibold uppercase text-gray-400">Riesgos</span>
                                  {(verdict.risk_flags as string[]).map((flag, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                      <span>{flag}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Agent count + tokens */}
                              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                                <span>{panelResult.agents_evaluated as number} agentes evaluados</span>
                                <span>{((panelResult.tokens_used as number) / 1000).toFixed(1)}K tokens</span>
                              </div>

                              {/* Re-evaluate button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setPanelResult(null); }}
                              >
                                Evaluar de nuevo
                              </Button>
                            </div>
                          );
                        })() : null}
                      </div>

                      {Object.keys(simulationData).length > 0 && (
                        <SimulationCard
                          simulationData={typedSimData}
                          variantes={variantes}
                        />
                      )}
                      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                        <h4 className="font-semibold text-gray-900">Preparar para MiroFish</h4>
                        <p className="text-sm text-gray-500">
                          Genera un documento seed en Markdown con las variantes, personas y criterios de
                          evaluacion para copiar a MiroFish.
                        </p>
                        <Button
                          onClick={handlePrepareMirofish}
                          disabled={loading === "mirofish"}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {loading === "mirofish" ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando Seed...</>
                          ) : (
                            "Preparar Seed para MiroFish"
                          )}
                        </Button>
                        {(() => {
                          const displayMd = mirofishMd || slot.simulation_md;
                          if (!displayMd) return null;
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase text-gray-400">Seed Document</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(displayMd)}
                                >
                                  Copiar al Clipboard
                                </Button>
                              </div>
                              <pre className="max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700 whitespace-pre-wrap">
                                {displayMd}
                              </pre>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Approval */}
                  {step.key === "5-approved" && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Resumen Final
                      </h4>
                      {winnerVariant ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            La variante ganadora es{" "}
                            <span className="font-bold text-purple-700">
                              {winnerVariant.variant_label}
                            </span>{" "}
                            {winnerVariant.simulation_score !== null && (
                              <>
                                con un puntaje de{" "}
                                <span className="font-bold text-green-700">
                                  {winnerVariant.simulation_score?.toFixed(1)}
                                </span>
                              </>
                            )}
                          </p>
                          {winnerVariant.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={winnerVariant.image_url}
                              alt="Variante ganadora"
                              className="max-w-xs rounded-lg border"
                            />
                          )}
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading === "approve-final"}
                            onClick={handleApproveForPublish}
                          >
                            {loading === "approve-final" ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprobando...</>
                            ) : (
                              "Aprobar para Publicacion"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500">
                            {variantes.length > 0
                              ? "Las variantes estan listas para revision."
                              : "Aun no hay datos de simulacion disponibles."}
                          </p>
                          {variantes.length > 0 && (
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              disabled={loading === "approve-final"}
                              onClick={handleApproveForPublish}
                            >
                              {loading === "approve-final" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprobando...</>
                              ) : (
                                "Aprobar para Publicacion"
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback panel for steps that support it */}
                  {step.feedbackStep && status !== "pending" && (
                    <FeedbackPanel
                      feedbackItems={stepFeedback}
                      slotId={slot.id}
                      step={step.feedbackStep}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
