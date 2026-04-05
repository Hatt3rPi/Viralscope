"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  MessageSquare,
} from "lucide-react";
import type { Brief } from "@/lib/types";

interface BriefCardProps {
  brief: Brief;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onApprove?: () => void;
}

const CONFIDENCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  alta: { bg: "bg-green-50", text: "text-green-700", label: "Confianza alta" },
  media: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Confianza media" },
  baja: { bg: "bg-red-50", text: "text-red-700", label: "Confianza baja" },
};

export function BriefCard({ brief, onEdit, onRegenerate, onApprove }: BriefCardProps) {
  const isApproved = !!brief.approved_at;
  const data = brief.brief_yaml as Record<string, unknown>;

  const topic = data.topic as string || "";
  const topicAngle = data.topic_angle as string || "";
  const format = data.format as string || "";
  const platform = data.platform as string || "";
  const pillar = data.pillar as string || "";
  const objective = data.objective as string || "";
  const intention = data.intention as string || "";
  const hookDirection = data.hook_direction as string || "";
  const ctaDirection = data.cta_direction as string || "";
  const personaTarget = data.persona_target as string || "";
  const reasoning = data.reasoning as string || data.justification as string || "";
  const confidence = data.confidence as string || "";
  const tensions = data.tensions as string[] || [];
  const uncertainties = data.uncertainties as string[] || [];
  const dateReference = data.date_reference as string || "";

  const confStyle = CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.media;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle>Brief v{brief.version}</CardTitle>
          {isApproved && (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" />
              Aprobado{brief.approved_by ? ` por ${brief.approved_by}` : ""}
            </Badge>
          )}
          {confidence && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${confStyle.bg} ${confStyle.text}`}>
              {confStyle.label}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Topic — the main decision */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{topic}</h3>
          {topicAngle && (
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{topicAngle}</p>
          )}
        </div>

        {/* Key attributes as compact badges */}
        <div className="flex flex-wrap gap-2">
          {format && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {format}
            </span>
          )}
          {platform && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {platform}
            </span>
          )}
          {pillar && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              {pillar}
            </span>
          )}
          {objective && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Target className="h-3 w-3" />{objective}
            </span>
          )}
          {intention && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              intention === "viral" ? "bg-red-100 text-red-700" :
              intention === "commercial" ? "bg-orange-100 text-orange-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {intention}
            </span>
          )}
          {personaTarget && (
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
              → {personaTarget}
            </span>
          )}
          {dateReference && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />{dateReference}
            </span>
          )}
        </div>

        {/* Hook & CTA direction */}
        {(hookDirection || ctaDirection) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {hookDirection && (
              <div className="rounded-lg bg-gray-50 p-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Dirección del Hook
                </span>
                <p className="text-sm text-gray-700">{hookDirection}</p>
              </div>
            )}
            {ctaDirection && (
              <div className="rounded-lg bg-gray-50 p-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Dirección del CTA
                </span>
                <p className="text-sm text-gray-700">{ctaDirection}</p>
              </div>
            )}
          </div>
        )}

        {/* Reasoning — the WHY behind the decision */}
        {reasoning && (
          <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Razonamiento del Estratega
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
          </div>
        )}

        {/* Tensions — where data conflicts with weights */}
        {tensions.length > 0 && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-yellow-600">
                Tensiones detectadas
              </span>
            </div>
            <ul className="space-y-1">
              {tensions.map((t, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Uncertainties — where data is insufficient */}
        {uncertainties.length > 0 && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Incertidumbres
              </span>
            </div>
            <ul className="space-y-1">
              {uncertainties.map((u, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>{u}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
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
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Aprobar Brief
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
