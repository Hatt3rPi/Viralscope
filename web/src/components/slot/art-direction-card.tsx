"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Image as ImageIcon,
  Film,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const imageDir =
    (variante.art_direction_image_json as Record<string, unknown>) || {};
  const videoDir =
    (variante.art_direction_video_json as Record<string, unknown>) || {};
  const artDir =
    (imageDir.art_direction as Record<string, unknown>) || {};

  const imagePrompt =
    typeof imageDir.prompt_string === "string" ? imageDir.prompt_string : "";
  const videoPrompt =
    typeof videoDir.prompt_string === "string" ? videoDir.prompt_string : "";

  const [copiedImage, setCopiedImage] = React.useState(false);
  const [copiedVideo, setCopiedVideo] = React.useState(false);
  const [showImageDetails, setShowImageDetails] = React.useState(false);
  const [showVideoDetails, setShowVideoDetails] = React.useState(false);

  function copyToClipboard(text: string, type: "image" | "video") {
    navigator.clipboard.writeText(text);
    if (type === "image") {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } else {
      setCopiedVideo(true);
      setTimeout(() => setCopiedVideo(false), 2000);
    }
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && onUploadVideo) onUploadVideo(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onUploadVideo) onUploadVideo(file);
  }

  // Extract key info for summary
  const concept =
    typeof artDir.concept === "string" ? artDir.concept : "";
  const style =
    typeof artDir.style === "string" ? artDir.style : "";
  const mood =
    typeof artDir.mood === "string" ? artDir.mood : "";

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
          {/* Summary - always visible */}
          {concept && (
            <p className="text-sm text-gray-700 leading-relaxed">{concept}</p>
          )}

          {(style || mood) && (
            <div className="flex flex-wrap gap-2">
              {style && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  {style.length > 60 ? style.slice(0, 60) + "…" : style}
                </span>
              )}
              {mood && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                  {mood.length > 60 ? mood.slice(0, 60) + "…" : mood}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
              onClick={onGenerateImage}
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Generar Imagen
            </Button>
            {imagePrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(imagePrompt, "image")}
              >
                {copiedImage ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                {copiedImage ? "Copiado" : "Copiar Prompt"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDetails(!showImageDetails)}
              className="text-gray-500"
            >
              {showImageDetails ? (
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
              )}
              {showImageDetails ? "Ocultar detalle" : "Ver detalle"}
            </Button>
          </div>

          {/* Expandable detail */}
          {showImageDetails && imagePrompt && (
            <div className="rounded-lg bg-gray-50 p-4 space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Prompt
                </span>
                <p className="mt-1 text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                  {imagePrompt}
                </p>
              </div>
              {typeof imageDir.negative_prompt === "string" && (
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    Negative Prompt
                  </span>
                  <p className="mt-1 text-xs text-gray-500 font-mono">
                    {imageDir.negative_prompt as string}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generated image */}
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
          {/* Summary */}
          {typeof (videoDir.art_direction as Record<string, unknown>)
            ?.concept === "string" && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {
                (videoDir.art_direction as Record<string, string>)
                  .concept
              }
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {videoPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(videoPrompt, "video")}
              >
                {copiedVideo ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                {copiedVideo ? "Copiado" : "Copiar Prompt Video"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVideoDetails(!showVideoDetails)}
              className="text-gray-500"
            >
              {showVideoDetails ? (
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
              )}
              {showVideoDetails ? "Ocultar detalle" : "Ver detalle"}
            </Button>
          </div>

          {/* Expandable detail */}
          {showVideoDetails && (
            <div className="rounded-lg bg-gray-50 p-4 space-y-3">
              {videoPrompt && (
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    Prompt
                  </span>
                  <p className="mt-1 text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                    {videoPrompt}
                  </p>
                </div>
              )}
              {typeof videoDir.negative_prompt === "string" && (
                <div>
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    Negative Prompt
                  </span>
                  <p className="mt-1 text-xs text-gray-500 font-mono">
                    {videoDir.negative_prompt as string}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video player or upload */}
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
              className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-purple-400 hover:bg-purple-50"
            >
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">
                Arrastra tu video aquí
              </p>
              <p className="text-xs text-gray-400 mt-1">
                o haz clic para seleccionar
              </p>
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileSelect}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
