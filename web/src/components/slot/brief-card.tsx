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
  Pencil,
  X,
  Loader2,
} from "lucide-react";
import type { Brief } from "@/lib/types";

interface BriefCardProps {
  brief: Brief;
  onSave?: (briefYaml: Record<string, unknown>) => Promise<void>;
  onRegenerate?: () => void;
  onApprove?: () => void;
}

const CONFIDENCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  alta: { bg: "bg-green-50", text: "text-green-700", label: "Confianza alta" },
  media: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Confianza media" },
  baja: { bg: "bg-red-50", text: "text-red-700", label: "Confianza baja" },
};

export function BriefCard({ brief, onSave, onRegenerate, onApprove }: BriefCardProps) {
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

  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editData, setEditData] = React.useState({
    topic_angle: topicAngle,
    hook_direction: hookDirection,
    cta_direction: ctaDirection,
    reasoning: reasoning,
  });

  function handleStartEdit() {
    setEditData({
      topic_angle: topicAngle,
      hook_direction: hookDirection,
      cta_direction: ctaDirection,
      reasoning: reasoning,
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      const updatedYaml = { ...data, ...editData };
      await onSave(updatedYaml);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

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
        {/* Topic */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{topic}</h3>
          {editing ? (
            <textarea
              value={editData.topic_angle}
              onChange={(e) => setEditData({ ...editData, topic_angle: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 leading-relaxed focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              rows={3}
            />
          ) : topicAngle ? (
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{topicAngle}</p>
          ) : null}
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
              &rarr; {personaTarget}
            </span>
          )}
          {dateReference && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />{dateReference}
            </span>
          )}
        </div>

        {/* Hook & CTA direction */}
        {(hookDirection || ctaDirection || editing) && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Direccion del Hook
              </span>
              {editing ? (
                <textarea
                  value={editData.hook_direction}
                  onChange={(e) => setEditData({ ...editData, hook_direction: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-700">{hookDirection}</p>
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Direccion del CTA
              </span>
              {editing ? (
                <textarea
                  value={editData.cta_direction}
                  onChange={(e) => setEditData({ ...editData, cta_direction: e.target.value })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-700">{ctaDirection}</p>
              )}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {(reasoning || editing) && (
          <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                Razonamiento del Estratega
              </span>
            </div>
            {editing ? (
              <textarea
                value={editData.reasoning}
                onChange={(e) => setEditData({ ...editData, reasoning: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
            )}
          </div>
        )}

        {/* Tensions */}
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
                  <span className="text-yellow-500 mt-0.5">&bull;</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Uncertainties */}
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
                  <span className="text-gray-400 mt-0.5">&bull;</span>{u}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        {!isApproved && (
          <div className="flex gap-2 pt-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Guardando...</>
                  ) : (
                    <><Check className="mr-1.5 h-3.5 w-3.5" /> Guardar</>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
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
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
