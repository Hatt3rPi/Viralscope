"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ParrillaSlot } from "@/lib/types";

interface ReviewPhaseProps {
  summary: string;
  parrilla: ParrillaSlot[];
  isLoading: boolean;
  error: string | null;
  onUpdateSlot: (index: number, slot: ParrillaSlot) => void;
  onRemoveSlot: (index: number) => void;
  onRegenerate: () => void;
  onApprove: () => void;
  onBackToChat: () => void;
}

const confidenceVariant: Record<string, "success" | "warning" | "destructive"> =
  {
    alta: "success",
    media: "warning",
    baja: "destructive",
  };

const formatLabel: Record<string, string> = {
  reel: "Reel",
  carrusel: "Carrusel",
  story: "Story",
  static: "Estatico",
  video: "Video",
};

export function ReviewPhase({
  summary,
  parrilla,
  isLoading,
  error,
  onUpdateSlot,
  onRemoveSlot,
  onRegenerate,
  onApprove,
  onBackToChat,
}: ReviewPhaseProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);

  // Distribution stats
  const pillarCounts: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};
  const intentionCounts: Record<string, number> = {};
  for (const slot of parrilla) {
    pillarCounts[slot.pillar] = (pillarCounts[slot.pillar] || 0) + 1;
    formatCounts[slot.format] = (formatCounts[slot.format] || 0) + 1;
    intentionCounts[slot.intention] = (intentionCounts[slot.intention] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-purple-100 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Parrilla Estrategica
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {parrilla.length} contenidos planificados
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Regenerar
          </Button>
        </div>

        {summary && (
          <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold uppercase text-purple-600">
                Resumen Estrategico
              </span>
            </div>
            <p className="text-sm text-purple-900 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Distribution chips */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div>
            <span className="font-semibold text-gray-500 uppercase">Pilares:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(pillarCounts).map(([k, v]) => (
                <Badge key={k} variant="default">
                  {k} ({v})
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-500 uppercase">Formatos:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(formatCounts).map(([k, v]) => (
                <Badge key={k} variant="info">
                  {formatLabel[k] || k} ({v})
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-500 uppercase">Intencion:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(intentionCounts).map(([k, v]) => (
                <Badge
                  key={k}
                  variant={
                    k === "viral"
                      ? "warning"
                      : k === "commercial"
                        ? "destructive"
                        : "success"
                  }
                >
                  {k} ({v})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Slots table */}
      <div className="bg-white rounded-2xl border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  #
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Fecha
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Formato
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Pilar
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Tema
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Intencion
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">
                  Confianza
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {parrilla.map((slot, idx) => (
                <SlotRow
                  key={idx}
                  slot={slot}
                  index={idx}
                  isExpanded={expandedRow === idx}
                  isEditing={editingRow === idx}
                  onToggleExpand={() =>
                    setExpandedRow(expandedRow === idx ? null : idx)
                  }
                  onEdit={() => setEditingRow(editingRow === idx ? null : idx)}
                  onSaveEdit={(updated) => {
                    onUpdateSlot(idx, updated);
                    setEditingRow(null);
                  }}
                  onCancelEdit={() => setEditingRow(null)}
                  onRemove={() => onRemoveSlot(idx)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBackToChat}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Chat
        </Button>
        <Button
          onClick={onApprove}
          disabled={isLoading || parrilla.length === 0}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando campana...
            </>
          ) : (
            `Aprobar y Crear Campana (${parrilla.length} slots)`
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── SlotRow ────────────────────────────────────────────────────────────────

function SlotRow({
  slot,
  index,
  isExpanded,
  isEditing,
  onToggleExpand,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: {
  slot: ParrillaSlot;
  index: number;
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onSaveEdit: (slot: ParrillaSlot) => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}) {
  const [editData, setEditData] = useState(slot);

  // Reset edit data when slot changes
  if (isEditing && editData.slot_number !== slot.slot_number) {
    setEditData(slot);
  }

  const dateStr = new Date(slot.date).toLocaleDateString("es-CL", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <tr
        className={cn(
          "border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors",
          isExpanded && "bg-purple-50/30"
        )}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3 font-mono text-gray-400">{index + 1}</td>
        <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
          {dateStr}
          {slot.date_reference && (
            <span className="ml-1.5 text-xs text-amber-600" title={slot.date_reference}>
              *
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <Badge variant="info">
            {formatLabel[slot.format] || slot.format}
          </Badge>
        </td>
        <td className="px-4 py-3 text-gray-700">{slot.pillar}</td>
        <td className="px-4 py-3 text-gray-900 max-w-[200px] truncate">
          {slot.topic}
        </td>
        <td className="px-4 py-3">
          <Badge
            variant={
              slot.intention === "viral"
                ? "warning"
                : slot.intention === "commercial"
                  ? "destructive"
                  : "success"
            }
          >
            {slot.intention}
          </Badge>
        </td>
        <td className="px-4 py-3 text-center">
          <Badge variant={confidenceVariant[slot.confidence] || "info"}>
            {slot.confidence}
          </Badge>
        </td>
        <td className="px-4 py-3 text-center">
          <div
            className="flex items-center justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <button
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {isExpanded && !isEditing && (
        <tr>
          <td colSpan={8} className="px-4 py-4 bg-gray-50/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Angulo
                </p>
                <p className="text-gray-700">{slot.topic_angle}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Persona Target
                </p>
                <p className="text-gray-700">{slot.persona_target}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Hook Direction
                </p>
                <p className="text-gray-700">{slot.hook_direction}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  CTA Direction
                </p>
                <p className="text-gray-700">{slot.cta_direction}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Razonamiento
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {slot.reasoning}
                </p>
              </div>
              {slot.tensions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-500 uppercase mb-1">
                    Tensiones
                  </p>
                  <ul className="list-disc pl-4 text-amber-700 text-sm space-y-0.5">
                    {slot.tensions.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {slot.uncertainties.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase mb-1">
                    Incertidumbres
                  </p>
                  <ul className="list-disc pl-4 text-red-600 text-sm space-y-0.5">
                    {slot.uncertainties.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
              {slot.date_reference && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-blue-400 uppercase mb-1">
                    Fecha Relevante
                  </p>
                  <p className="text-blue-700">{slot.date_reference}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-3">
              <Button size="sm" variant="outline" onClick={onEdit}>
                Editar Slot
              </Button>
            </div>
          </td>
        </tr>
      )}

      {/* Inline edit */}
      {isExpanded && isEditing && (
        <tr>
          <td colSpan={8} className="px-4 py-4 bg-yellow-50/50">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <EditField
                label="Tema"
                value={editData.topic}
                onChange={(v) => setEditData({ ...editData, topic: v })}
              />
              <EditField
                label="Angulo"
                value={editData.topic_angle}
                onChange={(v) => setEditData({ ...editData, topic_angle: v })}
              />
              <EditField
                label="Formato"
                value={editData.format}
                onChange={(v) => setEditData({ ...editData, format: v })}
                type="select"
                options={["reel", "carrusel", "story", "static", "video"]}
              />
              <EditField
                label="Pilar"
                value={editData.pillar}
                onChange={(v) => setEditData({ ...editData, pillar: v })}
              />
              <EditField
                label="Intencion"
                value={editData.intention}
                onChange={(v) => setEditData({ ...editData, intention: v })}
                type="select"
                options={["viral", "quality", "commercial"]}
              />
              <EditField
                label="Objetivo"
                value={editData.objective}
                onChange={(v) => setEditData({ ...editData, objective: v })}
                type="select"
                options={["awareness", "engagement", "conversion", "retention"]}
              />
              <EditField
                label="Hook Direction"
                value={editData.hook_direction}
                onChange={(v) => setEditData({ ...editData, hook_direction: v })}
              />
              <EditField
                label="CTA Direction"
                value={editData.cta_direction}
                onChange={(v) => setEditData({ ...editData, cta_direction: v })}
              />
              <EditField
                label="Persona Target"
                value={editData.persona_target}
                onChange={(v) =>
                  setEditData({ ...editData, persona_target: v })
                }
              />
              <EditField
                label="Fecha"
                value={editData.date}
                onChange={(v) => setEditData({ ...editData, date: v })}
                type="date"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={onCancelEdit}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => onSaveEdit(editData)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Guardar
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── EditField ──────────────────────────────────────────────────────────────

function EditField({
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "select" | "date";
  options?: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
        />
      )}
    </div>
  );
}
