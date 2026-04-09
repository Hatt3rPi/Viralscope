"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Variante } from "@/lib/types";

// ── Types ───────────────────────────────────────────────────
interface SurveyData {
  checklist?: Record<string, Record<string, boolean>>;
  behavioral?: Record<string, { age: number; gender: string; responses: Record<string, unknown> }>;
  metrics?: Record<string, { stop_rate: number; send_rate: number; save_rate: number; comment_rate: number }>;
  emotions?: Record<string, Record<string, number>>;
  synthesis?: {
    variants?: Record<string, { fortalezas?: string[]; debilidades?: string[]; mejoras?: string[] }>;
    veredicto?: string;
    winner?: string;
  };
  survey_scores?: Record<string, number>;
  survey_winner?: string;
}

interface SimulationCardProps {
  simulationData: SurveyData | Record<string, unknown>;
  variantes: Variante[];
}

const CHECKLIST_LABELS: Record<string, { label: string; group: string }> = {
  hook_3_words: { label: "Hook en 3 palabras", group: "Hook" },
  pattern_interrupt: { label: "Pattern interrupt", group: "Hook" },
  works_muted: { label: "Funciona sin audio", group: "Hook" },
  practical_value: { label: "Utilidad practica", group: "Valor" },
  save_worthy: { label: "Vale guardar", group: "Valor" },
  trigger_frequency: { label: "Trigger cotidiano", group: "Valor" },
  send_trigger: { label: "Send trigger", group: "Distribucion" },
  conversation_starter: { label: "Genera debate", group: "Distribucion" },
  format_fit: { label: "Formato correcto", group: "Distribucion" },
  organic_brand: { label: "Marca organica", group: "Marca" },
};

const METRIC_CONFIG = [
  { key: "stop_rate", label: "Stop Rate", desc: "detendrian su scroll" },
  { key: "send_rate", label: "Send Rate", desc: "lo mandarian por DM" },
  { key: "save_rate", label: "Save Rate", desc: "lo guardarian" },
  { key: "comment_rate", label: "Comment Rate", desc: "comentarian" },
];

const VARIANT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" },
  B: { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" },
  C: { bg: "bg-purple-50", text: "text-purple-700", bar: "bg-purple-500" },
};

export function SimulationCard({ simulationData, variantes }: SimulationCardProps) {
  const data = simulationData as SurveyData;
  const labels = variantes.map((v) => v.variant_label);
  const winner = data.survey_winner || data.synthesis?.winner || null;

  // Check if we have the new 3-layer format
  const hasNewFormat = !!data.checklist || !!data.metrics;
  if (!hasNewFormat) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluacion de Contenido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* ── Section 1: Technical Checklist ──────────────────── */}
        {data.checklist && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Checklist Tecnico
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Criterio</th>
                    {labels.map((label) => (
                      <th key={label} className={cn(
                        "px-3 py-2 text-center font-medium",
                        label === winner ? "text-green-700" : "text-gray-500"
                      )}>
                        {label}
                        {label === winner && <Badge variant="success" className="ml-1.5">Ganadora</Badge>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(CHECKLIST_LABELS).map(([key, { label, group }], i, arr) => {
                    const prevGroup = i > 0 ? arr[i - 1][1].group : null;
                    const showGroup = group !== prevGroup;
                    return (
                      <React.Fragment key={key}>
                        {showGroup && (
                          <tr>
                            <td colSpan={labels.length + 1} className="px-3 pt-3 pb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{group}</span>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="px-3 py-1.5 text-gray-600">{label}</td>
                          {labels.map((varLabel) => {
                            const val = data.checklist?.[varLabel]?.[key];
                            return (
                              <td key={varLabel} className="px-3 py-1.5 text-center text-base">
                                {val ? (
                                  <span className="text-green-600">&#10003;</span>
                                ) : (
                                  <span className="text-red-400">&#10007;</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td className="px-3 py-2 font-bold text-gray-700">Score</td>
                    {labels.map((varLabel) => {
                      const passed = Object.values(data.checklist?.[varLabel] || {}).filter(Boolean).length;
                      return (
                        <td key={varLabel} className={cn(
                          "px-3 py-2 text-center font-bold text-lg",
                          varLabel === winner ? "text-green-700" : "text-gray-700"
                        )}>
                          {passed}/10
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ── Section 2: Behavioral Metrics ──────────────────── */}
        {data.metrics && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Comportamiento Simulado
            </h4>
            {METRIC_CONFIG.map(({ key, label, desc }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-[10px] text-gray-400">{desc}</span>
                </div>
                <div className="space-y-1">
                  {labels.map((varLabel) => {
                    const rate = (data.metrics?.[varLabel] as Record<string, number>)?.[key] ?? 0;
                    const pct = Math.round(rate * 100);
                    const colors = VARIANT_COLORS[varLabel] || VARIANT_COLORS.A;
                    return (
                      <div key={varLabel} className="flex items-center gap-2">
                        <span className="w-4 text-xs font-bold text-gray-500">{varLabel}</span>
                        <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", colors.bar)}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className={cn("w-10 text-right text-sm font-bold", colors.text)}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Section 3: Emotion Map ─────────────────────────── */}
        {data.emotions && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Mapa Emocional
            </h4>
            <div className="space-y-2">
              {labels.map((varLabel) => {
                const emoMap = data.emotions?.[varLabel] || {};
                const sorted = Object.entries(emoMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
                const colors = VARIANT_COLORS[varLabel] || VARIANT_COLORS.A;
                if (sorted.length === 0) return null;
                return (
                  <div key={varLabel} className="flex items-start gap-2">
                    <span className={cn("text-xs font-bold mt-0.5", colors.text)}>{varLabel}</span>
                    <div className="flex flex-wrap gap-1">
                      {sorted.map(([emotion, count]) => (
                        <span
                          key={emotion}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]",
                            colors.bg, colors.text
                          )}
                        >
                          {emotion}
                          <span className="font-bold">{count as number}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Section 4: Synthesis + Verdict ──────────────────── */}
        {data.synthesis?.variants && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Analisis por Variante
            </h4>
            {labels.map((varLabel) => {
              const analysis = data.synthesis?.variants?.[varLabel];
              if (!analysis) return null;
              const colors = VARIANT_COLORS[varLabel] || VARIANT_COLORS.A;
              const isWinner = varLabel === winner;
              return (
                <div
                  key={varLabel}
                  className={cn(
                    "rounded-lg border p-4 space-y-2",
                    isWinner ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("font-bold", colors.text)}>Variante {varLabel}</span>
                    {isWinner && <Badge variant="success">Ganadora</Badge>}
                  </div>
                  {analysis.fortalezas && analysis.fortalezas.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-green-600">Fortalezas</span>
                      <ul className="mt-0.5 space-y-0.5">
                        {analysis.fortalezas.map((f, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-1.5">
                            <span className="text-green-500 shrink-0">+</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.debilidades && analysis.debilidades.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-red-500">Debilidades</span>
                      <ul className="mt-0.5 space-y-0.5">
                        {analysis.debilidades.map((d, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-1.5">
                            <span className="text-red-400 shrink-0">-</span>{d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.mejoras && analysis.mejoras.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-blue-600">Mejoras</span>
                      <ul className="mt-0.5 space-y-0.5">
                        {analysis.mejoras.map((m, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-1.5">
                            <span className="text-blue-500 shrink-0">&#8594;</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Verdict */}
        {data.synthesis?.veredicto && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-2">
              Veredicto
            </h4>
            <p className="text-sm text-gray-800 leading-relaxed">
              {data.synthesis.veredicto}
            </p>
          </div>
        )}

        {/* ── Section 5: Audience Insights ────────────────────── */}
        {data.behavioral && (() => {
          const personas = Object.values(data.behavioral);
          const n = personas.length;
          if (n === 0) return null;

          const genderCounts: Record<string, number> = {};
          for (const p of personas) {
            const g = (p.gender || "otro").toLowerCase();
            const key = g.startsWith("m") && !g.startsWith("mu") ? "Hombres"
              : g.startsWith("f") || g.startsWith("mu") ? "Mujeres"
              : "Otro";
            genderCounts[key] = (genderCounts[key] || 0) + 1;
          }

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
          const activeAgeBuckets = Object.entries(ageBuckets).filter(([, c]) => c > 0);
          const maxAgeCount = Math.max(...activeAgeBuckets.map(([, c]) => c));

          const genderColors: Record<string, string> = { Hombres: "#3b82f6", Mujeres: "#ec4899", Otro: "#9ca3af" };

          return (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Audiencia encuestada
              </h4>
              <div className="flex items-start gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{n}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Encuestados</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">Sexo</div>
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
                    {Object.entries(genderCounts).map(([label, count]) => (
                      <div
                        key={label}
                        className="h-full transition-all"
                        style={{ width: `${(count / n) * 100}%`, backgroundColor: genderColors[label] || "#9ca3af" }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 text-[11px] text-gray-600">
                    {Object.entries(genderCounts).map(([label, count]) => (
                      <span key={label} className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: genderColors[label] || "#9ca3af" }} />
                        {label} {Math.round((count / n) * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Rango etario</div>
                <div className="space-y-1">
                  {activeAgeBuckets.map(([range, count]) => (
                    <div key={range} className="flex items-center gap-2">
                      <span className="w-10 text-right text-[11px] text-gray-500 font-mono">{range}</span>
                      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${(count / maxAgeCount) * 100}%` }} />
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
