"use client";

import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimulationCard } from "@/components/slot/simulation-card";
import { NetworkGraph } from "@/components/slot/network-graph";
import { SeirChart } from "@/components/slot/seir-chart";
import { PHASE_LABELS, PHASE_PROGRESS } from "@/components/slot/use-slot-workflow";
import type { Slot, Variante } from "@/lib/types";

interface SimulationStepProps {
  slot: Slot;
  variantes: Variante[];
  simulationData: Record<string, unknown>;
  panelResult: Record<string, unknown> | null;
  deepSimResult: Record<string, unknown> | null;
  deepSimPhase: string | null;
  deepSimMeta: { railwayUrl: string; simulationId: string } | null;
  mirofishMd: string | null;
  activeOp: string | null;
  error: string | null;
  onPanelEvaluate: () => void;
  onPanelSeed: () => void;
  onDeepSimulation: () => void;
  onSurveyAgents: () => void;
  onPrepareMirofish: () => void;
  onResetPanel: () => void;
  onResetDeepSim: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  VIEW_FEED: "Vieron el feed",
  VIEW_STORIES: "Vieron stories",
  FOLLOW: "Siguieron la cuenta",
  LIKE: "Dieron like",
  COMMENT: "Comentaron",
  SHARE: "Compartieron",
  SAVE: "Guardaron",
  REPOST: "Repostearon",
  UNKNOWN: "Otras interacciones",
};

export function SimulationStep({
  slot,
  variantes,
  simulationData,
  panelResult,
  deepSimResult,
  deepSimPhase,
  deepSimMeta,
  mirofishMd,
  activeOp,
  error,
  onPanelEvaluate,
  onPanelSeed,
  onDeepSimulation,
  onSurveyAgents,
  onPrepareMirofish,
  onResetPanel,
  onResetDeepSim,
}: SimulationStepProps) {
  const typedSimData = simulationData as Record<
    string,
    { weight: number; scores: Record<string, Record<string, number>> }
  >;

  const simProgress = deepSimPhase ? (PHASE_PROGRESS[deepSimPhase] ?? 5) : 0;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Panel de Evaluacion */}
      <div className="rounded-xl border border-indigo-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">
              Panel de Evaluacion
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              14 agentes IA evaluan las variantes con encuesta estructurada
            </p>
          </div>
          {panelResult?.verdict ? (
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
              Ganadora:{" "}
              {String(
                (panelResult.verdict as Record<string, unknown>).winner
              )}
            </Badge>
          ) : null}
        </div>

        {!panelResult && (
          <div className="flex gap-2">
            <Button
              onClick={onPanelEvaluate}
              disabled={!!activeOp}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {activeOp === "panel-evaluate" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluando
                  con panel (~45s)...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Evaluar con Panel
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onPanelSeed}
              disabled={!!activeOp}
              size="sm"
            >
              {activeOp === "panel-seed" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando
                  agentes...
                </>
              ) : (
                "Re-seed Agentes"
              )}
            </Button>
          </div>
        )}

        {panelResult?.verdict ? (
          <PanelResultsView
            panelResult={panelResult}
            onReset={onResetPanel}
          />
        ) : null}
      </div>

      {Object.keys(simulationData).length > 0 && (
        <SimulationCard
          simulationData={typedSimData}
          variantes={variantes}
        />
      )}

      {/* Deep Simulation (Railway) */}
      <div className="rounded-xl border border-purple-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">
              Simulacion Profunda
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              50+ agentes IG simulan engagement en multiples rondas con ranking
              algoritmico
            </p>
          </div>
          {deepSimResult ? (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              {String(deepSimResult.action_count || 0)} acciones
            </Badge>
          ) : null}
        </div>

        {!deepSimResult ? (
          <div className="space-y-3">
            <Button
              onClick={onDeepSimulation}
              disabled={!!activeOp}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {activeOp === "deep-sim" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {deepSimPhase
                    ? PHASE_LABELS[deepSimPhase] || deepSimPhase
                    : "Iniciando..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Lanzar Simulacion
                  Profunda
                </>
              )}
            </Button>

            {/* Deep sim progress bar */}
            {activeOp === "deep-sim" && deepSimPhase && (
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${simProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{PHASE_LABELS[deepSimPhase] || deepSimPhase}</span>
                  <span>{simProgress}%</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
                <div className="text-xs text-gray-500">Agentes</div>
                <div className="text-lg font-bold text-purple-700">
                  {String(deepSimResult.persona_count || 0)}
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
                <div className="text-xs text-gray-500">Acciones</div>
                <div className="text-lg font-bold text-purple-700">
                  {String(deepSimResult.action_count || 0)}
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-center">
                <div className="text-xs text-gray-500">Variantes</div>
                <div className="text-lg font-bold text-purple-700">
                  {String(deepSimResult.variant_count || 0)}
                </div>
              </div>
            </div>

            {deepSimResult.action_types
              ? (() => {
                  return (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">
                        Acciones por tipo
                      </span>
                      {Object.entries(
                        deepSimResult.action_types as Record<string, number>
                      )
                        .sort(
                          ([, a], [, b]) => (b as number) - (a as number)
                        )
                        .map(([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {ACTION_LABELS[type] || type}
                            </span>
                            <span className="font-medium text-gray-900">
                              {String(count)}
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                })()
              : null}

            {deepSimResult.seir
              ? (() => {
                  const seir = deepSimResult.seir as Record<string, unknown>;
                  const traj = seir?.trajectory as
                    | Array<Record<string, number>>
                    | undefined;
                  const total =
                    (deepSimResult.persona_count as number) ?? 50;
                  if (!traj || traj.length === 0) return null;
                  return (
                    <SeirChart
                      trajectory={
                        traj as unknown as Parameters<
                          typeof SeirChart
                        >[0]["trajectory"]
                      }
                      totalAgents={total}
                      isLive={activeOp === "deep-sim"}
                    />
                  );
                })()
              : null}

            {/* Interpretation */}
            {(() => {
              if (!deepSimResult.seir) return null;
              const seir = deepSimResult.seir as Record<string, unknown>;
              const s = seir?.summary as Record<string, unknown> | undefined;
              if (!s) return null;
              const reach_pct = s.final_reach_pct as number;
              const total =
                (deepSimResult.persona_count as number) ?? 50;
              const actionTypes = deepSimResult.action_types as
                | Record<string, number>
                | undefined;
              const followCount = actionTypes?.FOLLOW ?? 0;
              const viewCount =
                (actionTypes?.VIEW_FEED ?? 0) +
                (actionTypes?.VIEW_STORIES ?? 0);
              const isViral = reach_pct >= 80;
              const followRatePct =
                total > 0
                  ? Math.round((followCount / total) * 100)
                  : 0;
              const passiveRatio =
                followCount > 0 ? viewCount / followCount : 999;

              return (
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Interpretacion
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li>
                      <span className="font-medium">
                        Alcance simulado:
                      </span>{" "}
                      {reach_pct}% de la audiencia recibio el contenido
                      {isViral
                        ? " — propagacion viral confirmada."
                        : "."}
                    </li>
                    {followCount > 0 && (
                      <li>
                        <span className="font-medium">
                          Intencion de seguir:
                        </span>{" "}
                        {followCount} de {total} agentes hicieron follow (
                        {followRatePct}%) — senal de interes en la marca.
                      </li>
                    )}
                    <li>
                      <span className="font-medium">
                        Patron de consumo:
                      </span>{" "}
                      {passiveRatio > 10
                        ? "Mayoritariamente pasivo (scroll + views). Para activar follows, anadir CTA directo al perfil."
                        : passiveRatio > 4
                          ? "Balance entre consumo y accion. El hook genera interes pero la conversion es moderada."
                          : "Alto nivel de interaccion activa respecto al consumo pasivo — buen indicador de conversion."}
                    </li>
                  </ul>
                </div>
              );
            })()}

            {/* Post-sim survey */}
            {!deepSimResult.survey ? (
              <Button
                onClick={onSurveyAgents}
                disabled={!!activeOp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {activeOp === "survey" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Evaluando contenido (~45s)...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Evaluar Contenido
                  </>
                )}
              </Button>
            ) : (
              <p className="text-xs text-indigo-600 font-medium">
                Evaluacion completada - ver resultados arriba
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onResetDeepSim}
            >
              Simular de nuevo
            </Button>
          </div>
        )}

        {/* Network Graph — only while sim is running */}
        {deepSimMeta && activeOp === "deep-sim" && (
          <NetworkGraph
            railwayUrl={deepSimMeta.railwayUrl}
            simulationId={deepSimMeta.simulationId}
            isRunning={true}
          />
        )}
      </div>

      {/* MiroFish */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h4 className="font-semibold text-gray-900">
          Preparar para MiroFish
        </h4>
        <p className="text-sm text-gray-500">
          Genera un documento seed en Markdown con las variantes, personas y
          criterios de evaluacion para copiar a MiroFish.
        </p>
        <Button
          onClick={onPrepareMirofish}
          disabled={activeOp === "mirofish"}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {activeOp === "mirofish" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando
              Seed...
            </>
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
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Seed Document
                </span>
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
  );
}

// ─── Panel Results Component ─────────────────────────────────────────────────

function PanelResultsView({
  panelResult,
  onReset,
}: {
  panelResult: Record<string, unknown>;
  onReset: () => void;
}) {
  const verdict = panelResult.verdict as Record<string, unknown>;
  const scores = (verdict.composite_scores || panelResult.composite_scores) as Record<
    string,
    number
  >;
  const recs = verdict.variant_recommendations as
    | Record<string, Record<string, string>>
    | undefined;
  const riskFlags = Array.isArray(verdict.risk_flags)
    ? (verdict.risk_flags as string[])
    : [];
  const agentsEvaluated = panelResult.agents_evaluated as number;
  const tokensUsed = panelResult.tokens_used as number;
  const winnerLabel = String(verdict.winner);
  const confidence = String(verdict.confidence);

  const actionColorMap: Record<string, string> = {
    publish: "bg-green-100 text-green-700",
    story: "bg-blue-100 text-blue-700",
    reserve: "bg-amber-100 text-amber-700",
    repurpose: "bg-orange-100 text-orange-700",
    archive: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-4">
      {scores ? (
        <div className="flex gap-3">
          {Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([label, score]) => (
              <div
                key={label}
                className={cn(
                  "flex-1 rounded-lg border p-3 text-center",
                  label === winnerLabel
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="text-xs text-gray-500 uppercase">
                  Variante {label}
                </div>
                <div
                  className={cn(
                    "text-2xl font-bold mt-1",
                    label === winnerLabel
                      ? "text-indigo-700"
                      : "text-gray-700"
                  )}
                >
                  {typeof score === "number"
                    ? score.toFixed(2)
                    : String(score)}
                </div>
                {label === winnerLabel ? (
                  <div className="text-xs text-indigo-600 font-medium mt-1">
                    Ganadora ({confidence})
                  </div>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}

      {verdict.reasoning ? (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
          {String(verdict.reasoning)}
        </p>
      ) : null}

      {recs ? (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-gray-400">
            Recomendaciones
          </span>
          {Object.entries(recs).map(([label, rec]) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700 w-6">{label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  actionColorMap[rec.action] || "bg-gray-100 text-gray-500"
                )}
              >
                {rec.action}
              </span>
              <span className="text-gray-500 truncate">{rec.reason}</span>
            </div>
          ))}
        </div>
      ) : null}

      {riskFlags.length > 0 ? (
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">
            Riesgos
          </span>
          {riskFlags.map((flag, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm text-amber-700"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>{agentsEvaluated} agentes evaluados</span>
        <span>{(tokensUsed / 1000).toFixed(1)}K tokens</span>
      </div>

      <Button variant="outline" size="sm" onClick={onReset}>
        Evaluar de nuevo
      </Button>
    </div>
  );
}
