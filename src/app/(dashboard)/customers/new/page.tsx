import { CustomerForm } from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Tambah Customer
      </h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <CustomerForm />
      </div>
    </div>
  );
}
