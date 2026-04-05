"use client";

import * as React from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import type { Variante } from "@/lib/types";

interface InstagramPreviewProps {
  variante: Variante;
  brandName?: string;
}

function extractCaption(copyMd: string): string {
  // Try to find a "Caption" section
  const captionMatch = copyMd.match(/## Caption\s*\n([\s\S]*?)(?=\n## |$)/i);
  if (captionMatch) {
    return captionMatch[1].trim();
  }
  // Fallback: use first 200 chars
  return copyMd.slice(0, 200);
}

export function InstagramPreview({
  variante,
  brandName = "La Cuentería",
}: InstagramPreviewProps) {
  const caption = extractCaption(variante.copy_md);
  const truncatedCaption =
    caption.length > 100 ? caption.slice(0, 100) + "... más" : caption;

  const initials = brandName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-[375px]">
      <div className="overflow-hidden rounded-[40px] border-8 border-gray-800 bg-white">
        {/* Status bar */}
        <div className="flex items-center justify-center bg-gray-800 px-6 py-1.5">
          <span className="text-xs font-medium text-white">9:41</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            {initials}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            lacuenteriacl
          </span>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Image */}
        {variante.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={variante.image_url}
            alt="Post"
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
            <span className="text-lg font-medium text-white/80">
              Sin imagen
            </span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center px-4 py-3">
          <div className="flex gap-4">
            <Heart className="h-6 w-6 text-gray-900" />
            <MessageCircle className="h-6 w-6 text-gray-900" />
            <Send className="h-6 w-6 text-gray-900" />
          </div>
          <div className="ml-auto">
            <Bookmark className="h-6 w-6 text-gray-900" />
          </div>
        </div>

        {/* Likes */}
        <div className="px-4">
          <p className="text-sm font-semibold text-gray-900">127 Me gusta</p>
        </div>

        {/* Caption */}
        <div className="px-4 py-2">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">lacuenteriacl</span>{" "}
            {truncatedCaption}
          </p>
        </div>

        {/* Timestamp */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400">Hace 2 horas</p>
        </div>
      </div>
    </div>
  );
}
