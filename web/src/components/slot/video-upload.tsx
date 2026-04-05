"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface VideoUploadProps {
  varianteId: string;
  currentVideoUrl: string | null;
  onUpload: (url: string) => void;
}

export function VideoUpload({
  varianteId,
  currentVideoUrl,
  onUpload,
}: VideoUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(
    currentVideoUrl
  );

  function handleFile(file: File) {
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    onUpload(objectUrl);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (videoUrl) {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <video src={videoUrl} controls className="w-full" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setVideoUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        >
          Cambiar video
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          data-variante-id={varianteId}
          onChange={handleFileSelect}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-purple-400 hover:bg-purple-50"
    >
      <Upload className="mb-2 h-8 w-8 text-gray-400" />
      <p className="text-sm text-gray-500">
        Arrastra tu video aquí o haz clic para seleccionar
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        data-variante-id={varianteId}
        onChange={handleFileSelect}
      />
    </div>
  );
}
