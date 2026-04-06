"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Play,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Variante } from "@/lib/types";

interface InstagramPreviewProps {
  variante: Variante;
  brandName?: string;
  format?: string;
}

function extractSections(copyMd: string): { caption: string; full: string } {
  const captionMatch = copyMd.match(/## Caption\s*\n([\s\S]*?)(?=\n## |$)/i);
  const caption = captionMatch ? captionMatch[1].trim() : copyMd.slice(0, 300);
  return { caption, full: copyMd };
}

export function InstagramPreview({
  variante,
  brandName = "La Cuenteria",
  format = "reel",
}: InstagramPreviewProps) {
  const { caption, full } = extractSections(variante.copy_md);

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
    return <ReelPreview variante={variante} initials={initials} username={username} caption={caption} />;
  }

  if (format === "story") {
    return <StoryPreview variante={variante} initials={initials} username={username} caption={caption} />;
  }

  if (format === "carrusel") {
    return <CarouselPreview variante={variante} initials={initials} username={username} caption={caption} copyFull={full} />;
  }

  return <PostPreview variante={variante} initials={initials} username={username} caption={caption} copyFull={full} />;
}

// ─── Expandable Caption ─────────────────────────────────────────────────────

function ExpandableCaption({
  username,
  caption,
  copyFull,
  dark = false,
}: {
  username: string;
  caption: string;
  copyFull?: string;
  dark?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = expanded && copyFull ? copyFull : caption;
  const truncated = !expanded && caption.length > 120;

  return (
    <div className={cn("px-4 py-2", dark && "text-white")}>
      <div className={cn("text-sm", dark ? "text-white/90" : "text-gray-900")}>
        <span className="font-semibold">{username}</span>{" "}
        {expanded ? (
          <span className="whitespace-pre-wrap">{text}</span>
        ) : (
          <span>{truncated ? caption.slice(0, 120) + "..." : caption}</span>
        )}
      </div>
      {(truncated || expanded) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "text-xs mt-1 font-medium",
            dark ? "text-white/60" : "text-gray-400"
          )}
        >
          {expanded ? "menos" : "mas"}
        </button>
      )}
    </div>
  );
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-auto max-w-[280px]">
      <div className="overflow-hidden rounded-[32px] border-[6px] border-gray-800 bg-black relative">
        <div className="flex items-center justify-center bg-black px-6 py-1">
          <span className="text-[10px] font-medium text-white">9:41</span>
        </div>

        <div className="relative aspect-[9/16]">
          {variante.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variante.image_url} alt="Reel" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
              <span className="text-sm text-white/60">Sin imagen</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="h-6 w-6 text-white ml-1" fill="white" />
            </div>
          </div>

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

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="text-xs font-semibold text-white">{username}</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              {expanded ? caption : caption.slice(0, 80)}
              {caption.length > 80 && (
                <button onClick={() => setExpanded(!expanded)} className="text-white/60 ml-1">
                  {expanded ? " menos" : "... mas"}
                </button>
              )}
            </p>
          </div>

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
        <div className="flex items-center justify-center bg-black px-6 py-1">
          <span className="text-[10px] font-medium text-white">9:41</span>
        </div>

        <div className="relative aspect-[9/16]">
          {variante.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variante.image_url} alt="Story" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
              <span className="text-sm text-white/60">Sin imagen</span>
            </div>
          )}

          <div className="absolute top-2 left-3 right-3">
            <div className="h-0.5 rounded-full bg-white/30">
              <div className="h-full w-1/3 rounded-full bg-white" />
            </div>
          </div>

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

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 text-center">
            <p className="text-xs text-white/80 mb-2">{caption.slice(0, 150)}</p>
            <div className="flex flex-col items-center gap-1">
              <ChevronUp className="h-5 w-5 text-white animate-bounce" />
              <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Ver mas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Carousel Preview (1:1) with navigation ─────────────────────────────────

function CarouselPreview({
  variante,
  initials,
  username,
  caption,
  copyFull,
}: {
  variante: Variante;
  initials: string;
  username: string;
  caption: string;
  copyFull: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const imgJson = variante.art_direction_image_json as Record<string, unknown> | null;
  const slides =
    imgJson?.type === "carousel" && Array.isArray(imgJson?.slides)
      ? (imgJson.slides as Array<Record<string, unknown>>)
      : null;
  const totalSlides = slides ? slides.length : 1;

  // For now we only have 1 generated image — show it on slide 0
  // Future: each slide will have its own image_url
  const currentConcept = slides?.[currentSlide]?.concept as string | undefined;

  return (
    <div className="mx-auto max-w-[375px]">
      <div className="overflow-hidden rounded-[40px] border-8 border-gray-800 bg-white">
        <div className="flex items-center justify-center bg-gray-800 px-6 py-1.5">
          <span className="text-xs font-medium text-white">9:41</span>
        </div>

        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            {initials}
          </div>
          <span className="text-sm font-semibold text-gray-900">{username}</span>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Image area with navigation */}
        <div className="relative">
          {currentSlide === 0 && variante.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variante.image_url} alt="Carousel slide" className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 p-6">
              <span className="text-sm font-medium text-white/90 text-center">
                {currentConcept || `Slide ${currentSlide + 1}`}
              </span>
              <span className="text-xs text-white/50 mt-2">Imagen pendiente</span>
            </div>
          )}

          {/* Slide counter */}
          <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1">
            <span className="text-[10px] font-medium text-white">
              {currentSlide + 1}/{totalSlides}
            </span>
          </div>

          {/* Navigation arrows */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide((s) => s - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
          )}
          {currentSlide < totalSlides - 1 && (
            <button
              onClick={() => setCurrentSlide((s) => s + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          )}
        </div>

        {/* Action bar with dots */}
        <div className="flex items-center px-4 py-3">
          <div className="flex gap-4">
            <Heart className="h-6 w-6 text-gray-900" />
            <MessageCircle className="h-6 w-6 text-gray-900" />
            <Send className="h-6 w-6 text-gray-900" />
          </div>
          <div className="flex-1 flex justify-center gap-1">
            {Array.from({ length: Math.min(totalSlides, 7) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === currentSlide ? "bg-blue-500" : "bg-gray-300"
                )}
              />
            ))}
            {totalSlides > 7 && (
              <span className="text-[8px] text-gray-400 ml-1">+{totalSlides - 7}</span>
            )}
          </div>
          <Bookmark className="h-6 w-6 text-gray-900" />
        </div>

        {/* Likes */}
        <div className="px-4">
          <p className="text-sm font-semibold text-gray-900">127 Me gusta</p>
        </div>

        {/* Expandable caption */}
        <ExpandableCaption username={username} caption={caption} copyFull={copyFull} />

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
  copyFull,
}: {
  variante: Variante;
  initials: string;
  username: string;
  caption: string;
  copyFull: string;
}) {
  return (
    <div className="mx-auto max-w-[375px]">
      <div className="overflow-hidden rounded-[40px] border-8 border-gray-800 bg-white">
        <div className="flex items-center justify-center bg-gray-800 px-6 py-1.5">
          <span className="text-xs font-medium text-white">9:41</span>
        </div>

        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
            {initials}
          </div>
          <span className="text-sm font-semibold text-gray-900">{username}</span>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {variante.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={variante.image_url} alt="Post" className="aspect-square w-full object-cover" />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
            <span className="text-lg font-medium text-white/80">Sin imagen</span>
          </div>
        )}

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

        <div className="px-4">
          <p className="text-sm font-semibold text-gray-900">127 Me gusta</p>
        </div>

        <ExpandableCaption username={username} caption={caption} copyFull={copyFull} />

        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400">Hace 2 horas</p>
        </div>
      </div>
    </div>
  );
}
