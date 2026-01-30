"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Lock } from "lucide-react";
import { validateStrongPassword } from "@/lib/password";

export default function SettingsPage() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  const [displayNameSuccess, setDisplayNameSuccess] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const name =
        profile?.full_name?.trim() ||
        (user.user_metadata?.full_name as string)?.trim() ||
        "";
      setDisplayName(name);
    }
    load();
  }, []);

  async function handleDisplayNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDisplayNameError(null);
    setDisplayNameSuccess(false);
    setDisplayNameLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda belum login.");

      await supabase.auth.updateUser({
        data: { full_name: displayName.trim() || undefined },
      });
      await supabase
        .from("profiles")
        .update({ full_name: displayName.trim() || null })
        .eq("id", user.id);

      setDisplayNameSuccess(true);
    } catch (err: unknown) {
      setDisplayNameError(
        err instanceof Error ? err.message : "Gagal menyimpan nama."
      );
    } finally {
      setDisplayNameLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    const validation = validateStrongPassword(newPassword);
    if (!validation.valid) {
      setPasswordError(
        "Password lemah: " + validation.errors.join(", ").toLowerCase()
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Password dan konfirmasi tidak sama.");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : "Gagal mengganti password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-800">Pengaturan</h1>

      {/* Display Name */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
          <User className="h-5 w-5" />
          Nama Tampilan (Display Name)
        </h2>
        <form onSubmit={handleDisplayNameSubmit} className="space-y-4">
          {displayNameError && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {displayNameError}
            </div>
          )}
          {displayNameSuccess && (
            <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
              Nama berhasil disimpan.
            </div>
          )}
          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Nama
            </label>
            <input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nama Anda"
            />
          </div>
          <button
            type="submit"
            disabled={displayNameLoading}
            className="flex items-center gap-2 rounded-lg bg-primary-700 text-white py-2.5 px-5 font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {displayNameLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan Nama
          </button>
        </form>
      </section>

      {/* Ganti Password */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
          <Lock className="h-5 w-5" />
          Ganti Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
              Password berhasil diganti.
            </div>
          )}
          <p className="text-sm text-slate-600">
            Password minimal 8 karakter, dengan huruf besar, huruf kecil, angka,
            dan karakter spesial.
          </p>
          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Password Baru
            </label>
            <input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Konfirmasi Password Baru
            </label>
            <input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 rounded-lg bg-primary-700 text-white py-2.5 px-5 font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Ganti Password
          </button>
        </form>
      </section>
    </div>
  );
}
