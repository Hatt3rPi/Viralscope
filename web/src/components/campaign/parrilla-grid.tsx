"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { Slot, SlotStatus } from "@/lib/types";

const statusBadgeVariant: Record<
  SlotStatus,
  "default" | "info" | "warning" | "success"
> = {
  draft: "default",
  brief_review: "info",
  generating: "warning",
  art_review: "warning",
  simulating: "info",
  ready: "success",
  published: "success",
};

const statusLabel: Record<SlotStatus, string> = {
  draft: "Borrador",
  brief_review: "Revisión Brief",
  generating: "Generando",
  art_review: "Revisión Arte",
  simulating: "Simulando",
  ready: "Listo",
  published: "Publicado",
};

const stepLabel: Record<string, string> = {
  "1-brief": "Brief",
  "2-content": "Contenido",
  "3-art": "Arte",
  "4-simulation": "Simulación",
  "5-approved": "Aprobado",
};

interface ParrillaGridProps {
  slots: Slot[];
  projectSlug: string;
  campaignId: string;
}

export function ParrillaGrid({
  slots,
  projectSlug,
  campaignId,
}: ParrillaGridProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-500">#</th>
            <th className="px-4 py-3 font-medium text-gray-500">Fecha</th>
            <th className="px-4 py-3 font-medium text-gray-500">Formato</th>
            <th className="px-4 py-3 font-medium text-gray-500">Pilar</th>
            <th className="px-4 py-3 font-medium text-gray-500">Objetivo</th>
            <th className="px-4 py-3 font-medium text-gray-500">Tema</th>
            <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
            <th className="px-4 py-3 font-medium text-gray-500">Paso</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {slots.map((slot) => {
            const href = `/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`;
            return (
              <tr
                key={slot.id}
                className="transition-colors hover:bg-purple-50/50 cursor-pointer"
                onClick={() => router.push(href)}
              >
                <td className="px-4 py-3 font-medium text-purple-700">
                  {slot.slot_number}
                </td>
                <td className="px-4 py-3 text-gray-600">{slot.date}</td>
                <td className="px-4 py-3 text-gray-600">{slot.format}</td>
                <td className="px-4 py-3 text-gray-600">{slot.pillar}</td>
                <td className="px-4 py-3 text-gray-600">{slot.objective}</td>
                <td className="px-4 py-3 text-gray-600">{slot.topic}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant[slot.status]}>
                    {statusLabel[slot.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {stepLabel[slot.current_step] || slot.current_step}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
