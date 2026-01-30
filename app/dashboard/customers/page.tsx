import { createClient } from "@/lib/supabase/server";
import { CustomersTable } from "@/components/CustomersTable";
import { AddCustomerForm } from "@/components/AddCustomerForm";
import { Users } from "lucide-react";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      id,
      name,
      sector,
      created_at,
      customer_pics ( id, nama, email, no_hp, jabatan )
    `)
    .order("name");

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-red-600">Error loading customers: {error.message}</p>
      </div>
    );
  }

  const normalized = (customers ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    sector: c.sector,
    created_at: c.created_at,
    pics: Array.isArray(c.customer_pics) ? c.customer_pics : [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Customers</h1>
          <p className="mt-1 text-slate-600">Master data customer. Sector & PIC optional.</p>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
          <Users className="h-5 w-5" />
          Add customer
        </h2>
        <AddCustomerForm />
      </div>
      <div className="card overflow-hidden">
        <CustomersTable customers={normalized} />
      </div>
    </div>
  );
}
