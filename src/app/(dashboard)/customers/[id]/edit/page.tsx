import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/CustomerForm";
import type { CustomerSector } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, name, sector")
    .eq("id", id)
    .single();

  if (error || !customer) {
    notFound();
  }

  const { data: pics } = await supabase
    .from("customer_pics")
    .select("id, customer_id, nama_pic, email, no_hp, jabatan")
    .eq("customer_id", id)
    .order("created_at");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Edit Customer</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <CustomerForm
          defaultValues={{
            id: customer.id,
            name: customer.name,
            sector: (customer.sector as CustomerSector) ?? "Commercial",
          }}
          initialPics={pics ?? []}
        />
      </div>
    </div>
  );
}
