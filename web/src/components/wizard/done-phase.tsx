"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DonePhaseProps {
  campaignId: string;
  projectSlug: string;
  campaignName: string;
  slotsCount: number;
}

export function DonePhase({
  campaignId,
  projectSlug,
  campaignName,
  slotsCount,
}: DonePhaseProps) {
  const router = useRouter();
  const campaignUrl = `/projects/${projectSlug}/campaigns/${campaignId}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(campaignUrl);
    }, 4000);
    return () => clearTimeout(timer);
  }, [router, campaignUrl]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-[scale-in_0.3s_ease-out]">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Campana creada exitosamente
        </h2>
        <p className="text-gray-600">
          <span className="font-semibold">{campaignName}</span> tiene{" "}
          <span className="font-semibold text-purple-700">{slotsCount} slots</span>{" "}
          con briefs estrategicos listos.
        </p>
      </div>

      <Button
        onClick={() => router.push(campaignUrl)}
        className="bg-purple-600 hover:bg-purple-700"
      >
        Ver Campana
      </Button>

      <p className="text-xs text-gray-400">
        Redirigiendo automaticamente...
      </p>
    </div>
  );
}
