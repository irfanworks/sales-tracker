"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

interface ProjectRow {
  id: string;
  created_at: string;
  no_quote: string;
  project_name: string;
  customer_id: string;
  value: number;
  progress_type: string;
  prospect: string;
  weekly_update: string | null;
  sales_id: string;
  customer?: { id: string; name: string };
  sales_name?: string | null;
}

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  if (projects.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        No projects yet.{" "}
        <Link href="/dashboard/projects/new" className="text-cyan-700 hover:underline">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-4 py-3 font-medium text-slate-700">No Quote</th>
            <th className="px-4 py-3 font-medium text-slate-700">Project</th>
            <th className="px-4 py-3 font-medium text-slate-700">Customer</th>
            <th className="px-4 py-3 font-medium text-slate-700">Value</th>
            <th className="px-4 py-3 font-medium text-slate-700">Progress</th>
            <th className="px-4 py-3 font-medium text-slate-700">Prospect</th>
            <th className="px-4 py-3 font-medium text-slate-700">Sales</th>
            <th className="px-4 py-3 font-medium text-slate-700">Date</th>
            <th className="px-4 py-3 font-medium text-slate-700"></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-mono text-slate-700">{p.no_quote}</td>
              <td className="px-4 py-3 text-slate-800">{p.project_name}</td>
              <td className="px-4 py-3 text-slate-600">{p.customer?.name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(p.value)}
              </td>
              <td className="px-4 py-3">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                  {p.progress_type}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{p.prospect}</td>
              <td className="px-4 py-3 text-slate-600">{p.sales_name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-500">
                {format(new Date(p.created_at), "dd MMM yyyy")}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="inline-flex items-center gap-1 text-cyan-700 hover:underline"
                >
                  View <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
