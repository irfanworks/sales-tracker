"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

interface Profile {
  role: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
}

export function Header({ user, profile }: { user: AuthUser; profile?: Profile }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName = profile?.display_name || profile?.full_name || profile?.email || user.email || "User";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-14 items-center justify-between px-4 lg:px-8">
        <h1 className="text-lg font-semibold text-slate-800">Sales Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-slate-600">
            <User className="h-4 w-4" />
            {displayName}
            {profile?.role && (
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                {profile.role}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="btn-secondary gap-2 text-slate-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
