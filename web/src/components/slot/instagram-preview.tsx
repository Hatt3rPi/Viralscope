"use client";

import { useState, useCallback } from "react";
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

function extractCaption(copyMd: string): string {
  const captionMatch = copyMd.match(/## Caption\s*\n([\s\S]*?)(?=\n## |$)/i);
  return captionMatch ? captionMatch[1].trim() : copyMd.slice(0, 500);
}

function LazyImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  return (
    <div className={cn("relative", className)}>
      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        loading={eager ? "eager" : "lazy"}
        onLoad={onLoad}
      />
    </div>
  );
}

export function InstagramPreview({
  variante,
  brandName = "La Cuenteria",
  format = "reel",
}: InstagramPreviewProps) {
  const caption = extractCaption(variante.copy_md);
  const initials = brandName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const username = brandName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  if (format === "reel" || format === "video") {
    return <ReelPreview variante={variante} initials={initials} username={username} caption={caption} />;
  }
  if (format === "story") {
    return <StoryPreview variante={variante} initials={initials} username={username} caption={caption} />;
  }
  if (format === "carrusel") {
    return <CarouselPreview variante={variante} initials={initials} username={username} caption={caption} />;
  }
  return <PostPreview variante={variante} initials={initials} username={username} caption={caption} />;
}

// ─── Device Shell ───────────────────────────────────────────────────────────

function DeviceShell({
  children,
  width = "max-w-[340px]",
  dark = false,
}: {
  children: React.ReactNode;
  width?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("mx-auto", width)}>
      <div className="device-frame">
        <div className={cn("device-screen", dark && "bg-black")}>
          {/* Notch area */}
          <div className={cn(
            "flex items-center justify-center pt-7 pb-1 px-6",
            dark ? "bg-black" : "bg-white"
          )}>
            <span className={cn(
              "text-[10px] font-semibold tracking-tight",
              dark ? "text-white/70" : "text-gray-900"
            )}>
              9:41
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ initials, size = "sm", ring = false }: { initials: string; size?: "sm" | "md"; ring?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white",
      size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs",
      ring && "ring-2 ring-fuchsia-400/60 ring-offset-1 ring-offset-black"
    )}>
      {initials}
    </div>
  );
}

// ─── Reel Preview (9:16) ────────────────────────────────────────────────────

function ReelPreview({
  variante, initials, username, caption,
}: {
  variante: Variante; initials: string; username: string; caption: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <DeviceShell width="max-w-[280px]" dark>
      <div className="relative aspect-[9/16] bg-black">
        {variante.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <LazyImage src={variante.image_url!} alt="Reel" className="h-full w-full" eager />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/80 to-fuchsia-900/60">
            <span className="text-sm text-white/40 font-light tracking-wide">Sin imagen</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/25 backdrop-blur-md border border-white/10">
            <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* Side actions */}
        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
          {[
            { icon: Heart, label: "127" },
            { icon: MessageCircle, label: "24" },
            { icon: Send },
            { icon: Bookmark },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <Icon className="h-6 w-6 text-white drop-shadow-lg" />
              {label && <span className="text-[9px] text-white/80 font-medium">{label}</span>}
            </div>
          ))}
        </div>

        {/* Bottom caption */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-20">
          <div className="flex items-center gap-2 mb-2">
            <Avatar initials={initials} size="sm" />
            <span className="text-[13px] font-semibold text-white">{username}</span>
          </div>
          <p className="text-[12px] text-white/85 leading-relaxed">
            {expanded ? caption : caption.slice(0, 80)}
            {caption.length > 80 && (
              <button onClick={() => setExpanded(!expanded)} className="text-white/50 ml-1 font-medium">
                {expanded ? " menos" : "... mas"}
              </button>
            )}
          </p>
        </div>

        {/* Sound */}
        <div className="absolute top-3 right-3">
          <Volume2 className="h-4 w-4 text-white/70" />
        </div>
      </div>
    </DeviceShell>
  );
}

// ─── Story Preview (9:16) ───────────────────────────────────────────────────

function StoryPreview({
  variante, initials, username, caption,
}: {
  variante: Variante; initials: string; username: string; caption: string;
}) {
  return (
    <DeviceShell width="max-w-[280px]" dark>
      <div className="relative aspect-[9/16] bg-black">
        {variante.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <LazyImage src={variante.image_url!} alt="Story" className="h-full w-full" eager />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/80 to-fuchsia-900/60">
            <span className="text-sm text-white/40 font-light tracking-wide">Sin imagen</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute top-1 left-3 right-3">
          <div className="h-[2px] rounded-full bg-white/25">
            <div className="h-full w-1/3 rounded-full bg-white" />
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-4 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar initials={initials} size="sm" ring />
            <span className="text-[13px] font-semibold text-white drop-shadow-lg">{username}</span>
            <span className="text-[10px] text-white/50">2h</span>
          </div>
          <button className="text-white/70 text-xl leading-none">&times;</button>
        </div>

        {/* Bottom CTA */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-5 pt-12 text-center">
          <p className="text-[12px] text-white/75 mb-3 leading-relaxed">{caption.slice(0, 150)}</p>
          <div className="flex flex-col items-center gap-0.5">
            <ChevronUp className="h-5 w-5 text-white animate-bounce" />
            <span className="text-[9px] font-bold text-white uppercase tracking-[0.15em]">Ver mas</span>
          </div>
        </div>
      </div>
    </DeviceShell>
  );
}

// ─── Carousel Preview (1:1) ─────────────────────────────────────────────────

function CarouselPreview({
  variante, initials, username, caption,
}: {
  variante: Variante; initials: string; username: string; caption: string;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const imgJson = variante.art_direction_image_json as Record<string, unknown> | null;
  const slides =
    imgJson?.type === "carousel" && Array.isArray(imgJson?.slides)
      ? (imgJson.slides as Array<Record<string, unknown>>)
      : null;
  const totalSlides = slides ? slides.length : 1;
  const currentSlideData = slides?.[currentSlide];
  const currentSlideImageUrl = currentSlideData?.image_url as string | undefined;
  const currentConcept = currentSlideData?.concept as string | undefined;

  return (
    <DeviceShell>
      <div className="scrollbar-none overflow-y-auto max-h-[680px]">
        {/* IG Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-b border-gray-100/80">
          <Avatar initials={initials} size="sm" />
          <span className="text-[13px] font-semibold text-gray-900 tracking-tight">{username}</span>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </div>
        </div>

        {/* Image with navigation */}
        <div className="relative bg-gray-50">
          {currentSlideImageUrl || (currentSlide === 0 && variante.image_url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <LazyImage
              src={currentSlideImageUrl || variante.image_url || ""}
              alt={`Slide ${currentSlide + 1}`}
              className="aspect-square w-full"
              eager={currentSlide === 0}
            />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8">
              <span className="text-[13px] font-medium text-gray-500 text-center leading-relaxed">
                {currentConcept || `Slide ${currentSlide + 1}`}
              </span>
              <span className="text-[11px] text-gray-400 mt-2">Imagen pendiente</span>
            </div>
          )}

          {/* Pill counter */}
          <div className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
            <span className="text-[10px] font-semibold text-white tabular-nums">
              {currentSlide + 1}/{totalSlides}
            </span>
          </div>

          {/* Arrows */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide((s) => s - 1)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 text-gray-800" />
            </button>
          )}
          {currentSlide < totalSlides - 1 && (
            <button
              onClick={() => setCurrentSlide((s) => s + 1)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-4 w-4 text-gray-800" />
            </button>
          )}
        </div>

        {/* Actions + dots */}
        <div className="flex items-center px-4 py-2.5">
          <div className="flex gap-4">
            <Heart className="h-[22px] w-[22px] text-gray-900" />
            <MessageCircle className="h-[22px] w-[22px] text-gray-900" />
            <Send className="h-[22px] w-[22px] text-gray-900" />
          </div>
          <div className="flex-1 flex justify-center gap-[5px]">
            {Array.from({ length: Math.min(totalSlides, 7) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === currentSlide
                    ? "h-[6px] w-[6px] bg-blue-500"
                    : "h-[5px] w-[5px] bg-gray-300"
                )}
              />
            ))}
          </div>
          <Bookmark className="h-[22px] w-[22px] text-gray-900" />
        </div>

        {/* Engagement */}
        <div className="px-4 pb-1">
          <p className="text-[13px] font-semibold text-gray-900">127 Me gusta</p>
        </div>

        {/* Full caption */}
        <div className="px-4 py-2">
          <p className="text-[13px] text-gray-900 whitespace-pre-wrap leading-[1.45]">
            <span className="font-semibold">{username}</span>{" "}{caption}
          </p>
        </div>

        <div className="px-4 pb-5">
          <p className="text-[11px] text-gray-400 tracking-tight">Hace 2 horas</p>
        </div>
      </div>
    </DeviceShell>
  );
}

// ─── Static Post Preview (1:1) ──────────────────────────────────────────────

function PostPreview({
  variante, initials, username, caption,
}: {
  variante: Variante; initials: string; username: string; caption: string;
}) {
  return (
    <DeviceShell>
      <div className="scrollbar-none overflow-y-auto max-h-[680px]">
        {/* IG Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-b border-gray-100/80">
          <Avatar initials={initials} size="sm" />
          <span className="text-[13px] font-semibold text-gray-900 tracking-tight">{username}</span>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </div>
        </div>

        {variante.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <LazyImage src={variante.image_url!} alt="Post" className="aspect-square w-full" eager />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-sm font-light text-gray-400 tracking-wide">Sin imagen</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center px-4 py-2.5">
          <div className="flex gap-4">
            <Heart className="h-[22px] w-[22px] text-gray-900" />
            <MessageCircle className="h-[22px] w-[22px] text-gray-900" />
            <Send className="h-[22px] w-[22px] text-gray-900" />
          </div>
          <div className="ml-auto">
            <Bookmark className="h-[22px] w-[22px] text-gray-900" />
          </div>
        </div>

        <div className="px-4 pb-1">
          <p className="text-[13px] font-semibold text-gray-900">127 Me gusta</p>
        </div>

        {/* Full caption */}
        <div className="px-4 py-2">
          <p className="text-[13px] text-gray-900 whitespace-pre-wrap leading-[1.45]">
            <span className="font-semibold">{username}</span>{" "}{caption}
          </p>
        </div>

        <div className="px-4 pb-5">
          <p className="text-[11px] text-gray-400 tracking-tight">Hace 2 horas</p>
        </div>
      </div>
    </DeviceShell>
  );
}
