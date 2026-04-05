"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Feedback } from "@/lib/types";

interface FeedbackPanelProps {
  feedbackItems: Feedback[];
  slotId: string;
  step: string;
  varianteId?: string;
}

export function FeedbackPanel({
  feedbackItems,
  slotId,
  step,
  varianteId,
}: FeedbackPanelProps) {
  const [items, setItems] = React.useState<Feedback[]>(feedbackItems);
  const [comment, setComment] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    const newItem: Feedback = {
      id: crypto.randomUUID(),
      slot_id: slotId,
      variante_id: varianteId || null,
      user_id: "local-user",
      user_email: "usuario@local.dev",
      step: step as Feedback["step"],
      comment: comment.trim(),
      requested_changes_json: null,
      resolved: false,
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [...prev, newItem]);
    setComment("");
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Feedback
      </h4>

      {/* Existing feedback items */}
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-400">Sin feedback aún.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="max-w-[80%] rounded-lg rounded-tl-none border border-gray-200 bg-gray-50 p-3"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-purple-700">
                {item.user_email || item.user_id}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(item.created_at)}
              </span>
              {item.resolved && (
                <Badge variant="success" className="text-[10px]">
                  Resuelto
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700">{item.comment}</p>
          </div>
        ))}
      </div>

      {/* New feedback form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe tu feedback..."
          className="min-h-[60px] flex-1"
        />
        <Button type="submit" size="sm" className="self-end">
          Enviar Feedback
        </Button>
      </form>
    </div>
  );
}
