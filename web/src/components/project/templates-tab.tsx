"use client";

import { useState } from "react";
import type { ContentTemplate, ProjectTemplate } from "@/lib/types";
import {
  assignDefaultTemplatesAction,
  toggleProjectTemplateAction,
  removeProjectTemplateAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FORMAT_LABELS: Record<string, string> = {
  carrusel: "Carrusel",
  reel: "Reel",
  story: "Story",
  static: "Post Estático",
  video: "Video",
};

const TONE_LABELS: Record<string, string> = {
  emocional: "Emocional",
  educativo: "Educativo",
  directo: "Directo",
};

const TONE_COLORS: Record<string, string> = {
  emocional: "bg-pink-100 text-pink-800",
  educativo: "bg-blue-100 text-blue-800",
  directo: "bg-orange-100 text-orange-800",
};

export function TemplatesTab({
  projectId,
  allTemplates,
  initialProjectTemplates,
}: {
  projectId: string;
  allTemplates: ContentTemplate[];
  initialProjectTemplates: (ProjectTemplate & { template?: ContentTemplate })[];
}) {
  const [assigned, setAssigned] = useState<Set<string>>(
    new Set(initialProjectTemplates.map((pt) => pt.template_id)),
  );
  const [defaults, setDefaults] = useState<Set<string>>(
    new Set(
      initialProjectTemplates
        .filter((pt) => pt.is_default)
        .map((pt) => pt.template_id),
    ),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group templates by format
  const grouped = allTemplates.reduce(
    (acc, t) => {
      if (!acc[t.format]) acc[t.format] = [];
      acc[t.format].push(t);
      return acc;
    },
    {} as Record<string, ContentTemplate[]>,
  );

  async function handleAssignAll() {
    setLoading(true);
    setError(null);
    try {
      await assignDefaultTemplatesAction(projectId);
      setAssigned(new Set(allTemplates.map((t) => t.id)));
      setDefaults(new Set(allTemplates.map((t) => t.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(templateId: string) {
    const isCurrentlyAssigned = assigned.has(templateId);
    setError(null);
    try {
      if (isCurrentlyAssigned) {
        await removeProjectTemplateAction(projectId, templateId);
        setAssigned((prev) => {
          const next = new Set(prev);
          next.delete(templateId);
          return next;
        });
        setDefaults((prev) => {
          const next = new Set(prev);
          next.delete(templateId);
          return next;
        });
      } else {
        await toggleProjectTemplateAction(projectId, templateId, true);
        setAssigned((prev) => new Set(prev).add(templateId));
        setDefaults((prev) => new Set(prev).add(templateId));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleDefaultToggle(templateId: string) {
    const isDefault = defaults.has(templateId);
    setError(null);
    try {
      await toggleProjectTemplateAction(projectId, templateId, !isDefault);
      setDefaults((prev) => {
        const next = new Set(prev);
        if (isDefault) next.delete(templateId);
        else next.add(templateId);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Templates de Contenido
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona qué templates usar para este proyecto. Los marcados como
            default se usarán automáticamente durante la generación.
          </p>
        </div>
        {assigned.size === 0 && (
          <Button size="sm" onClick={handleAssignAll} disabled={loading}>
            {loading ? "Asignando..." : "Asignar todos"}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {Object.entries(grouped).map(([format, templates]) => (
        <div key={format}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            {FORMAT_LABELS[format] || format}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {templates.map((template) => {
              const isAssigned = assigned.has(template.id);
              const isDefault = defaults.has(template.id);

              return (
                <div
                  key={template.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isAssigned
                      ? "border-purple-300 bg-purple-50/50"
                      : "border-gray-200 bg-white opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_COLORS[template.tone] || "bg-gray-100 text-gray-800"}`}
                    >
                      {TONE_LABELS[template.tone] || template.tone}
                    </span>
                    {isDefault && <Badge variant="success">Default</Badge>}
                  </div>

                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                    {template.name}
                  </h5>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {template.prompt_injection.slice(0, 120)}...
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant={isAssigned ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggle(template.id)}
                      className="text-xs"
                    >
                      {isAssigned ? "Quitar" : "Agregar"}
                    </Button>
                    {isAssigned && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDefaultToggle(template.id)}
                        className="text-xs"
                      >
                        {isDefault ? "Quitar default" : "Marcar default"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {allTemplates.length === 0 && (
        <p className="text-gray-500 text-sm">
          No hay templates disponibles. Ejecuta la migración 004 para crear los
          templates iniciales.
        </p>
      )}
    </div>
  );
}
