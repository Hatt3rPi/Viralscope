"use client";

import * as React from "react";
import { Copy, Check, ChevronDown, ChevronUp, Film, Upload, Loader2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Variante } from "@/lib/types";

interface VideoPromptCardProps {
  variante: Variante;
  brandLogoUrl?: string;
  onUploadVideo?: (varianteId: string, file: File) => Promise<void>;
  uploading?: boolean;
}

interface Take {
  take_number: number;
  label: string;
  meta: Record<string, unknown>;
  positive_prompt: Record<string, unknown> | string;
  negative_prompt: string;
}

function buildTakeJson(take: Take, includeText: boolean, referencePhotoUrl: string | null): string {
  const pp = take.positive_prompt;
  let positivePrompt: Record<string, unknown>;

  if (typeof pp === "string") {
    positivePrompt = { prompt: includeText ? pp : pp.replace(/TEXT OVERLAY:.*?(?=\.|$)/gi, "").trim() };
  } else {
    // Structured positive_prompt with scenes
    const scenes = ((pp as Record<string, unknown>).scenes as Array<Record<string, unknown>>) || [];
    const filteredScenes = scenes.map((scene) => {
      if (!includeText) {
        const { text_overlay, ...rest } = scene;
        void text_overlay;
        return rest;
      }
      return scene;
    });
    positivePrompt = { ...pp, scenes: filteredScenes };
  }

  return JSON.stringify({
    take: take.take_number,
    label: take.label,
    duration_seconds: (take.meta as Record<string, unknown>).duration_seconds,
    aspect_ratio: (take.meta as Record<string, unknown>).aspect_ratio,
    include_text_overlay: includeText,
    text_overlay: includeText ? (take.meta as Record<string, unknown>).text_overlay : null,
    positive_prompt: positivePrompt,
    negative_prompt: includeText ? take.negative_prompt : take.negative_prompt + ", text on screen, written words, captions, subtitles",
    reference_image: referencePhotoUrl || null,
    asmr_sounds: (take.meta as Record<string, unknown>).asmr_sounds || [],
  }, null, 2);
}

export function VideoPromptCard({ variante, brandLogoUrl, onUploadVideo, uploading = false }: VideoPromptCardProps) {
  const videoDir = (variante.art_direction_video_json as Record<string, unknown>) || {};

  // Multi-take format
  const takes = (videoDir.takes as Take[]) || [];
  const isMultiTake = takes.length > 0;

  // Legacy single-take format
  const promptString = typeof videoDir.prompt_string === "string" ? videoDir.prompt_string : "";
  const negativePrompt = typeof videoDir.negative_prompt === "string" ? videoDir.negative_prompt : "";

  const referencePhotoUrl = typeof videoDir.reference_photo_url === "string" ? videoDir.reference_photo_url : null;
  const totalDuration = videoDir.total_duration_seconds ?? (isMultiTake
    ? takes.reduce((sum, t) => sum + (((t.meta as Record<string, unknown>)?.duration_seconds as number) || 0), 0)
    : ((videoDir.settings as Record<string, unknown>)?.duration_seconds ?? 15));
  const isLoop = !!videoDir.loop;
  const audioStrategy = typeof videoDir.audio_strategy === "string" ? videoDir.audio_strategy : null;

  const [expanded, setExpanded] = React.useState(false);
  const [includeText, setIncludeText] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isMultiTake && !promptString) return null;

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copyAllTakes() {
    const allJson = JSON.stringify({
      total_duration_seconds: totalDuration,
      loop: isLoop,
      include_text_overlay: includeText,
      audio_strategy: audioStrategy,
      reference_image: referencePhotoUrl,
      takes: takes.map((t) => JSON.parse(buildTakeJson(t, includeText, referencePhotoUrl))),
    }, null, 2);
    handleCopy("all", allJson);
  }

  // Legacy single-take copy
  function copyLegacy() {
    const json = JSON.stringify({
      prompt: promptString,
      negative_prompt: negativePrompt,
      reference_image: referencePhotoUrl || variante.image_url || null,
    }, null, 2);
    handleCopy("legacy", json);
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && onUploadVideo) onUploadVideo(variante.id, file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onUploadVideo) onUploadVideo(variante.id, file);
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold text-gray-800">Video Prompt</span>
          <span className="text-[11px] text-gray-400">
            {isMultiTake ? `${takes.length} takes · ` : ""}{String(totalDuration)}s{isLoop ? " · loop" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isMultiTake ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={copyAllTakes}
            >
              {copiedId === "all" ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
              {copiedId === "all" ? "Copiado" : "Copiar todas"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={copyLegacy}
            >
              {copiedId === "legacy" ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
              {copiedId === "legacy" ? "Copiado" : "JSON completo"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Text overlay toggle + audio info */}
      {isMultiTake && (
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50 bg-gray-50/30">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeText}
              onChange={(e) => setIncludeText(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <Type className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-600">Incluir texto en el video</span>
          </label>
          {audioStrategy && (
            <span className="text-[10px] text-gray-400">{audioStrategy}</span>
          )}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 py-4 space-y-4 bg-gray-50/50">

          {/* Multi-take cards */}
          {isMultiTake && takes.map((take: Take) => {
            const takeNum = Number(take.take_number) || 0;
            const takeId = `take-${takeNum}`;
            const meta = (take.meta || {}) as Record<string, string | number | string[]>;
            const pp = (typeof take.positive_prompt === "object" ? take.positive_prompt : {}) as Record<string, unknown>;
            const scenes = (Array.isArray(pp?.scenes) ? pp.scenes : []) as Array<Record<string, string>>;

            return (
              <div key={takeId} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                {/* Take header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded">
                      Take {takeNum}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{take.label}</span>
                    <span className="text-[10px] text-gray-400">{String(meta.duration_seconds || "?")}s</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => handleCopy(takeId, buildTakeJson(take, includeText, referencePhotoUrl))}
                  >
                    {copiedId === takeId ? <Check className="mr-1 h-2.5 w-2.5 text-green-600" /> : <Copy className="mr-1 h-2.5 w-2.5" />}
                    {copiedId === takeId ? "Copiado" : "Copiar take"}
                  </Button>
                </div>

                {/* Goal */}
                {meta.goal && (
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-[11px] text-gray-600">{String(meta.goal)}</p>
                  </div>
                )}

                {/* Text overlay indicator */}
                {includeText && meta.text_overlay && (
                  <div className="px-4 py-2 border-b border-gray-50 bg-purple-50/50">
                    <p className="text-[10px] text-purple-600 font-medium">TEXT: {String(meta.text_overlay)}</p>
                  </div>
                )}

                {/* Scenes */}
                <div className="px-4 py-3 space-y-2">
                  {scenes.map((scene, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                          {String(scene.time || "")}
                        </span>
                        <span className="text-[9px] text-gray-400">{String(scene.shot || "")}</span>
                        <span className="text-[9px] text-gray-400">· {String(scene.camera || "")}</span>
                      </div>
                      <p className="text-[11px] text-gray-700 leading-relaxed">
                        <span className="font-medium">{String(scene.subject || "")}</span>
                        {scene.subject && scene.action ? " — " : ""}
                        {String(scene.action || "")}
                      </p>
                      {scene.sound && (
                        <p className="text-[10px] text-gray-400">🔊 {String(scene.sound)}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Negative prompt */}
                <div className="px-4 py-2 border-t border-gray-50">
                  <p className="text-[9px] text-gray-400 font-mono">{take.negative_prompt}</p>
                </div>
              </div>
            );
          })}

          {/* Legacy single prompt */}
          {!isMultiTake && promptString && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Prompt</p>
              <p className="text-xs text-gray-700 font-mono leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-100">
                {promptString}
              </p>
            </div>
          )}
          {!isMultiTake && negativePrompt && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Negative Prompt</p>
              <p className="text-xs text-gray-500 font-mono leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                {negativePrompt}
              </p>
            </div>
          )}

          {/* Reference photo */}
          {referencePhotoUrl && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Foto de referencia</p>
              <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={referencePhotoUrl} alt="Producto real" className="w-32 rounded-lg" />
                <p className="text-xs text-blue-600 font-mono break-all">{referencePhotoUrl}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video player or upload area */}
      <div className="px-5 py-4 border-t border-gray-50">
        {variante.video_url ? (
          <div className="space-y-2">
            <video src={variante.video_url} controls className="w-full rounded-lg" />
            <div className="relative">
              <label className="text-[10px] text-gray-400 cursor-pointer hover:text-purple-600">
                Reemplazar video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/30 p-6 text-center">
            <Loader2 className="mb-1.5 h-6 w-6 text-purple-500 animate-spin" />
            <p className="text-xs font-medium text-purple-600">Subiendo video...</p>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition-colors hover:border-purple-300 hover:bg-purple-50/30"
          >
            <Upload className="mb-1.5 h-6 w-6 text-gray-300" />
            <p className="text-xs font-medium text-gray-500">Arrastra el video generado aqui</p>
            <p className="text-[10px] text-gray-400 mt-0.5">o haz clic para seleccionar</p>
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
