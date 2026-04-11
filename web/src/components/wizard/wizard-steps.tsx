"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { WizardPhase } from "@/lib/types";

const steps: { key: WizardPhase; label: string }[] = [
  { key: "config", label: "Configuracion" },
  { key: "chat", label: "Estratega" },
  { key: "review", label: "Parrilla" },
  { key: "done", label: "Listo" },
];

const phaseOrder: WizardPhase[] = ["config", "chat", "review", "done"];

export function WizardSteps({ currentPhase }: { currentPhase: WizardPhase }) {
  const currentIdx = phaseOrder.indexOf(currentPhase);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                  isCompleted && "border-green-500 bg-green-500 text-white",
                  isActive &&
                    "border-purple-600 bg-purple-50 text-purple-700 ring-4 ring-purple-100",
                  !isCompleted &&
                    !isActive &&
                    "border-gray-200 bg-white text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCompleted && "text-green-700",
                  isActive && "text-purple-700",
                  !isCompleted && !isActive && "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-3 mt-[-1.25rem] transition-colors duration-500",
                  idx < currentIdx ? "bg-green-400" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
