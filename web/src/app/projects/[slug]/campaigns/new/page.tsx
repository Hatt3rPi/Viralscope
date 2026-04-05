import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/data";
import { createCampaignAction } from "@/app/actions";

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
            <h2 className="text-lg font-semibold text-gray-900">Proyecto de demostración</h2>
            <p className="text-sm text-gray-600">
              Este proyecto es datos de demostración y no está guardado en la base de datos.
              Para crear campañas, primero crea un proyecto nuevo desde{" "}
              <Link href="/projects/new" className="text-purple-600 underline">aqui</Link>.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Default period: current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const defaultStart = firstDay.toISOString().split("T")[0];
  const defaultEnd = lastDay.toISOString().split("T")[0];

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
          <h1 className="text-lg font-bold text-gray-900">Nueva Campana</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form action={createCampaignAction} className="space-y-6">
          <input type="hidden" name="project_id" value={project.id} />
          <input type="hidden" name="project_slug" value={slug} />

          <div className="bg-white rounded-2xl border border-purple-100 p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la campana
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Instagram Mayo 2026"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="period_start" className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio del periodo
                </label>
                <input
                  type="date"
                  id="period_start"
                  name="period_start"
                  required
                  defaultValue={defaultStart}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="period_end" className="block text-sm font-medium text-gray-700 mb-1">
                  Fin del periodo
                </label>
                <input
                  type="date"
                  id="period_end"
                  name="period_end"
                  required
                  defaultValue={defaultEnd}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                Plataforma
              </label>
              <select
                id="platform"
                name="platform"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter / X</option>
              </select>
            </div>

            <div>
              <label htmlFor="num_slots" className="block text-sm font-medium text-gray-700 mb-1">
                Numero de contenidos (slots)
              </label>
              <input
                type="number"
                id="num_slots"
                name="num_slots"
                min="0"
                max="60"
                defaultValue="30"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Se crearan slots vacios distribuidos en el periodo. Puedes dejar 0 para crear slots manualmente.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/projects/${slug}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Crear Campana
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
