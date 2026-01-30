"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password dan konfirmasi tidak sama.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700">
          Password baru
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">
          Konfirmasi password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Password berhasil diubah.</p>}
      <button type="submit" className="btn-primary gap-2" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Ganti Password
      </button>
    </form>
  );
}
