"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FeedbackPanel } from "@/components/feedback/feedback-panel";
import { BriefStep } from "@/components/slot/steps/brief-step";
import { ContentStep } from "@/components/slot/steps/content-step";
import { ArtStep } from "@/components/slot/steps/art-step";
import { SimulationStep } from "@/components/slot/steps/simulation-step";
import { ApprovalStep } from "@/components/slot/steps/approval-step";
import { useSlotWorkflow, opBelongsToStep } from "@/components/slot/use-slot-workflow";
import type { Slot, Brief, Variante, Feedback, SlotStep } from "@/lib/types";

// ─── Config ──────────────────────────────────────────────────────────────────

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
  { key: "3-art", title: "Direccion de Arte", feedbackStep: "art" },
  { key: "4-simulation", title: "Simulacion", feedbackStep: "simulation" },
  { key: "5-approved", title: "Aprobacion Final" },
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

// ─── Component ───────────────────────────────────────────────────────────────

export function TimelineView({
  slot,
  brief,
  variantes,
  feedbackItems,
  simulationData,
  projectId,
  campaignId,
}: TimelineViewProps) {
  const wf = useSlotWorkflow({
    slot,
    brief,
    variantes,
    feedbackItems,
    simulationData,
    projectId,
    campaignId,
  });

  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(
    () => new Set([slot.current_step])
  );
  const [highlightedStep, setHighlightedStep] = React.useState<string | null>(null);
  const stepRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // ── Auto-advance ───────────────────────────────────────────────────────
  const prevStep = React.useRef(slot.current_step);

  React.useEffect(() => {
    const effectiveStep = wf.effectiveCurrentStep;
    if (effectiveStep !== prevStep.current) {
      const fromStep = prevStep.current;
      const toStep = effectiveStep;
      prevStep.current = toStep;

      // Auto-advance: collapse old, expand new, scroll
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        next.delete(fromStep);
        next.add(toStep);
        return next;
      });

      // Scroll to new step after a tick (let DOM update)
      setTimeout(() => {
        stepRefs.current
          .get(toStep)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);

      // Highlight effect
      setHighlightedStep(toStep);
      setTimeout(() => setHighlightedStep(null), 1500);
    }
  }, [wf.effectiveCurrentStep]);

  // Also track server-side current_step changes
  React.useEffect(() => {
    if (slot.current_step !== prevStep.current) {
      prevStep.current = slot.current_step;
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        next.add(slot.current_step);
        return next;
      });
    }
  }, [slot.current_step]);

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

  // ── Hook selection handler ─────────────────────────────────────────────
  function handleSelectHook(hookId: number) {
    wf.setSelectedHooks((prev) => {
      if (prev.includes(hookId)) return prev.filter((id) => id !== hookId);
      if (prev.length >= 3) return prev;
      return [...prev, hookId];
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="relative space-y-0">
      {stepsConfig.map((step, idx) => {
        const status = getStepStatus(step.key, wf.effectiveCurrentStep);
        const isExpanded = expandedSteps.has(step.key);
        const isLast = idx === stepsConfig.length - 1;
        const stepFeedback = step.feedbackStep
          ? feedbackItems.filter((f) => f.step === step.feedbackStep)
          : [];
        const isStepLoading = opBelongsToStep(wf.activeOp, step.key);
        const isHighlighted = highlightedStep === step.key;

        return (
          <div
            key={step.key}
            ref={(el) => {
              if (el) stepRefs.current.set(step.key, el);
            }}
            className={cn(
              "relative flex gap-4 transition-all duration-300",
              isHighlighted && "ring-2 ring-purple-300 ring-offset-2 rounded-lg"
            )}
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => toggleStep(step.key)}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all duration-300"
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
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 transition-colors duration-500",
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
                    "text-lg font-semibold transition-colors duration-300",
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

              {/* Inline loading bar for active step */}
              {isStepLoading && (
                <div className="mt-2 h-0.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-purple-500 animate-pulse" />
                </div>
              )}

              {/* Animated expand/collapse with CSS grid */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div
                    className={cn(
                      "space-y-4 transition-opacity duration-200",
                      isStepLoading && "opacity-60 pointer-events-none"
                    )}
                  >
                    {/* Step 1: Brief */}
                    {step.key === "1-brief" && (
                      <BriefStep
                        brief={brief}
                        activeOp={wf.activeOp}
                        error={wf.stepErrors["1-brief"] ?? null}
                        onGenerate={wf.handleGenerateBrief}
                        onApprove={wf.handleApproveBrief}
                        onRegenerate={wf.handleRegenerateBrief}
                      />
                    )}

                    {/* Step 2: Content */}
                    {step.key === "2-content" && (
                      <ContentStep
                        variantes={variantes}
                        hooks={wf.hooks}
                        selectedHooks={wf.selectedHooks}
                        artProgress={wf.artProgress}
                        activeOp={wf.activeOp}
                        error={wf.stepErrors["2-content"] ?? null}
                        onGenerateHooks={wf.handleGenerateHooks}
                        onSelectHook={handleSelectHook}
                        onGenerateVariantesFromHooks={wf.handleGenerateVariantesFromHooks}
                        onRegenerateVariantes={wf.handleGenerateVariantes}
                        onContinueToArt={wf.handleAutoGenerateArt}
                      />
                    )}

                    {/* Step 3: Art Direction */}
                    {step.key === "3-art" && (
                      <ArtStep
                        slot={slot}
                        brief={brief}
                        variantes={variantes}
                        imgProgress={wf.imgProgress}
                        activeOp={wf.activeOp}
                        error={wf.stepErrors["3-art"] ?? null}
                        onGenerateImages={wf.handleGenerateAllImages}
                        onAdvanceToSimulation={wf.handleAdvanceToSimulation}
                      />
                    )}

                    {/* Step 4: Simulation */}
                    {step.key === "4-simulation" && (
                      <SimulationStep
                        slot={slot}
                        variantes={variantes}
                        simulationData={simulationData}
                        panelResult={wf.panelResult}
                        deepSimResult={wf.deepSimResult}
                        deepSimPhase={wf.deepSimPhase}
                        deepSimMeta={wf.deepSimMeta}
                        mirofishMd={wf.mirofishMd}
                        activeOp={wf.activeOp}
                        error={wf.stepErrors["4-simulation"] ?? null}
                        onPanelEvaluate={wf.handlePanelEvaluate}
                        onPanelSeed={wf.handlePanelSeed}
                        onDeepSimulation={wf.handleDeepSimulation}
                        onSurveyAgents={wf.handleSurveyAgents}
                        onPrepareMirofish={wf.handlePrepareMirofish}
                        onResetPanel={() => wf.setPanelResult(null)}
                        onResetDeepSim={() => {
                          wf.setDeepSimResult(null);
                          wf.setDeepSimMeta(null);
                        }}
                      />
                    )}

                    {/* Step 5: Approval */}
                    {step.key === "5-approved" && (
                      <ApprovalStep
                        variantes={variantes}
                        winnerVariant={wf.winnerVariant}
                        activeOp={wf.activeOp}
                        error={wf.stepErrors["5-approved"] ?? null}
                        onApprove={wf.handleApproveForPublish}
                      />
                    )}

                    {/* Feedback panel */}
                    {step.feedbackStep && status !== "pending" && (
                      <FeedbackPanel
                        feedbackItems={stepFeedback}
                        slotId={slot.id}
                        step={step.feedbackStep}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
