import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/ProjectForm";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Project Baru</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <ProjectForm customers={customers ?? []} />
      </div>
    </div>
  );
}
