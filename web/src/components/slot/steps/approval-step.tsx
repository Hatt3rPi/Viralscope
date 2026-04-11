"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Variante } from "@/lib/types";

interface ApprovalStepProps {
  variantes: Variante[];
  winnerVariant: Variante | null;
  activeOp: string | null;
  error: string | null;
  onApprove: () => void;
}

export function ApprovalStep({
  variantes,
  winnerVariant,
  activeOp,
  error,
  onApprove,
}: ApprovalStepProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <h4 className="font-semibold text-gray-900">Resumen Final</h4>

      {winnerVariant ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            La variante ganadora es{" "}
            <span className="font-bold text-purple-700">
              {winnerVariant.variant_label}
            </span>{" "}
            {winnerVariant.simulation_score !== null && (
              <>
                con un puntaje de{" "}
                <span className="font-bold text-green-700">
                  {winnerVariant.simulation_score?.toFixed(1)}
                </span>
              </>
            )}
          </p>
          {winnerVariant.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={winnerVariant.image_url}
              alt="Variante ganadora"
              className="max-w-xs rounded-lg border"
            />
          )}
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={activeOp === "approve-final"}
            onClick={onApprove}
          >
            {activeOp === "approve-final" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aprobando...
              </>
            ) : (
              "Aprobar para Publicacion"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {variantes.length > 0
              ? "Las variantes estan listas para revision."
              : "Aun no hay datos de simulacion disponibles."}
          </p>
          {variantes.length > 0 && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={activeOp === "approve-final"}
              onClick={onApprove}
            >
              {activeOp === "approve-final" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Aprobando...
                </>
              ) : (
                "Aprobar para Publicacion"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
