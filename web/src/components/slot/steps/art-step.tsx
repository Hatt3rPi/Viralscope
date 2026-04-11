"use client";

import {
  Check,
  Loader2,
  Sparkles,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InstagramPreview } from "@/components/slot/instagram-preview";
import type { Slot, Brief, Variante } from "@/lib/types";
import type { ImgStatus } from "@/components/slot/use-slot-workflow";

interface ArtStepProps {
  slot: Slot;
  brief: Brief | null;
  variantes: Variante[];
  imgProgress: Record<string, ImgStatus>;
  activeOp: string | null;
  error: string | null;
  onGenerateImages: () => void;
  onAdvanceToSimulation: () => void;
}

export function ArtStep({
  slot,
  brief,
  variantes,
  imgProgress,
  activeOp,
  error,
  onGenerateImages,
  onAdvanceToSimulation,
}: ArtStepProps) {
  const imgTotal = Object.keys(imgProgress).length;
  const imgDone = Object.values(imgProgress).filter((s) => s === "done").length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {variantes.length === 0 && (
        <p className="text-sm text-gray-400">
          Primero genera variantes en el paso anterior.
        </p>
      )}

      {/* Image generation progress */}
      {(activeOp === "batch-images" || imgTotal > 0) && (
        <div className="rounded-xl border border-purple-100 bg-white p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2
              className={cn(
                "h-5 w-5 text-purple-600",
                activeOp === "batch-images" && "animate-spin"
              )}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  Generando imagenes...
                </h4>
                {imgTotal > 0 && (
                  <span className="text-sm font-medium text-purple-700">
                    {imgDone}/{imgTotal} completadas
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Max 3 en paralelo, con reintentos automaticos.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {imgTotal > 0 && (
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${imgTotal > 0 ? (imgDone / imgTotal) * 100 : 0}%` }}
              />
            </div>
          )}

          {/* Per-image status chips */}
          {imgTotal > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(imgProgress).map(([key, imgStatus]) => (
                <span
                  key={key}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    imgStatus === "done" && "bg-green-100 text-green-700",
                    imgStatus === "generating" &&
                      "bg-purple-100 text-purple-700",
                    imgStatus === "retrying" && "bg-amber-100 text-amber-700",
                    imgStatus === "error" && "bg-red-100 text-red-700",
                    imgStatus === "pending" && "bg-gray-100 text-gray-500"
                  )}
                >
                  {(imgStatus === "generating" || imgStatus === "retrying") && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {imgStatus === "done" && <Check className="h-3 w-3" />}
                  {imgStatus === "error" && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {key}
                  {imgStatus === "retrying" ? " (reintentando)" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AutoLab note */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        Proximamente: los prompts seran refinados automaticamente via AutoLab
        antes de generar.
      </div>

      {/* Per-variant: strategy card + preview */}
      {variantes.map((v) => {
        const toneConfig: Record<
          string,
          { label: string; accent: string; border: string; bg: string }
        > = {
          A: {
            label: "Emocional",
            accent: "text-rose-600",
            border: "border-l-rose-400",
            bg: "bg-rose-50",
          },
          B: {
            label: "Educativo",
            accent: "text-sky-600",
            border: "border-l-sky-400",
            bg: "bg-sky-50",
          },
          C: {
            label: "Directo",
            accent: "text-amber-600",
            border: "border-l-amber-400",
            bg: "bg-amber-50",
          },
        };
        const tone = toneConfig[v.variant_label] || {
          label: v.variant_label,
          accent: "text-gray-600",
          border: "border-l-gray-300",
          bg: "bg-gray-50",
        };
        const briefData = brief?.brief_yaml as
          | Record<string, unknown>
          | undefined;

        return (
          <div key={v.id} className="space-y-4">
            {/* Variant header */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white",
                  {
                    "bg-rose-500": v.variant_label === "A",
                    "bg-sky-500": v.variant_label === "B",
                    "bg-amber-500": v.variant_label === "C",
                  }
                )}
              >
                {v.variant_label}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Variante {v.variant_label} —{" "}
                  <span className={tone.accent}>{tone.label}</span>
                </h4>
                <p className="text-[11px] text-gray-400">
                  {slot.objective} · {slot.intention} · {slot.format}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
              {/* Left: Strategy card */}
              <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                {briefData && (
                  <div className="space-y-0">
                    <div
                      className={cn(
                        "px-5 py-4 border-l-[3px] border-b border-gray-50",
                        tone.border
                      )}
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                        Foco estrategico
                      </p>
                      <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                        {String(
                          briefData.topic_angle || briefData.topic || "—"
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-gray-50">
                      <div className="px-5 py-3 border-r border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">
                          Hook
                        </p>
                        <p className="text-[12px] text-gray-700 leading-relaxed">
                          {String(briefData.hook_direction || "—")}
                        </p>
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">
                          CTA
                        </p>
                        <p className="text-[12px] text-gray-700 leading-relaxed">
                          {String(briefData.cta_direction || "—")}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 py-3 border-b border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1">
                        Persona target
                      </p>
                      <p className="text-[12px] text-gray-700">
                        {String(briefData.persona_target || "—")}
                      </p>
                    </div>
                    {Boolean(briefData.reasoning) && (
                      <div className={cn("px-5 py-4", tone.bg)}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] mb-1.5">
                          Razonamiento
                        </p>
                        <p className="text-[12px] text-gray-600 leading-relaxed">
                          {String(briefData.reasoning)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Phone preview */}
              <div className="flex items-start justify-center">
                <InstagramPreview variante={v} format={slot.format} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Regenerate images + advance button */}
      {variantes.some(
        (v) =>
          v.art_direction_image_json &&
          Object.keys(v.art_direction_image_json).length > 0
      ) && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateImages}
            disabled={activeOp === "batch-images"}
          >
            {activeOp === "batch-images" ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />{" "}
                Regenerando...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-3.5 w-3.5" />
                Regenerar imagenes
              </>
            )}
          </Button>

          {variantes.some((v) => v.image_url) && (
            <Button
              onClick={onAdvanceToSimulation}
              disabled={activeOp === "advance-art"}
              className="bg-green-600 hover:bg-green-700"
            >
              {activeOp === "advance-art" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Avanzando...
                </>
              ) : (
                "Continuar a Simulacion"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
