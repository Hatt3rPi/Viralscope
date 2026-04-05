"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BriefCard } from "@/components/slot/brief-card";
import { VarianteTabs } from "@/components/slot/variante-tabs";
import { ArtDirectionCard } from "@/components/slot/art-direction-card";
import { InstagramPreview } from "@/components/slot/instagram-preview";
import { SimulationCard } from "@/components/slot/simulation-card";
import { FeedbackPanel } from "@/components/feedback/feedback-panel";
import type { Slot, Brief, Variante, Feedback, SlotStep } from "@/lib/types";

interface TimelineViewProps {
  slot: Slot;
  brief: Brief | null;
  variantes: Variante[];
  feedbackItems: Feedback[];
  simulationData: Record<string, unknown>;
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
}: TimelineViewProps) {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(() => {
    return new Set([slot.current_step]);
  });

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
                  {/* Step 1: Brief */}
                  {step.key === "1-brief" && brief && <BriefCard brief={brief} />}

                  {/* Step 2: Content */}
                  {step.key === "2-content" && variantes.length > 0 && (
                    <VarianteTabs variantes={variantes} />
                  )}

                  {/* Step 3: Art Direction */}
                  {step.key === "3-art" && (
                    <div className="space-y-6">
                      {variantes.map((v) => (
                        <div
                          key={v.id}
                          className="grid gap-6 lg:grid-cols-2"
                        >
                          <ArtDirectionCard variante={v} />
                          <div className="flex items-start justify-center">
                            <InstagramPreview variante={v} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 4: Simulation */}
                  {step.key === "4-simulation" &&
                    Object.keys(simulationData).length > 0 && (
                      <SimulationCard
                        simulationData={typedSimData}
                        variantes={variantes}
                      />
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
                            con un puntaje de{" "}
                            <span className="font-bold text-green-700">
                              {winnerVariant.simulation_score?.toFixed(1)}
                            </span>
                          </p>
                          {winnerVariant.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={winnerVariant.image_url}
                              alt="Variante ganadora"
                              className="max-w-xs rounded-lg border"
                            />
                          )}
                          <Button className="bg-green-600 hover:bg-green-700">
                            Aprobar para Publicación
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Aún no hay datos de simulación disponibles.
                        </p>
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
