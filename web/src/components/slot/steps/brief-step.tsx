"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BriefCard } from "@/components/slot/brief-card";
import type { Brief } from "@/lib/types";

interface BriefStepProps {
  brief: Brief | null;
  activeOp: string | null;
  error: string | null;
  onGenerate: () => void;
  onApprove: () => void;
  onRegenerate: () => void;
}

export function BriefStep({
  brief,
  activeOp,
  error,
  onGenerate,
  onApprove,
  onRegenerate,
}: BriefStepProps) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {brief ? (
        <BriefCard
          brief={brief}
          onApprove={onApprove}
          onRegenerate={onRegenerate}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center space-y-3">
          <p className="text-sm text-gray-500">
            No hay brief generado aun para este slot.
          </p>
          <Button
            onClick={onGenerate}
            disabled={activeOp === "brief"}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {activeOp === "brief" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando
                Brief...
              </>
            ) : (
              "Generar Brief con IA"
            )}
          </Button>
        </div>
      )}

      {activeOp === "approve-brief" && (
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Aprobando brief...
        </div>
      )}
      {activeOp === "regen-brief" && (
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Regenerando brief...
        </div>
      )}
    </div>
  );
}
