import { createClient } from "@/lib/supabase/server";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProgressTypeFilter } from "@/components/ProgressTypeFilter";

const VALID_PROGRESS_TYPES = ["Budgetary", "Tender", "Win", "Loss"] as const;

interface PageProps {
  searchParams: Promise<{ progress_type?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const progressType = params.progress_type;

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(
      `
      id,
      created_at,
      no_quote,
      project_name,
      customer_id,
      value,
      status,
      progress_type,
      prospect,
      created_by,
      created_by_name,
      customers ( name )
    `
    )
    .order("created_at", { ascending: false });

  if (progressType && VALID_PROGRESS_TYPES.includes(progressType as typeof VALID_PROGRESS_TYPES[number])) {
    query = query.eq("progress_type", progressType);
  }

  const { data: projects, error } = await query;

  // Load latest project_update per project for "last update" column
  const projectIds = (projects ?? []).map((p) => p.id);
  const { data: latestUpdates } =
    projectIds.length > 0
      ? await supabase
          .from("project_updates")
          .select("project_id, update_text, created_at")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const latestByProject = new Map<string | number, { update_text: string; created_at: string }>();
  for (const row of latestUpdates ?? []) {
    if (!latestByProject.has(row.project_id)) {
      latestByProject.set(row.project_id, {
        update_text: row.update_text,
        created_at: row.created_at,
      });
    }
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 text-red-700 p-4">
        Gagal memuat data: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <ProgressTypeFilter current={progressType} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <ProjectsTable
          projects={projects ?? []}
          latestUpdates={latestByProject}
        />
      </div>
    </div>
  );
}
