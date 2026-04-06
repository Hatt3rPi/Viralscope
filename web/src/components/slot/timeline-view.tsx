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

  // ── Auto-generate art direction for all variants ───────────────────
  async function handleAutoGenerateArt() {
    if (loading) return;
    setLoading("auto-art");
    setError(null);

    const labels = variantes.map((v) => v.variant_label);
    const progress: Record<string, "pending" | "generating" | "done" | "error"> = {};
    labels.forEach((l) => (progress[l] = "pending"));
    setArtProgress({ ...progress });

    try {
      // Advance slot first
      await advanceSlotAction(slot.id, "art_review", "3-art");

      // Generate art for all variants in parallel
      const results = await Promise.allSettled(
        labels.map(async (label) => {
          setArtProgress((prev) => ({ ...prev, [label]: "generating" }));
          await callEdgeFunction("generate-art", {
            slot_id: slot.id,
            variant_label: label,
          });
          setArtProgress((prev) => ({ ...prev, [label]: "done" }));
        })
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        failed.forEach((_, i) => {
          const label = labels[results.indexOf(failed[i]!)];
          if (label) setArtProgress((prev) => ({ ...prev, [label]: "error" }));
        });
        setError(`${failed.length} variante(s) fallaron al generar arte`);
      }

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
          const key = `${v.variant_label}-s${slide.slide_number}`;
          jobs.push({
            prompt_string: (slide.prompt_string as string) || "",
            negative_prompt: (slide.negative_prompt as string) || "",
            aspect_ratio: "1:1",
            slot_id: slot.id,
            variant_label: v.variant_label,
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

                  {/* Step 2: Content */}
                  {step.key === "2-content" && (
                    <div className="space-y-4">
                      {variantes.length > 0 ? (
                        <VarianteTabs variantes={variantes} />
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center space-y-3">
                          <p className="text-sm text-gray-500">
                            No hay variantes generadas aun.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleGenerateVariantes}
                          disabled={loading === "variantes"}
                          variant={variantes.length > 0 ? "outline" : "default"}
                          className={variantes.length > 0 ? "" : "bg-purple-600 hover:bg-purple-700"}
                        >
                          {loading === "variantes" ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Variantes...</>
                          ) : variantes.length > 0 ? (
                            "Regenerar Variantes"
                          ) : (
                            "Generar 3 Variantes con IA"
                          )}
                        </Button>
                        {variantes.length > 0 && (
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
                        )}
                        {/* Art generation progress chips */}
                        {Object.keys(artProgress).length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {Object.entries(artProgress).map(([label, status]) => (
                              <span
                                key={label}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                                  status === "done" && "bg-green-100 text-green-700",
                                  status === "generating" && "bg-purple-100 text-purple-700",
                                  status === "error" && "bg-red-100 text-red-700",
                                  status === "pending" && "bg-gray-100 text-gray-500"
                                )}
                              >
                                {status === "generating" && <Loader2 className="h-3 w-3 animate-spin" />}
                                {status === "done" && <Check className="h-3 w-3" />}
                                {status === "error" && <AlertTriangle className="h-3 w-3" />}
                                Variante {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Art Direction */}
                  {step.key === "3-art" && (
                    <div className="space-y-6">
                      {variantes.length === 0 && (
                        <p className="text-sm text-gray-400">Primero genera variantes en el paso anterior.</p>
                      )}

                      {/* Batch generate all images button */}
                      {variantes.some((v) => v.art_direction_image_json && Object.keys(v.art_direction_image_json).length > 0) && (
                        <div className="rounded-xl border border-purple-100 bg-white p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-purple-600" />
                                Generacion de Imagenes
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Genera imagenes para todas las variantes en paralelo (max 3 simultaneas, con reintentos automaticos).
                              </p>
                            </div>
                            <Button
                              onClick={handleGenerateAllImages}
                              disabled={loading === "batch-images"}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {loading === "batch-images" ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                              ) : (
                                <>
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Generar Todas las Imagenes
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Image generation progress */}
                          {Object.keys(imgProgress).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(imgProgress).map(([key, status]) => (
                                <span
                                  key={key}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                                    status === "done" && "bg-green-100 text-green-700",
                                    status === "generating" && "bg-purple-100 text-purple-700",
                                    status === "retrying" && "bg-amber-100 text-amber-700",
                                    status === "error" && "bg-red-100 text-red-700",
                                    status === "pending" && "bg-gray-100 text-gray-500"
                                  )}
                                >
                                  {(status === "generating" || status === "retrying") && <Loader2 className="h-3 w-3 animate-spin" />}
                                  {status === "done" && <Check className="h-3 w-3" />}
                                  {status === "error" && <AlertTriangle className="h-3 w-3" />}
                                  {key}{status === "retrying" ? " (reintentando)" : ""}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* AutoLab placeholder note */}
                          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            Proximamente: los prompts seran refinados automaticamente via AutoLab antes de generar.
                          </div>
                        </div>
                      )}

                      {/* Art direction cards per variant */}
                      {variantes.map((v) => (
                        <div key={v.id} className="space-y-4">
                          {(!v.art_direction_image_json || Object.keys(v.art_direction_image_json).length === 0) && (
                            <Button
                              onClick={() => handleGenerateArt(v.variant_label)}
                              disabled={loading === `art-${v.variant_label}`}
                              className="bg-purple-600 hover:bg-purple-700"
                              size="sm"
                            >
                              {loading === `art-${v.variant_label}` ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Arte {v.variant_label}...</>
                              ) : (
                                `Generar Art Direction — Variante ${v.variant_label}`
                              )}
                            </Button>
                          )}
                          <div className="grid gap-6 lg:grid-cols-2">
                            <ArtDirectionCard
                              variante={v}
                              onGenerateImage={async () => {
                                const imgDir = v.art_direction_image_json as Record<string, unknown>;
                                const prompt = (imgDir?.prompt_string as string) || "";
                                const negative = (imgDir?.negative_prompt as string) || "";
                                if (!prompt) return alert("No hay prompt de imagen. Genera art direction primero.");

                                const btn = document.activeElement as HTMLButtonElement;
                                if (btn) { btn.textContent = "Generando..."; btn.disabled = true; }

                                try {
                                  const res = await fetch(
                                    `${supabaseUrl}/functions/v1/generate-image`,
                                    {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        prompt_string: prompt,
                                        negative_prompt: negative,
                                        aspect_ratio: slot.format === "reel" || slot.format === "story" ? "9:16" : "1:1",
                                        slot_id: slot.id,
                                        variant_label: v.variant_label,
                                      }),
                                    }
                                  );
                                  const data = await res.json();
                                  if (data.image_url) {
                                    window.location.reload();
                                  } else {
                                    alert(`Error: ${data.error || "Sin imagen"}`);
                                  }
                                } catch (err) {
                                  alert(`Error: ${err}`);
                                } finally {
                                  if (btn) { btn.textContent = "Generar Imagen"; btn.disabled = false; }
                                }
                              }}
                            />
                            <div className="flex items-start justify-center">
                              <InstagramPreview variante={v} format={slot.format} />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Advance to simulation */}
                      {variantes.some((v) => v.image_url) && (
                        <div className="flex justify-end pt-2">
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
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Simulation */}
                  {step.key === "4-simulation" && (
                    <div className="space-y-4">
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
