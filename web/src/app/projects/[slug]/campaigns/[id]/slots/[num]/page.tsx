import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProject,
  getCampaign,
  getSlot,
  getBrief,
  getVariantes,
  getFeedback,
  getSimulationData,
} from "@/lib/data";
import { TimelineView } from "@/components/slot/timeline-view";

export default async function SlotPage({
  params,
}: {
  params: Promise<{ slug: string; id: string; num: string }>;
}) {
  const { slug, id, num } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const slot = await getSlot(id, parseInt(num, 10));
  if (!slot) notFound();

  const [brief, variantes, feedbackItems, simulationData] = await Promise.all([
    getBrief(slot.id),
    getVariantes(slot.id),
    getFeedback(slot.id),
    getSimulationData(),
  ]);

  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={`/projects/${slug}/campaigns/${id}`}
              className="text-purple-600 hover:text-purple-800"
            >
              &larr; {campaign.name}
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">
              Slot {String(slot.slot_number).padStart(3, "0")}
            </h1>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {slot.format}
            </span>
            <span className="text-sm text-gray-500">{slot.pillar}</span>
            <span className="text-sm text-gray-400">
              {new Date(slot.date).toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 max-w-3xl">{slot.topic}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <TimelineView
          slot={slot}
          brief={brief}
          variantes={variantes}
          feedbackItems={feedbackItems}
          simulationData={simulationData}
          projectId={project.id}
          campaignId={campaign.id}
        />
      </main>
    </div>
  );
}
