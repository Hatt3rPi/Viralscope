"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Variante } from "@/lib/types";

const scoringAxes = [
  "atencion",
  "resonancia",
  "shareability",
  "brand_fit",
  "claridad_cta",
  "memorabilidad",
];

const axisLabel: Record<string, string> = {
  atencion: "Atención",
  resonancia: "Resonancia",
  shareability: "Shareability",
  brand_fit: "Brand Fit",
  claridad_cta: "Claridad CTA",
  memorabilidad: "Memorabilidad",
};

interface SimulationCardProps {
  simulationData: Record<
    string,
    { weight: number; scores: Record<string, Record<string, number>> }
  >;
  variantes: Variante[];
}

export function SimulationCard({
  simulationData,
  variantes,
}: SimulationCardProps) {
  const labels = variantes.map((v) => v.variant_label);

  // Find winning variant
  const winnerLabel = variantes.reduce<string | null>((best, v) => {
    if (v.simulation_score === null) return best;
    const bestVar = variantes.find((vv) => vv.variant_label === best);
    if (!bestVar || bestVar.simulation_score === null) return v.variant_label;
    return v.simulation_score > bestVar.simulation_score
      ? v.variant_label
      : best;
  }, null);

  // Aggregate scores per axis per variant
  function getAxisScore(axis: string, variantLabel: string): number {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [, persona] of Object.entries(simulationData)) {
      const weight = persona.weight || 1;
      const score = persona.scores?.[variantLabel]?.[axis] ?? 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulación de Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left font-medium text-gray-500">
                  Eje
                </th>
                {labels.map((label) => (
                  <th
                    key={label}
                    className={cn(
                      "px-3 py-2 text-center font-medium",
                      label === winnerLabel
                        ? "text-green-700"
                        : "text-gray-500"
                    )}
                  >
                    Variante {label}
                    {label === winnerLabel && (
                      <Badge variant="success" className="ml-1.5">
                        Ganadora
                      </Badge>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scoringAxes.map((axis) => (
                <tr key={axis}>
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {axisLabel[axis] || axis}
                  </td>
                  {labels.map((label) => {
                    const score = getAxisScore(axis, label);
                    return (
                      <td key={label} className="px-3 py-2 text-center">
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            score >= 8
                              ? "text-green-600"
                              : score >= 6
                                ? "text-yellow-600"
                                : "text-red-600"
                          )}
                        >
                          {score.toFixed(1)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="px-3 py-2 font-bold text-gray-700">Total</td>
                {labels.map((label) => {
                  const v = variantes.find(
                    (vv) => vv.variant_label === label
                  );
                  return (
                    <td
                      key={label}
                      className={cn(
                        "px-3 py-2 text-center text-lg font-bold",
                        label === winnerLabel
                          ? "text-green-700"
                          : "text-gray-700"
                      )}
                    >
                      {v?.simulation_score?.toFixed(1) ?? "—"}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Per-persona breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Detalle por Persona
          </h4>
          {Object.entries(simulationData).map(([personaName, persona]) => (
            <div
              key={personaName}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {personaName}
                </span>
                <Badge variant="info">Peso: {persona.weight}</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-1 text-left text-gray-500">
                        Eje
                      </th>
                      {labels.map((label) => (
                        <th
                          key={label}
                          className="px-2 py-1 text-center text-gray-500"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scoringAxes.map((axis) => (
                      <tr key={axis} className="border-b border-gray-100">
                        <td className="px-2 py-1 text-gray-600">
                          {axisLabel[axis] || axis}
                        </td>
                        {labels.map((label) => {
                          const score =
                            persona.scores?.[label]?.[axis] ?? 0;
                          return (
                            <td
                              key={label}
                              className="px-2 py-1 text-center font-mono"
                            >
                              {score.toFixed(1)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
