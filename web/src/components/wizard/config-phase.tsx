"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WizardConfig } from "@/lib/types";

interface ConfigPhaseProps {
  onSubmit: (config: WizardConfig) => void;
}

export function ConfigPhase({ onSubmit }: ConfigPhaseProps) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [name, setName] = useState("");
  const [periodStart, setPeriodStart] = useState(
    firstDay.toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = useState(
    lastDay.toISOString().split("T")[0]
  );
  const [platform, setPlatform] = useState("instagram");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      period_start: periodStart,
      period_end: periodEnd,
      platform,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-purple-100 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Nueva Campana
          </h2>
          <p className="text-sm text-gray-500">
            Define los datos basicos. El Estratega te ayudara a disenar el calendario.
          </p>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre de la campana
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Instagram Mayo 2026"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="period_start"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Inicio del periodo
            </label>
            <input
              type="date"
              id="period_start"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="period_end"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fin del periodo
            </label>
            <input
              type="date"
              id="period_end"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Plataforma
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter / X</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          Continuar con el Estratega
        </Button>
      </div>
    </form>
  );
}
