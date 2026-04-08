import Link from "next/link";
import { getProjectsLight } from "@/lib/data";

export default async function ProjectsPage() {
  const projects = await getProjectsLight();

  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">VS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Viralscope</h1>
              <p className="text-xs text-gray-500">Content Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/templates"
              className="text-sm text-purple-600 hover:text-purple-800 active:text-purple-900 active:scale-95 transition-all font-medium"
            >
              Plantillas
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 active:scale-95 transition-all"
            >
              Salir
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Proyectos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <div className="bg-white rounded-2xl border border-purple-100 p-6 hover:shadow-lg hover:border-purple-300 transition-all group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <span className="text-purple-600 text-xl font-bold">
                    {project.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {(project.brand_yaml as Record<string, string>).tagline ||
                    ""}
                </p>
              </div>
            </Link>
          ))}

          {/* Add project card */}
          <Link href="/projects/new">
            <div className="bg-white/50 rounded-2xl border-2 border-dashed border-purple-200 p-6 flex flex-col items-center justify-center text-purple-400 hover:border-purple-400 hover:text-purple-600 transition-colors cursor-pointer min-h-[180px]">
              <span className="text-4xl mb-2">+</span>
              <span className="text-sm font-medium">Nuevo proyecto</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
