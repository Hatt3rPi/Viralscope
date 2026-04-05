"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon, Film, Upload } from "lucide-react";
import type { Variante } from "@/lib/types";

interface ArtDirectionCardProps {
  variante: Variante;
  onGenerateImage?: () => void;
  onUploadVideo?: (file: File) => void;
}

export function ArtDirectionCard({
  variante,
  onGenerateImage,
  onUploadVideo,
}: ArtDirectionCardProps) {
  const imageDir = variante.art_direction_image_json || {};
  const videoDir = variante.art_direction_video_json || {};

  const promptString =
    typeof imageDir.prompt_string === "string" ? imageDir.prompt_string : "";

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && onUploadVideo) {
      onUploadVideo(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onUploadVideo) {
      onUploadVideo(file);
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4" />
            Imagen — Variante {variante.variant_label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {["concept", "style", "mood", "prompt_string"].map((key) => {
              const val = imageDir[key];
              if (val === undefined || val === null) return null;
              return (
                <div key={key} className="rounded-lg bg-gray-50 p-3">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-800">
                    {String(val)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
              onClick={onGenerateImage}
            >
              Generar Imagen
            </Button>
            {promptString && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(promptString)}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copiar Prompt
              </Button>
            )}
          </div>

          {variante.image_url && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={variante.image_url}
                alt={`Arte variante ${variante.variant_label}`}
                className="w-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Film className="h-4 w-4" />
            Video — Variante {variante.variant_label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(videoDir).length > 0 && (
            <div className="space-y-2">
              {Object.entries(videoDir).map(([key, val]) => (
                <div key={key} className="rounded-lg bg-gray-50 p-3">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-800">
                    {typeof val === "object"
                      ? JSON.stringify(val, null, 2)
                      : String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              copyToClipboard(JSON.stringify(videoDir, null, 2))
            }
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copiar Prompt JSON
          </Button>

          {variante.video_url ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <video
                src={variante.video_url}
                controls
                className="w-full"
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-purple-400 hover:bg-purple-50"
            >
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                Arrastra tu video aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileSelect}
                style={{ position: "relative" }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
