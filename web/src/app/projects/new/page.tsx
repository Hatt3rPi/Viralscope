import Link from "next/link";
import { createProjectAction } from "@/app/actions";

export default function NewProjectPage() {
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
          <h1 className="text-lg font-bold text-gray-900">Nuevo Proyecto</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form action={createProjectAction} className="space-y-6">
          <div className="bg-white rounded-2xl border border-purple-100 p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del proyecto
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="La Cuenteria"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                placeholder="lacuenteria (se genera automaticamente si se deja vacio)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Se usa en la URL: /projects/slug
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Los archivos de marca (brand.yaml, voice.yaml, etc.) se pueden configurar
            desde la vista del proyecto despues de crearlo.
          </p>

          <div className="flex gap-3">
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Crear Proyecto
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
