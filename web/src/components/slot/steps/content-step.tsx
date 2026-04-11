"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VarianteTabs } from "@/components/slot/variante-tabs";
import type { Variante } from "@/lib/types";
import type { HookItem, ArtStatus } from "@/components/slot/use-slot-workflow";
import { AlertTriangle } from "lucide-react";

interface ContentStepProps {
  variantes: Variante[];
  hooks: HookItem[];
  selectedHooks: number[];
  artProgress: Record<string, ArtStatus>;
  activeOp: string | null;
  error: string | null;
  onGenerateHooks: () => void;
  onSelectHook: (hookId: number) => void;
  onGenerateVariantesFromHooks: (hookTexts: string[]) => void;
  onRegenerateVariantes: () => void;
  onContinueToArt: () => void;
}

export function ContentStep({
  variantes,
  hooks,
  selectedHooks,
  artProgress,
  activeOp,
  error,
  onGenerateHooks,
  onSelectHook,
  onGenerateVariantesFromHooks,
  onRegenerateVariantes,
  onContinueToArt,
}: ContentStepProps) {
  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Phase A: Hook Funnel */}
      {variantes.length === 0 && (
        <div className="space-y-4">
          {hooks.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Primero generamos 12 hooks y los evaluamos con 6 dimensiones de
                calidad. Solo los mejores 3 avanzaran a variantes completas.
              </p>
              <Button
                onClick={onGenerateHooks}
                disabled={activeOp === "hooks"}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {activeOp === "hooks" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando
                    12 hooks...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Hook Funnel
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Hook results table */}
          {hooks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  {hooks.length} hooks generados — selecciona 3 para desarrollar
                </h4>
                <span className="text-xs text-gray-400">
                  Ordenados por score total
                </span>
              </div>

              <div className="space-y-2">
                {hooks.map((hook, idx) => {
                  const isSelected = selectedHooks.includes(hook.id);
                  const toneColor =
                    hook.tone === "emocional"
                      ? "border-l-rose-400 bg-rose-50/30"
                      : hook.tone === "educativo"
                        ? "border-l-sky-400 bg-sky-50/30"
                        : "border-l-amber-400 bg-amber-50/30";
                  const toneLabel =
                    hook.tone === "emocional"
                      ? "EMO"
                      : hook.tone === "educativo"
                        ? "EDU"
                        : "DIR";

                  return (
                    <button
                      key={hook.id}
                      onClick={() => onSelectHook(hook.id)}
                      className={cn(
                        "w-full text-left rounded-lg border-l-[3px] px-4 py-3 transition-all",
                        toneColor,
                        isSelected
                          ? "ring-2 ring-purple-400 bg-purple-50/50 border border-purple-200"
                          : "border border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold mt-0.5",
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          )}
                        >
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-gray-900 font-medium leading-snug">
                            &ldquo;{hook.text}&rdquo;
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {toneLabel}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              ·
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {hook.reasoning}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span
                            className={cn(
                              "text-lg font-bold tabular-nums",
                              hook.total >= 48
                                ? "text-green-600"
                                : hook.total >= 40
                                  ? "text-amber-600"
                                  : "text-gray-400"
                            )}
                          >
                            {hook.total}
                          </span>
                          <p className="text-[9px] text-gray-400">/60</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">
                  {selectedHooks.length}/3 seleccionados
                </p>
                <Button
                  onClick={() => {
                    const selected = hooks
                      .filter((h) => selectedHooks.includes(h.id))
                      .map((h) => h.text);
                    onGenerateVariantesFromHooks(selected);
                  }}
                  disabled={
                    selectedHooks.length !== 3 || activeOp === "variantes"
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {activeOp === "variantes" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generando Variantes...
                    </>
                  ) : (
                    "Generar Variantes desde Hooks"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase B: Generated variants */}
      {variantes.length > 0 && (
        <>
          <VarianteTabs variantes={variantes} />
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              onClick={onRegenerateVariantes}
              disabled={activeOp === "variantes"}
              variant="outline"
              size="sm"
            >
              Regenerar Variantes
            </Button>
            <Button
              onClick={onContinueToArt}
              disabled={activeOp === "auto-art"}
              className="bg-green-600 hover:bg-green-700"
            >
              {activeOp === "auto-art" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando
                  Arte A, B, C...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Continuar a Direccion de Arte
                </>
              )}
            </Button>
          </div>
          {/* Art generation progress chips */}
          {Object.keys(artProgress).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(artProgress).map(([label, artStatus]) => (
                <span
                  key={label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    artStatus === "done" && "bg-green-100 text-green-700",
                    artStatus === "generating" &&
                      "bg-purple-100 text-purple-700",
                    artStatus === "error" && "bg-red-100 text-red-700",
                    artStatus === "pending" && "bg-gray-100 text-gray-500"
                  )}
                >
                  {artStatus === "generating" && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {artStatus === "done" && <Check className="h-3 w-3" />}
                  {artStatus === "error" && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Variante {label}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
