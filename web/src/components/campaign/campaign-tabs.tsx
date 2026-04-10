"use client";

import { useState } from "react";
import Link from "next/link";
import type { Campaign, Slot, Project } from "@/lib/types";
import { YamlRenderer } from "@/components/project/yaml-renderer";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  brief_review: "bg-blue-100 text-blue-700",
  generating: "bg-yellow-100 text-yellow-700",
  art_review: "bg-orange-100 text-orange-700",
  simulating: "bg-indigo-100 text-indigo-700",
  ready: "bg-green-100 text-green-700",
  published: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  brief_review: "Revisión Brief",
  generating: "Generando",
  art_review: "Revisión Arte",
  simulating: "Simulando",
  ready: "Listo",
  published: "Publicado",
};

const STEP_LABELS: Record<string, string> = {
  "1-brief": "Brief",
  "2-content": "Contenido",
  "3-art": "Arte",
  "4-simulation": "Simulación",
  "5-approved": "Aprobado",
};

const TABS = [
  { id: "parrilla", label: "Parrilla" },
  { id: "objectives", label: "Objetivos" },
  { id: "calendar", label: "Calendario" },
  { id: "metrics", label: "Métricas" },
] as const;

export function CampaignTabs({
  campaign,
  slots,
  projectSlug,
  project,
}: {
  campaign: Campaign;
  slots: Slot[];
  projectSlug: string;
  project: Project;
}) {
  const [activeTab, setActiveTab] = useState<string>("parrilla");

  const tabData: Record<string, Record<string, unknown>> = {
    objectives: (campaign.objectives_json as Record<string, unknown>) || {},
    calendar: (project.calendar_yaml as Record<string, unknown>) || {},
    metrics: (project.metrics_yaml as Record<string, unknown>) || {},
  };

  return (
    <div>
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-purple-50 active:bg-purple-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "parrilla" ? (
        <div className="bg-white rounded-xl border border-purple-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Fecha
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Formato
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Pilar
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Tema</th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Paso</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <Link
                    key={slot.id}
                    href={`/projects/${projectSlug}/campaigns/${campaign.id}/slots/${slot.slot_number}`}
                    prefetch={false}
                    className="contents"
                  >
                    <tr className="border-t border-gray-100 hover:bg-purple-50/50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-500">
                        {String(slot.slot_number).padStart(3, "0")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(slot.date).toLocaleDateString("es-CL", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {slot.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {slot.pillar}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[300px] truncate">
                        {slot.topic}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[slot.status] || "bg-gray-100"}`}
                        >
                          {STATUS_LABELS[slot.status] || slot.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {STEP_LABELS[slot.current_step] || slot.current_step}
                      </td>
                    </tr>
                  </Link>
                ))}
                {slots.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No hay slots en esta campaña.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-purple-100 p-6">
          <YamlRenderer
            data={tabData[activeTab] || {}}
            title={TABS.find((t) => t.id === activeTab)?.label || ""}
          />
        </div>
      )}
    </div>
  );
}
