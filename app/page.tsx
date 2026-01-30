import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">Sales Tracker</h1>
        <p className="text-slate-600">Sign in to manage projects and customers.</p>
        <Link
          href="/login"
          className="btn-primary inline-flex w-full items-center justify-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </div>
    </div>
  );
}
