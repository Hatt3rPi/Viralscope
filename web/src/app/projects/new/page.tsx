import Link from "next/link";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

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
          <h1 className="text-lg font-bold text-gray-900">Nueva Marca</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <OnboardingWizard />
      </main>
    </div>
  );
}
