"use client";

import * as React from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Play,
  ChevronUp,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Variante } from "@/lib/types";

interface InstagramPreviewProps {
  variante: Variante;
  brandName?: string;
  format?: string;
}

function extractCaption(copyMd: string): string {
  const captionMatch = copyMd.match(/## Caption\s*\n([\s\S]*?)(?=\n## |$)/i);
  if (captionMatch) return captionMatch[1].trim();
  return copyMd.slice(0, 200);
}

export function InstagramPreview({
  variante,
  brandName = "La Cuenteria",
  format = "reel",
}: InstagramPreviewProps) {
  const caption = extractCaption(variante.copy_md);
  const truncatedCaption =
    caption.length > 100 ? caption.slice(0, 100) + "... mas" : caption;

  const initials = brandName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const username = brandName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  if (format === "reel" || format === "video") {
    return <ReelPreview variante={variante} initials={initials} username={username} caption={truncatedCaption} />;
  }

  if (format === "story") {
    return <StoryPreview variante={variante} initials={initials} username={username} caption={truncatedCaption} />;
  }

  if (format === "carrusel") {
    return <CarouselPreview variante={variante} initials={initials} username={username} caption={truncatedCaption} />;
  }

  // Default: static post (1:1)
  return <PostPreview variante={variante} initials={initials} username={username} caption={truncatedCaption} />;
}

// ─── Reel Preview (9:16) ────────────────────────────────────────────────────

function ReelPreview({
  variante,
  initials,
  username,
  caption,
}: {
  variante: Variante;
  initials: string;
  username: string;
  caption: string;
}) {
  return (
    <div className="mx-auto max-w-[280px]">
      <div className="overflow-hidden rounded-[32px] border-[6px] border-gray-800 bg-black relative">
        {/* Status bar */}
        <div className="flex items-center justify-center bg-black px-6 py-1">
          <span className="text-[10px] font-medium text-white">9:41</span>
        </div>

        {/* 9:16 content area */}
        <div className="relative aspect-[9/16]">
          {variante.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={variante.image_url}
              alt="Reel"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
              <span className="text-sm text-white/60">Sin imagen</span>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="h-6 w-6 text-white ml-1" fill="white" />
            </div>
          </div>

          {/* Right side icons */}
          <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
            <button className="flex flex-col items-center gap-1">
              <Heart className="h-6 w-6 text-white drop-shadow" />
              <span className="text-[10px] text-white font-medium drop-shadow">127</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <MessageCircle className="h-6 w-6 text-white drop-shadow" />
              <span className="text-[10px] text-white font-medium drop-shadow">24</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <Send className="h-6 w-6 text-white drop-shadow" />
            </button>
            <button className="flex flex-col items-center gap-1">
              <Bookmark className="h-6 w-6 text-white drop-shadow" />
            </button>
          </div>

          {/* Bottom overlay: user + caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="text-xs font-semibold text-white">{username}</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">{caption}</p>
          </div>

          {/* Sound icon */}
          <div className="absolute top-4 right-3">
            <Volume2 className="h-4 w-4 text-white drop-shadow" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Story Preview (9:16) ───────────────────────────────────────────────────

function StoryPreview({
  variante,
  initials,
  username,
  caption,
}: {
  variante: Variante;
  initials: string;
  username: string;
  caption: string;
}) {
  return (
    <div className="mx-auto max-w-[280px]">
      <div className="overflow-hidden rounded-[32px] border-[6px] border-gray-800 bg-black relative">
        {/* Status bar */}
        <div className="flex items-center justify-center bg-black px-6 py-1">
          <span className="text-[10px] font-medium text-white">9:41</span>
        </div>

        <div className="relative aspect-[9/16]">
          {variante.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={variante.image_url}
              alt="Story"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
              <span className="text-sm text-white/60">Sin imagen</span>
            </div>
          )}

          {/* Progress bar at top */}
          <div className="absolute top-2 left-3 right-3">
            <div className="h-0.5 rounded-full bg-white/30">
              <div className="h-full w-1/3 rounded-full bg-white" />
            </div>
          </div>

          {/* Header: avatar + username + close */}
          <div className="absolute top-5 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 ring-2 ring-purple-400 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="text-xs font-semibold text-white drop-shadow">{username}</span>
              <span className="text-[10px] text-white/60">2h</span>
            </div>
            <button className="text-white text-lg font-light">&times;</button>
          </div>

          {/* Bottom: swipe up CTA */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 text-center">
            <p className="text-xs text-white/80 mb-2">{caption}</p>
            <div className="flex flex-col items-center gap-1">
              <ChevronUp className="h-5 w-5 text-white animate-bounce" />
              <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                Ver mas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Carousel Preview (1:1) ─────────────────────────────────────────────────

function CarouselPreview({
  variante,
  initials,
  username,
  caption,
}: {
  variante: Variante;
  initials: string;
  username: string;
  caption: string;
}) {
  // Determine number of slides from art direction
  const imgJson = variante.art_direction_image_json as Record<string, unknown> | null;
  const slides = (imgJson?.type === "carousel" && Array.isArray(imgJson?.slides))
    ? (imgJson.slides as Array<Record<string, unknown>>)
    : null;
  const totalSlides = slides ? slides.length : 5;

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
          <span className="text-sm font-semibold text-gray-900">{username}</span>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Image with carousel indicator */}
        <div className="relative">
          {variante.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={variante.image_url}
              alt="Carousel"
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
              <span className="text-lg font-medium text-white/80">Sin imagen</span>
            </div>
          )}

          {/* Slide counter */}
          <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1">
            <span className="text-[10px] font-medium text-white">1/{totalSlides}</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center px-4 py-3">
          <div className="flex gap-4">
            <Heart className="h-6 w-6 text-gray-900" />
            <MessageCircle className="h-6 w-6 text-gray-900" />
            <Send className="h-6 w-6 text-gray-900" />
          </div>
          {/* Pagination dots */}
          <div className="flex-1 flex justify-center gap-1">
            {Array.from({ length: Math.min(totalSlides, 7) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i === 0 ? "bg-blue-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>
          <Bookmark className="h-6 w-6 text-gray-900" />
        </div>

        {/* Likes */}
        <div className="px-4">
          <p className="text-sm font-semibold text-gray-900">127 Me gusta</p>
        </div>

        {/* Caption */}
        <div className="px-4 py-2">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{username}</span> {caption}
          </p>
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400">Hace 2 horas</p>
        </div>
      </div>
    </div>
  );
}

// ─── Static Post Preview (1:1) ──────────────────────────────────────────────

function PostPreview({
  variante,
  initials,
  username,
  caption,
}: {
  variante: Variante;
  initials: string;
  username: string;
  caption: string;
}) {
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
          <span className="text-sm font-semibold text-gray-900">{username}</span>
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
            <span className="text-lg font-medium text-white/80">Sin imagen</span>
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
            <span className="font-semibold">{username}</span> {caption}
          </p>
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400">Hace 2 horas</p>
        </div>
      </div>
    </div>
  );
}
