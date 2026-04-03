import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useReadingHistory() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ["reading-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("reading_history")
        .select("article_id, progress, last_read, articles(*)")
        .eq("user_id", user!.id)
        .order("last_read", { ascending: false })
        .limit(20);
      return (data ?? []).map((r: any) => ({
        ...r.articles,
        progress: r.progress,
        lastRead: r.last_read,
      }));
    },
  });

  const trackProgress = useMutation({
    mutationFn: async ({ articleId, progress }: { articleId: string; progress: number }) => {
      if (!user || progress < 5) return; // ignore tiny reads
      await supabase
        .from("reading_history")
        .upsert(
          { user_id: user.id, article_id: articleId, progress, last_read: new Date().toISOString() },
          { onConflict: "user_id,article_id" }
        );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reading-history", user?.id] }),
  });

  return { history, trackProgress };
}
