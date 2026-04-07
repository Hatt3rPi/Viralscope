import { getProject } from "@/lib/data";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    redirect("/projects");
  }

  if (project.onboarding_status === "complete") {
    redirect(`/projects/${slug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <OnboardingWizard existingProject={project} />
    </div>
  );
}
