"use client";

import * as React from "react";
import { Check, Circle, Loader2 } from "lucide-react";
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
                            onClick={async () => {
                              setLoading("advance-content");
                              setError(null);
                              try {
                                await advanceSlotAction(slot.id, "art_review", "3-art");
                                window.location.reload();
                              } catch (e) {
                                setError(`Error avanzando: ${e instanceof Error ? e.message : e}`);
                              } finally {
                                setLoading(null);
                              }
                            }}
                            disabled={loading === "advance-content"}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {loading === "advance-content" ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Avanzando...</>
                            ) : (
                              "Continuar a Direccion de Arte"
                            )}
                          </Button>
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
                      {variantes.map((v) => (
                        <div key={v.id} className="space-y-4">
                          {/* Generate Art Direction button per variant */}
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
                                const prompt = imgDir?.prompt_string as string;
                                const negative = imgDir?.negative_prompt as string;
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
                                        negative_prompt: negative || "",
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
                              <InstagramPreview variante={v} />
                            </div>
                          </div>
                        </div>
                      ))}
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
