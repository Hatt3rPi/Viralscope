"use client";

import * as React from "react";
import {
  TabsContainer,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Variante } from "@/lib/types";

interface VarianteTabsProps {
  variantes: Variante[];
}

function scoreColor(score: number | null): string {
  if (score === null) return "bg-gray-200";
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function RenderCopyMd({ content }: { content: string }) {
  const sections = content.split(/(?=^## )/m);

  return (
    <div className="prose prose-sm max-w-none space-y-4">
      {sections.map((section, i) => {
        const lines = section.trim().split("\n");
        const firstLine = lines[0];
        const isHeading = firstLine?.startsWith("## ");
        const heading = isHeading ? firstLine.replace("## ", "") : null;
        const body = isHeading ? lines.slice(1).join("\n").trim() : section.trim();

        return (
          <div key={i}>
            {heading && (
              <h4 className="text-sm font-bold uppercase tracking-wide text-purple-700">
                {heading}
              </h4>
            )}
            {body && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function VarianteTabs({ variantes }: VarianteTabsProps) {
  const defaultTab = variantes[0]?.variant_label || "A";

  return (
    <TabsContainer defaultValue={defaultTab}>
      <TabsList>
        {variantes.map((v) => (
          <TabsTrigger key={v.variant_label} value={v.variant_label}>
            Variante {v.variant_label}
          </TabsTrigger>
        ))}
      </TabsList>

      {variantes.map((v) => (
        <TabsContent key={v.variant_label} value={v.variant_label}>
          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
            <RenderCopyMd content={v.copy_md} />

            {/* Simulation Score Gauge */}
            <div className="space-y-2">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {v.simulation_score !== null
                    ? v.simulation_score.toFixed(1)
                    : "—"}
                </span>
                <span className="mb-1 text-sm text-gray-500">
                  / 100 puntos de simulación
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    scoreColor(v.simulation_score)
                  )}
                  style={{
                    width: `${v.simulation_score ?? 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      ))}
    </TabsContainer>
  );
}
