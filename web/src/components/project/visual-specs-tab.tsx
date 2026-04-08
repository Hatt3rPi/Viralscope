"use client";

import { useState } from "react";
import type { VisualSpec, BrandAsset } from "@/lib/types";
import { upsertVisualSpecAction, deleteVisualSpecAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SPEC_KEYS: { key: string; label: string; placeholder: string }[] = [
  {
    key: "typography",
    label: "Tipografía",
    placeholder: "Ej: Sour Gummy para títulos, Poppins para cuerpo. H1: 48px, H2: 32px, body: 18px.",
  },
  {
    key: "color_palette",
    label: "Paleta de Colores",
    placeholder: "Ej: Pastel lavanda (#F7F0FF) como fondo. Púrpura (#7C3AED) para títulos. Ámbar (#F59E0B) solo para CTAs.",
  },
  {
    key: "logo_placement",
    label: "Logo",
    placeholder: "Ej: Logo en el slide final, abajo a la derecha, tamaño pequeño. Usar logo blanco sobre fondos oscuros.",
  },
  {
    key: "composition_style",
    label: "Estilo de Composición",
    placeholder: "Ej: Editorial cálido tipo Kinfolk. Grano fotográfico sutil. Nunca usar clipart o estilo infantil.",
  },
  {
    key: "restrictions",
    label: "Restricciones",
    placeholder: "Ej: Nunca usar rojo. Evitar imágenes de stock genéricas. No usar emojis en texto overlay.",
  },
];

export function VisualSpecsTab({
  projectId,
  initialSpecs,
  brandAssets,
}: {
  projectId: string;
  initialSpecs: VisualSpec[];
  brandAssets: BrandAsset[];
}) {
  const [specs, setSpecs] = useState<Record<string, VisualSpec>>(
    Object.fromEntries(initialSpecs.map((s) => [s.spec_key, s])),
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for the editing spec
  const [promptText, setPromptText] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  function startEdit(key: string) {
    const existing = specs[key];
    setPromptText(existing?.prompt_text || "");
    setSelectedAssets(existing?.asset_references || []);
    setEditingKey(key);
    setError(null);
  }

  async function handleSave(specKey: string) {
    setSaving(true);
    setError(null);
    try {
      await upsertVisualSpecAction(
        projectId,
        specKey,
        { description: promptText },
        selectedAssets,
        promptText,
        SPEC_KEYS.findIndex((s) => s.key === specKey),
      );
      setSpecs((prev) => ({
        ...prev,
        [specKey]: {
          ...(prev[specKey] || {
            id: "",
            project_id: projectId,
            spec_key: specKey,
            spec_value: {},
            is_active: true,
            created_at: new Date().toISOString(),
          }),
          prompt_text: promptText,
          asset_references: selectedAssets,
          priority: SPEC_KEYS.findIndex((s) => s.key === specKey),
        } as VisualSpec,
      }));
      setEditingKey(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(specKey: string) {
    const spec = specs[specKey];
    if (!spec?.id) return;
    if (!confirm("¿Eliminar esta especificación?")) return;
    try {
      await deleteVisualSpecAction(spec.id);
      setSpecs((prev) => {
        const copy = { ...prev };
        delete copy[specKey];
        return copy;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando");
    }
  }

  function toggleAsset(assetId: string) {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Especificaciones Visuales
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Define reglas de identidad visual que se inyectan durante la
          generación de contenido. Puedes referenciar assets de marca.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {SPEC_KEYS.map(({ key, label, placeholder }) => {
          const spec = specs[key];
          const isEditing = editingKey === key;

          return (
            <div
              key={key}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {label}
                    </span>
                    {spec ? (
                      <Badge variant="success">Configurado</Badge>
                    ) : (
                      <Badge variant="warning">Sin definir</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(key)}
                      >
                        {spec ? "Editar" : "Definir"}
                      </Button>
                    )}
                    {spec && !isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(key)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>

                {!isEditing && spec && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {spec.prompt_text}
                  </p>
                )}

                {isEditing && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instrucción para el generador
                      </label>
                      <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    {brandAssets.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assets de marca referenciados
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {brandAssets.map((asset) => (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => toggleAsset(asset.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                selectedAssets.includes(asset.id)
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {asset.mime_type?.startsWith("image/") && (
                                <img
                                  src={asset.public_url}
                                  alt=""
                                  className="w-4 h-4 object-contain rounded"
                                />
                              )}
                              {asset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(key)}
                        disabled={saving || !promptText.trim()}
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingKey(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
