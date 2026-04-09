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

interface PersonaData {
  weight: number;
  scores: Record<string, Record<string, number>>;
  age?: number;
  gender?: string;
}

interface SimulationCardProps {
  simulationData: Record<string, PersonaData>;
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

  // Radar chart helpers
  const RADAR_SIZE = 280;
  const RADAR_CENTER = RADAR_SIZE / 2;
  const RADAR_RADIUS = 100;
  const ANGLE_OFFSET = -Math.PI / 2; // start from top

  function polarToXY(axisIndex: number, value: number): [number, number] {
    const angle = ANGLE_OFFSET + (2 * Math.PI * axisIndex) / scoringAxes.length;
    const r = (value / 10) * RADAR_RADIUS;
    return [RADAR_CENTER + r * Math.cos(angle), RADAR_CENTER + r * Math.sin(angle)];
  }

  function polygonPoints(variantLabel: string): string {
    return scoringAxes
      .map((axis, i) => {
        const score = getAxisScore(axis, variantLabel);
        const [x, y] = polarToXY(i, score);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const variantColors: Record<string, { stroke: string; fill: string }> = {
    A: { stroke: "#16a34a", fill: "rgba(22,163,74,0.15)" },
    B: { stroke: "#f97316", fill: "rgba(249,115,22,0.15)" },
    C: { stroke: "#8b5cf6", fill: "rgba(139,92,246,0.15)" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulación de Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <div className="flex flex-col items-center gap-3">
          <svg
            viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
            className="w-full max-w-xs"
            style={{ height: "280px" }}
          >
            {/* Grid circles */}
            {[2, 4, 6, 8, 10].map((level) => (
              <circle
                key={level}
                cx={RADAR_CENTER}
                cy={RADAR_CENTER}
                r={(level / 10) * RADAR_RADIUS}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={level === 10 ? 1.5 : 0.5}
              />
            ))}
            {/* Grid scale labels */}
            {[2, 4, 6, 8, 10].map((level) => {
              const [, y] = polarToXY(0, level);
              return (
                <text
                  key={level}
                  x={RADAR_CENTER + 4}
                  y={y - 2}
                  fontSize={8}
                  fill="#9ca3af"
                >
                  {level}
                </text>
              );
            })}
            {/* Axis lines + labels */}
            {scoringAxes.map((axis, i) => {
              const [x, y] = polarToXY(i, 10);
              const [lx, ly] = polarToXY(i, 12.5);
              return (
                <g key={axis}>
                  <line
                    x1={RADAR_CENTER}
                    y1={RADAR_CENTER}
                    x2={x}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={0.5}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill="#6b7280"
                  >
                    {axisLabel[axis]}
                  </text>
                </g>
              );
            })}
            {/* Variant polygons */}
            {labels.map((label) => {
              const colors = variantColors[label] || { stroke: "#6b7280", fill: "rgba(107,114,128,0.1)" };
              return (
                <polygon
                  key={label}
                  points={polygonPoints(label)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              );
            })}
            {/* Score dots */}
            {labels.map((label) => {
              const colors = variantColors[label] || { stroke: "#6b7280", fill: "rgba(107,114,128,0.1)" };
              return scoringAxes.map((axis, i) => {
                const score = getAxisScore(axis, label);
                const [x, y] = polarToXY(i, score);
                return (
                  <circle
                    key={`${label}-${axis}`}
                    cx={x}
                    cy={y}
                    r={3}
                    fill={colors.stroke}
                  />
                );
              });
            })}
          </svg>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {labels.map((label) => {
              const colors = variantColors[label] || { stroke: "#6b7280" };
              return (
                <span key={label} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: colors.stroke }}
                  />
                  Variante {label}
                  {label === winnerLabel && (
                    <Badge variant="success" className="ml-0.5 text-[10px] px-1 py-0">
                      Ganadora
                    </Badge>
                  )}
                </span>
              );
            })}
          </div>
        </div>

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

        {/* Audience Insights */}
        {(() => {
          const personas = Object.values(simulationData);
          const n = personas.length;
          if (n === 0) return null;

          // Gender distribution
          const genderCounts: Record<string, number> = {};
          for (const p of personas) {
            const g = (p.gender || "otro").toLowerCase();
            const key = g.startsWith("m") && !g.startsWith("mu") ? "Hombres"
              : g.startsWith("f") || g.startsWith("mu") ? "Mujeres"
              : "Otro";
            genderCounts[key] = (genderCounts[key] || 0) + 1;
          }

          // Age ranges (IG-style buckets)
          const ageBuckets: Record<string, number> = {
            "13-17": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45-54": 0, "55-64": 0, "65+": 0,
          };
          for (const p of personas) {
            const age = p.age || 0;
            if (age < 18) ageBuckets["13-17"]++;
            else if (age < 25) ageBuckets["18-24"]++;
            else if (age < 35) ageBuckets["25-34"]++;
            else if (age < 45) ageBuckets["35-44"]++;
            else if (age < 55) ageBuckets["45-54"]++;
            else if (age < 65) ageBuckets["55-64"]++;
            else ageBuckets["65+"]++;
          }
          // Filter out empty buckets
          const activeAgeBuckets = Object.entries(ageBuckets).filter(([, count]) => count > 0);
          const maxAgeCount = Math.max(...activeAgeBuckets.map(([, c]) => c));

          const genderColors: Record<string, string> = {
            Hombres: "#3b82f6",
            Mujeres: "#ec4899",
            Otro: "#9ca3af",
          };

          return (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Audiencia encuestada
              </h4>

              {/* N + Gender row */}
              <div className="flex items-start gap-6">
                {/* N */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{n}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Encuestados</div>
                </div>

                {/* Gender donut-style bars */}
                <div className="flex-1 space-y-1.5">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">Sexo</div>
                  {/* Stacked bar */}
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
                    {Object.entries(genderCounts).map(([label, count]) => (
                      <div
                        key={label}
                        className="h-full transition-all"
                        style={{
                          width: `${(count / n) * 100}%`,
                          backgroundColor: genderColors[label] || "#9ca3af",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 text-[11px] text-gray-600">
                    {Object.entries(genderCounts).map(([label, count]) => (
                      <span key={label} className="flex items-center gap-1">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: genderColors[label] || "#9ca3af" }}
                        />
                        {label} {Math.round((count / n) * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age distribution bars (IG style) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Rango etario</div>
                <div className="space-y-1">
                  {activeAgeBuckets.map(([range, count]) => (
                    <div key={range} className="flex items-center gap-2">
                      <span className="w-10 text-right text-[11px] text-gray-500 font-mono">{range}</span>
                      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{ width: `${(count / maxAgeCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-[11px] text-gray-500 font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
