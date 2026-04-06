import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data";
import { CampaignWizard } from "@/components/wizard/campaign-wizard";

export default async function NewCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  // Check if this project exists in Supabase (UUID format) vs seed data
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);
  if (!isUUID) {
    return (
      <div className="min-h-screen bg-[#F7F0FF]">
        <header className="bg-white border-b border-purple-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Link href={`/projects/${slug}`} className="text-purple-600 hover:text-purple-800 text-sm">
              &larr; {project.name}
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-amber-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Proyecto de demostracion</h2>
            <p className="text-sm text-gray-600">
              Este proyecto es datos de demostracion y no esta guardado en la base de datos.
              Para crear campanas, primero crea un proyecto nuevo desde{" "}
              <Link href="/projects/new" className="text-purple-600 underline">aqui</Link>.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href={`/projects/${slug}`}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            &larr; {project.name}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <CampaignWizard project={project} projectSlug={slug} />
      </main>
    </div>
  );
}
