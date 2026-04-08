"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  Project,
  Campaign,
  ContentTemplate,
  ProjectTemplate,
  BrandAsset,
  VisualSpec,
} from "@/lib/types";
import { YamlRenderer } from "./yaml-renderer";
import { BrandAssetsTab } from "./brand-assets-tab";
import { VisualSpecsTab } from "./visual-specs-tab";
import { TemplatesTab } from "./templates-tab";

const TABS = [
  { id: "brand", label: "Brand" },
  { id: "voice", label: "Voice" },
  { id: "audience", label: "Audience" },
  { id: "pillars", label: "Pillars" },
  { id: "competitors", label: "Competitors" },
  { id: "assets", label: "Assets" },
  { id: "visual-specs", label: "Visual Specs" },
  { id: "templates", label: "Templates" },
  { id: "campaigns", label: "Campaigns" },
] as const;

export function ProjectTabs({
  project,
  campaigns,
  slug,
  allTemplates = [],
  projectTemplates = [],
  brandAssets = [],
  visualSpecs = [],
}: {
  project: Project;
  campaigns: Campaign[];
  slug: string;
  allTemplates?: ContentTemplate[];
  projectTemplates?: (ProjectTemplate & { template?: ContentTemplate })[];
  brandAssets?: BrandAsset[];
  visualSpecs?: VisualSpec[];
}) {
  const [activeTab, setActiveTab] = useState<string>("brand");

  const tabData: Record<string, Record<string, unknown>> = {
    brand: project.brand_yaml,
    voice: project.voice_yaml,
    audience: project.audiences_yaml,
    pillars: project.pillars_yaml,
    competitors: project.competitors_yaml,
  };

  return (
    <div>
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-purple-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "assets" ? (
        <div className="bg-white rounded-xl border border-purple-100 p-6">
          <BrandAssetsTab projectId={project.id} initialAssets={brandAssets} />
        </div>
      ) : activeTab === "visual-specs" ? (
        <div className="bg-white rounded-xl border border-purple-100 p-6">
          <VisualSpecsTab
            projectId={project.id}
            initialSpecs={visualSpecs}
            brandAssets={brandAssets}
          />
        </div>
      ) : activeTab === "templates" ? (
        <div className="bg-white rounded-xl border border-purple-100 p-6">
          <TemplatesTab
            projectId={project.id}
            allTemplates={allTemplates}
            initialProjectTemplates={projectTemplates}
          />
        </div>
      ) : activeTab === "campaigns" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Campañas</h3>
            <Link
              href={`/projects/${slug}/campaigns/new`}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + Nueva Campana
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-gray-500">No hay campañas aún.</p>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/projects/${slug}/campaigns/${campaign.id}`}
                >
                  <div className="bg-white rounded-xl border border-purple-100 p-5 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {campaign.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {campaign.platform} &middot; {campaign.period_start}{" "}
                          → {campaign.period_end}
                        </p>
                      </div>
                      <span className="text-purple-600 text-lg">&rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-purple-100 p-6">
          <YamlRenderer
            data={tabData[activeTab] || {}}
            title={TABS.find((t) => t.id === activeTab)?.label || ""}
          />
        </div>
      )}
    </div>
  );
}
