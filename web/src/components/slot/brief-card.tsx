"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { Brief } from "@/lib/types";

const highlightKeys = [
  "topic",
  "format",
  "platform",
  "pillar",
  "objective",
  "intention",
  "hook_direction",
  "cta_direction",
  "persona_target",
];

interface BriefCardProps {
  brief: Brief;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onApprove?: () => void;
}

export function BriefCard({
  brief,
  onEdit,
  onRegenerate,
  onApprove,
}: BriefCardProps) {
  const isApproved = !!brief.approved_at;
  const data = brief.brief_yaml;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle>Brief v{brief.version}</CardTitle>
          {isApproved && (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" />
              Aprobado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {highlightKeys.map((key) => {
            const value = data[key];
            if (value === undefined || value === null) return null;
            return (
              <div key={key} className="rounded-lg bg-gray-50 p-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="mt-0.5 block text-sm text-gray-800">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Render remaining keys */}
        {Object.entries(data)
          .filter(([key]) => !highlightKeys.includes(key))
          .map(([key, value]) => (
            <div key={key} className="rounded-lg bg-gray-50 p-3">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                {key.replace(/_/g, " ")}
              </span>
              <span className="mt-0.5 block text-sm text-gray-800">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </span>
            </div>
          ))}

        {!isApproved && (
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              Regenerar
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={onApprove}
            >
              Aprobar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
