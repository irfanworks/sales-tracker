import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectUpdatesSection } from "@/components/ProjectUpdatesSection";
import type { ProgressType, ProspectType } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-800">Edit Project</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <ProjectForm
          customers={customers ?? []}
          defaultValues={{
            id: project.id,
            no_quote: project.no_quote,
            project_name: project.project_name,
            customer_id: project.customer_id,
            value: project.value,
            progress_type: (project.progress_type as ProgressType) ?? "Budgetary",
            prospect: (project.prospect as ProspectType) ?? "Normal",
            created_by: project.created_by ?? undefined,
          }}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <ProjectUpdatesSection projectId={id} />
      </div>
    </div>
  );
}
