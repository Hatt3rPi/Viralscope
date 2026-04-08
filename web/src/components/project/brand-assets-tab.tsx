"use client";

import { useState, useRef } from "react";
import type { BrandAsset } from "@/lib/types";
import { uploadBrandAssetAction, deleteBrandAssetAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ASSET_TYPES: { value: BrandAsset["asset_type"]; label: string }[] = [
  { value: "logo", label: "Logo" },
  { value: "background", label: "Fondo" },
  { value: "texture", label: "Textura" },
  { value: "icon", label: "Icono" },
  { value: "font", label: "Fuente" },
  { value: "photo", label: "Foto" },
  { value: "pattern", label: "Patrón" },
  { value: "other", label: "Otro" },
];

export function BrandAssetsTab({
  projectId,
  initialAssets,
}: {
  projectId: string;
  initialAssets: BrandAsset[];
}) {
  const [assets, setAssets] = useState<BrandAsset[]>(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpload(formData: FormData) {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadBrandAssetAction(projectId, formData);
      if (result.success && result.asset) {
        setAssets((prev) => [...prev, result.asset!]);
        setShowForm(false);
        formRef.current?.reset();
      } else {
        setError(result.error || "Error desconocido");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error subiendo asset");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(asset: BrandAsset) {
    if (!confirm(`¿Eliminar "${asset.name}"?`)) return;
    try {
      const result = await deleteBrandAssetAction(asset.id, asset.storage_path);
      if (result.success) {
        setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      } else {
        setError(result.error || "Error eliminando");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error eliminando asset");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Assets de Marca</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Subir Asset"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {showForm && (
        <form
          ref={formRef}
          action={handleUpload}
          className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                name="name"
                required
                placeholder="Logo principal"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="asset_type"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <input
              name="description"
              placeholder="Usar sobre fondos oscuros"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo
            </label>
            <input
              type="file"
              name="file"
              required
              accept="image/*,.svg,.woff,.woff2,.ttf,.otf"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Subiendo..." : "Subir"}
          </Button>
        </form>
      )}

      {assets.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay assets de marca cargados. Sube logos, fondos, texturas y otros
          elementos para que se incorporen al contenido generado.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {asset.mime_type?.startsWith("image/") && (
                <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.public_url}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900">
                    {asset.name}
                  </span>
                  <Badge>{asset.asset_type}</Badge>
                </div>
                {asset.description && (
                  <p className="text-xs text-gray-500">{asset.description}</p>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(asset)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
