"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface YamlRendererProps {
  data: Record<string, unknown>;
  title: string;
  className?: string;
}

function isHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3,8})$/.test(value);
}

function RenderValue({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-green-600" : "text-red-600"}>
        {value ? "sí" : "no"}
      </span>
    );
  }

  if (typeof value === "number") {
    return <span className="font-mono text-blue-700">{value}</span>;
  }

  if (typeof value === "string") {
    if (isHexColor(value)) {
      return (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded border border-gray-200"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-sm">{value}</span>
        </span>
      );
    }
    return <span className="text-gray-800">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">vacío</span>;
    }

    // If array contains simple values, render as bullet list
    const allSimple = value.every(
      (item) => typeof item === "string" || typeof item === "number"
    );
    if (allSimple) {
      return (
        <ul className="ml-2 list-disc space-y-0.5 pl-4">
          {value.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }

    // Complex array items render as cards
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            <RenderValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className={cn("space-y-2", depth > 0 && "ml-3")}>
        {entries.map(([key, val]) => (
          <div key={key}>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {key.replace(/_/g, " ")}
            </span>
            <div className="mt-0.5">
              <RenderValue value={val} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

export function YamlRenderer({ data, title, className }: YamlRendererProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-gray-100 bg-white p-4"
          >
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-700">
              {key.replace(/_/g, " ")}
            </h4>
            <RenderValue value={value} />
          </div>
        ))}
      </div>
    </div>
  );
}
