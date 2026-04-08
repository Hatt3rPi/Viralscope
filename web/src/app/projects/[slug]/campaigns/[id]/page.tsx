import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getCampaign, getSlots } from "@/lib/data";
import { CampaignTabs } from "@/components/campaign/campaign-tabs";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const [project, campaign] = await Promise.all([
    getProject(slug),
    getCampaign(id),
  ]);
  if (!project) notFound();
  if (!campaign) notFound();

  const slots = await getSlots(campaign.id);

  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href={`/projects/${slug}`}
            className="text-purple-600 hover:text-purple-800 active:text-purple-900 active:scale-95 transition-all text-sm"
          >
            &larr; {project.name}
          </Link>
          <h1 className="text-lg font-bold text-gray-900">{campaign.name}</h1>
          <span className="text-sm text-gray-400">
            {campaign.period_start} → {campaign.period_end}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <CampaignTabs
          campaign={campaign}
          slots={slots}
          projectSlug={slug}
          project={project}
        />
      </main>
    </div>
  );
}
