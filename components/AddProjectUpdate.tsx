"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

export function AddProjectUpdate({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("project_updates").insert({
      project_id: projectId,
      content: content.trim(),
      created_by: user?.id ?? null,
    });
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    await supabase
      .from("projects")
      .update({ weekly_update: content.trim() })
      .eq("id", projectId);
    setContent("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="input-field min-h-[80px] resize-y"
        placeholder="Add a progress update..."
        rows={3}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary gap-2" disabled={loading || !content.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Add update
      </button>
    </form>
  );
}
