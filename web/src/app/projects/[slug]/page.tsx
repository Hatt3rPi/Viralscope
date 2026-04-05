import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getCampaigns } from "@/lib/data";
import { ProjectTabs } from "@/components/project/project-tabs";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const campaigns = await getCampaigns(project.id);

  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/projects"
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            &larr; Proyectos
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {project.name.charAt(0)}
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">{project.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <ProjectTabs
          project={project}
          campaigns={campaigns}
          slug={slug}
        />
      </main>
    </div>
  );
}
