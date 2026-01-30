import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name?.trim() ||
    (user.user_metadata?.full_name as string)?.trim() ||
    null;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav
        userEmail={user.email ?? ""}
        userDisplayName={displayName}
        role={profile?.role ?? "sales"}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
