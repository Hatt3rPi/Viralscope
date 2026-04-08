"use client";

import { useState } from "react";
import type { ContentTemplate } from "@/lib/types";
import {
  createContentTemplateAction,
  updateContentTemplateAction,
  deleteContentTemplateAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FORMATS = [
  { value: "carrusel", label: "Carrusel" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
  { value: "static", label: "Post Estatico" },
  { value: "video", label: "Video" },
];

const TONES = [
  { value: "emocional", label: "Emocional" },
  { value: "educativo", label: "Educativo" },
  { value: "directo", label: "Directo" },
];

const TONE_COLORS: Record<string, string> = {
  emocional: "bg-pink-100 text-pink-800",
  educativo: "bg-blue-100 text-blue-800",
  directo: "bg-orange-100 text-orange-800",
};

const FORMAT_LABELS: Record<string, string> = {
  carrusel: "Carrusel",
  reel: "Reel",
  story: "Story",
  static: "Post Estatico",
  video: "Video",
};

interface FormState {
  name: string;
  format: string;
  tone: string;
  prompt_injection: string;
  structure_json: string;
  composition_rules: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  format: "carrusel",
  tone: "emocional",
  prompt_injection: "",
  structure_json: "{}",
  composition_rules: "{}",
};

export function TemplatesManager({
  initialTemplates,
}: {
  initialTemplates: ContentTemplate[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Group by format
  const grouped = templates.reduce(
    (acc, t) => {
      if (!acc[t.format]) acc[t.format] = [];
      acc[t.format].push(t);
      return acc;
    },
    {} as Record<string, ContentTemplate[]>,
  );

  const filteredFormats =
    filter === "all"
      ? Object.keys(grouped)
      : Object.keys(grouped).filter((f) => f === filter);

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function startEdit(template: ContentTemplate) {
    setForm({
      name: template.name,
      format: template.format,
      tone: template.tone,
      prompt_injection: template.prompt_injection,
      structure_json: JSON.stringify(template.structure_json, null, 2),
      composition_rules: JSON.stringify(template.composition_rules, null, 2),
    });
    setEditingId(template.id);
    setShowForm(true);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    let structureJson: Record<string, unknown>;
    let compositionRules: Record<string, unknown>;
    try {
      structureJson = JSON.parse(form.structure_json);
      compositionRules = JSON.parse(form.composition_rules);
    } catch {
      setError("JSON invalido en structure_json o composition_rules");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateContentTemplateAction(editingId, {
          name: form.name,
          structure_json: structureJson,
          composition_rules: compositionRules,
          prompt_injection: form.prompt_injection,
        });
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? {
                  ...t,
                  name: form.name,
                  structure_json: structureJson,
                  composition_rules: compositionRules,
                  prompt_injection: form.prompt_injection,
                }
              : t,
          ),
        );
      } else {
        const slug = `${form.format}-${form.tone}-${Date.now().toString(36).slice(-4)}`;
        const result = await createContentTemplateAction({
          slug,
          name: form.name,
          format: form.format,
          tone: form.tone,
          structure_json: structureJson,
          composition_rules: compositionRules,
          prompt_injection: form.prompt_injection,
        });
        if (result.success && result.template) {
          setTemplates((prev) => [...prev, result.template!]);
        } else {
          setError(result.error || "Error creando template");
          setSaving(false);
          return;
        }
      }
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(template: ContentTemplate) {
    if (!confirm(`¿Eliminar "${template.name}"?`)) return;
    try {
      await deleteContentTemplateAction(template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Templates genericos que definen estructura y reglas visuales por
            formato y tono. Se asignan a proyectos para guiar la generacion de
            contenido.
          </p>
        </div>
        <Button onClick={startCreate}>+ Nuevo Template</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-purple-50"}`}
        >
          Todos ({templates.length})
        </button>
        {FORMATS.map((f) => {
          const count = grouped[f.value]?.length || 0;
          if (count === 0) return null;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-purple-50"}`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">
            {editingId ? "Editar Template" : "Nuevo Template"}
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Carrusel Emocional"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato
              </label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                disabled={!!editingId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tono
              </label>
              <select
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                disabled={!!editingId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruccion para el generador (prompt_injection)
            </label>
            <textarea
              value={form.prompt_injection}
              onChange={(e) =>
                setForm({ ...form, prompt_injection: e.target.value })
              }
              placeholder="TEMPLATE: Carrusel Emocional. Portada con hook emocional grande..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estructura (JSON)
              </label>
              <textarea
                value={form.structure_json}
                onChange={(e) =>
                  setForm({ ...form, structure_json: e.target.value })
                }
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reglas de composicion (JSON)
              </label>
              <textarea
                value={form.composition_rules}
                onChange={(e) =>
                  setForm({ ...form, composition_rules: e.target.value })
                }
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.prompt_injection}
            >
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Templates grid */}
      {filteredFormats.map((format) => (
        <div key={format}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            {FORMAT_LABELS[format] || format}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[format].map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_COLORS[template.tone] || "bg-gray-100 text-gray-800"}`}
                  >
                    {template.tone}
                  </span>
                  {!template.is_active && (
                    <Badge variant="warning">Inactivo</Badge>
                  )}
                </div>

                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {template.name}
                </h4>

                <p className="text-xs text-gray-500 line-clamp-3 mb-4">
                  {template.prompt_injection.slice(0, 180)}
                  {template.prompt_injection.length > 180 ? "..." : ""}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(template)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay templates. Crea el primero.</p>
        </div>
      )}
    </div>
  );
}
