"use client";

import * as React from "react";
import { Copy, Check, ChevronDown, ChevronUp, Film, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Variante } from "@/lib/types";

interface VideoPromptCardProps {
  variante: Variante;
  brandLogoUrl?: string;
  onUploadVideo?: (varianteId: string, file: File) => void;
}

export function VideoPromptCard({ variante, brandLogoUrl, onUploadVideo }: VideoPromptCardProps) {
  const videoDir = (variante.art_direction_video_json as Record<string, unknown>) || {};
  const artDir = (videoDir.art_direction as Record<string, unknown>) || {};
  const settings = (videoDir.settings as Record<string, unknown>) || {};
  const scenes = (artDir.scenes as Array<Record<string, unknown>>) || [];
  const audioDir = (artDir.audio_direction as Record<string, string | string[]>) || {};

  const promptString = typeof videoDir.prompt_string === "string" ? videoDir.prompt_string : "";
  const negativePrompt = typeof videoDir.negative_prompt === "string" ? videoDir.negative_prompt : "";
  const concept = typeof artDir.concept === "string" ? artDir.concept : "";
  const aspectRatio = typeof settings.aspect_ratio === "string" ? settings.aspect_ratio : "9:16";
  const duration = settings.duration_seconds ?? 15;

  const [expanded, setExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState<"prompt" | "json" | null>(null);

  if (!promptString && scenes.length === 0) return null;

  function buildFreepikJson() {
    return JSON.stringify({
      prompt: promptString,
      negative_prompt: negativePrompt,
      aspect_ratio: aspectRatio,
      duration_seconds: duration,
      reference_image: variante.image_url || null,
      logo: brandLogoUrl || null,
      scenes: scenes.map((s) => ({
        number: s.scene_number,
        duration: `${s.duration_seconds || "?"}s`,
        description: s.description,
        framing: s.framing,
        camera: s.camera_movement,
      })),
      audio: {
        music: audioDir.music_mood || null,
        sfx: audioDir.sound_effects || [],
        pacing: audioDir.pacing || null,
      },
    }, null, 2);
  }

  function handleCopy(type: "prompt" | "json") {
    const text = type === "prompt" ? promptString : buildFreepikJson();
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
          <span className="text-[11px] text-gray-400">{aspectRatio} · {String(duration)}s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleCopy("prompt")}
          >
            {copied === "prompt" ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied === "prompt" ? "Copiado" : "Prompt"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleCopy("json")}
          >
            {copied === "json" ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied === "json" ? "Copiado" : "JSON completo"}
          </Button>
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

      {/* Concept summary - always visible */}
      {concept && (
        <div className="px-5 py-3 border-b border-gray-50">
          <p className="text-[12px] text-gray-600 leading-relaxed">{concept}</p>
        </div>
      )}

      {/* Expandable details */}
      {expanded && (
        <div className="px-5 py-4 space-y-4 bg-gray-50/50">
          {/* Prompt */}
          {promptString && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Prompt</p>
              <p className="text-xs text-gray-700 font-mono leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-100">
                {promptString}
              </p>
            </div>
          )}

          {/* Negative prompt */}
          {negativePrompt && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Negative Prompt</p>
              <p className="text-xs text-gray-500 font-mono leading-relaxed bg-white rounded-lg p-3 border border-gray-100">
                {negativePrompt}
              </p>
            </div>
          )}

          {/* Scenes table */}
          {scenes.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-2">Escenas</p>
              <div className="space-y-2">
                {scenes.map((scene, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        {scene.duration_seconds ? `${scene.duration_seconds}s` : `Escena ${(scene.scene_number as number) || i + 1}`}
                      </span>
                      <span className="text-[10px] text-gray-400">{String(scene.framing || "")}</span>
                      <span className="text-[10px] text-gray-400">· {String(scene.camera_movement || "")}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{String(scene.description || "")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio direction */}
          {Object.keys(audioDir).length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Audio</p>
              <div className="bg-white rounded-lg p-3 border border-gray-100 space-y-1">
                {audioDir.music_mood && (
                  <p className="text-xs text-gray-600"><span className="font-medium">Musica:</span> {String(audioDir.music_mood)}</p>
                )}
                {Array.isArray(audioDir.sound_effects) && audioDir.sound_effects.length > 0 && (
                  <p className="text-xs text-gray-600"><span className="font-medium">SFX:</span> {(audioDir.sound_effects as string[]).join(", ")}</p>
                )}
                {audioDir.pacing && (
                  <p className="text-xs text-gray-600"><span className="font-medium">Ritmo:</span> {String(audioDir.pacing)}</p>
                )}
              </div>
            </div>
          )}

          {/* Reference image */}
          {variante.image_url && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">Imagen de referencia</p>
              <p className="text-xs text-blue-600 font-mono break-all bg-white rounded-lg p-3 border border-gray-100">
                {variante.image_url}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Video player or upload area */}
      <div className="px-5 py-4 border-t border-gray-50">
        {variante.video_url ? (
          <video src={variante.video_url} controls className="w-full rounded-lg" />
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
