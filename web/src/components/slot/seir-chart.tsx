"use client";

import * as React from "react";

interface TrajectoryPoint {
  round: number;
  S: number;
  E: number;
  R: number;
  reach: number;
  engagement_rate: number;
}

interface SeirChartProps {
  trajectory: TrajectoryPoint[];
  totalAgents: number;
  isLive?: boolean;
}

const PAD = { top: 20, right: 16, bottom: 32, left: 36 };
const W = 480;
const H = 200;
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

function scaleX(round: number, minR: number, maxR: number): number {
  if (maxR === minR) return PAD.left + IW / 2;
  return PAD.left + ((round - minR) / (maxR - minR)) * IW;
}

function scaleY(value: number, total: number): number {
  return PAD.top + IH - (value / Math.max(total, 1)) * IH;
}

export function SeirChart({ trajectory, totalAgents, isLive = false }: SeirChartProps) {
  if (!trajectory || trajectory.length === 0) return null;

  const minRound = trajectory[0].round;
  const maxRound = trajectory[trajectory.length - 1].round;
  const lastPoint = trajectory[trajectory.length - 1];
  const isViral = lastPoint.R / Math.max(totalAgents, 1) >= 0.8;

  const sPoints = trajectory.map((p) => [scaleX(p.round, minRound, maxRound), scaleY(p.S, totalAgents)] as [number, number]);
  const ePoints = trajectory.map((p) => [scaleX(p.round, minRound, maxRound), scaleY(p.E, totalAgents)] as [number, number]);
  const rPoints = trajectory.map((p) => [scaleX(p.round, minRound, maxRound), scaleY(p.R, totalAgents)] as [number, number]);

  // Area under R curve
  const baseline = PAD.top + IH;
  const areaPath = [
    rPoints.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" "),
    `L ${rPoints[rPoints.length - 1][0].toFixed(1)} ${baseline.toFixed(1)}`,
    `L ${rPoints[0][0].toFixed(1)} ${baseline.toFixed(1)}`,
    "Z",
  ].join(" ");

  const lastR = rPoints[rPoints.length - 1];
  const lastE = ePoints[ePoints.length - 1];

  // Y-axis ticks
  const yTicks = [0, Math.round(totalAgents / 2), totalAgents];

  // X-axis ticks (max 5)
  const range = maxRound - minRound;
  const step = range <= 4 ? 1 : Math.ceil(range / 4);
  const xTicks: number[] = [];
  for (let r = minRound; r <= maxRound; r += step) xTicks.push(r);
  if (xTicks[xTicks.length - 1] !== maxRound) xTicks.push(maxRound);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-gray-400">Difusión SEIR</span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-xs text-purple-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
              en vivo
            </span>
          )}
          {isViral && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 ring-1 ring-green-200">
              VIRAL
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "160px" }}
        aria-label="Gráfico de difusión SEIR"
      >
        {/* Horizontal grid */}
        {yTicks.map((tick) => {
          const y = scaleY(tick, totalAgents);
          return (
            <line
              key={tick}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          );
        })}

        {/* Area under R */}
        <path d={areaPath} fill="#16a34a" fillOpacity={0.12} />

        {/* S line — gray */}
        <polyline
          points={sPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* E line — orange */}
        <polyline
          points={ePoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#f97316"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* R line — green */}
        <polyline
          points={rPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#16a34a"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Live pulse dot */}
        {isLive && (
          <>
            <circle cx={lastR[0]} cy={lastR[1]} r={6} fill="#16a34a" fillOpacity={0.25}>
              <animate attributeName="r" values="4;9;4" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.25;0;0.25" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={lastR[0]} cy={lastR[1]} r={3.5} fill="#16a34a" />
            <circle cx={lastE[0]} cy={lastE[1]} r={3} fill="#f97316" />
          </>
        )}
        {!isLive && (
          <circle cx={lastR[0]} cy={lastR[1]} r={3} fill="#16a34a" />
        )}

        {/* Y axis */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + IH}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        {yTicks.map((tick) => (
          <text
            key={tick}
            x={PAD.left - 4}
            y={scaleY(tick, totalAgents) + 4}
            textAnchor="end"
            fontSize={9}
            fill="#9ca3af"
          >
            {tick}
          </text>
        ))}

        {/* X axis */}
        <line
          x1={PAD.left}
          y1={PAD.top + IH}
          x2={W - PAD.right}
          y2={PAD.top + IH}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        {xTicks.map((tick) => (
          <text
            key={tick}
            x={scaleX(tick, minRound, maxRound)}
            y={H - 8}
            textAnchor="middle"
            fontSize={9}
            fill="#9ca3af"
          >
            {tick}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-gray-400" />
          Susceptibles
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-orange-400" />
          Expuestos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-green-600" />
          Alcanzados
        </span>
      </div>
    </div>
  );
}
