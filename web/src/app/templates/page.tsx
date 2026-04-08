import Link from "next/link";
import { getAllContentTemplates } from "@/lib/data";
import { TemplatesManager } from "./templates-manager";

export default async function TemplatesPage() {
  const templates = await getAllContentTemplates();

  return (
    <div className="min-h-screen bg-[#F7F0FF]">
      <header className="bg-white border-b border-purple-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              &larr; Proyectos
            </Link>
            <h1 className="text-lg font-bold text-gray-900">
              Templates de Contenido
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <TemplatesManager initialTemplates={templates} />
      </main>
    </div>
  );
}
