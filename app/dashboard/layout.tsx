import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/DashboardNav";
import { Header } from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, display_name, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} profile={profile ?? undefined} />
      <div className="flex">
        <DashboardNav role={profile?.role ?? "sales"} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
