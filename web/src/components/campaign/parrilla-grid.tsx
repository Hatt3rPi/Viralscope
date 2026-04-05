"use client";

import * as React from "react";
import Link from "next/link";
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
          {slots.map((slot) => (
            <tr
              key={slot.id}
              className="transition-colors hover:bg-purple-50/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block font-medium text-purple-700 hover:underline"
                >
                  {slot.slot_number}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  {slot.date}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  {slot.format}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  {slot.pillar}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  {slot.objective}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  {slot.topic}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  <Badge variant={statusBadgeVariant[slot.status]}>
                    {statusLabel[slot.status]}
                  </Badge>
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <Link
                  href={`/projects/${projectSlug}/campaigns/${campaignId}/slots/${slot.slot_number}`}
                  className="block"
                >
                  {stepLabel[slot.current_step] || slot.current_step}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
