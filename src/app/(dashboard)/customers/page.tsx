import { createClient } from "@/lib/supabase/server";
import { CustomersTable } from "@/components/CustomersTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, sector, created_at")
    .order("name");

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
        <h1 className="text-2xl font-semibold text-slate-800">Customers</h1>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-700 text-white py-2.5 px-4 font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Tambah Customer
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <CustomersTable customers={customers ?? []} />
      </div>
    </div>
  );
}
