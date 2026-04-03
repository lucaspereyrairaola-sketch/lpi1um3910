import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePerspectiveVotes(articleId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: counts = {} } = useQuery({
    queryKey: ["perspective-vote-counts", articleId],
    queryFn: async () => {
      const { data } = await (supabase
        .from("perspective_votes") as any)
        .select("perspective_id, vote")
        .eq("article_id", articleId);
      const map: Record<string, { up: number; down: number }> = {};
      (data ?? []).forEach((r: { perspective_id: string; vote: number }) => {
        if (!map[r.perspective_id]) map[r.perspective_id] = { up: 0, down: 0 };
        if (r.vote === 1) map[r.perspective_id].up++;
        else map[r.perspective_id].down++;
      });
      return map;
    },
  });

  const { data: myVotes = {} } = useQuery({
    queryKey: ["my-perspective-votes", articleId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase
        .from("perspective_votes") as any)
        .select("perspective_id, vote")
        .eq("article_id", articleId)
        .eq("user_id", user!.id);
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: { perspective_id: string; vote: number }) => {
        map[r.perspective_id] = r.vote;
      });
      return map;
    },
  });

  const vote = useMutation({
    mutationFn: async ({ perspectiveId, value }: { perspectiveId: string; value: 1 | -1 }) => {
      if (!user) return;
      const existing = myVotes[perspectiveId];
      if (existing === value) {
        await (supabase
          .from("perspective_votes") as any)
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", articleId)
          .eq("perspective_id", perspectiveId);
      } else {
        await (supabase
          .from("perspective_votes") as any)
          .upsert({ user_id: user.id, article_id: articleId, perspective_id: perspectiveId, vote: value },
            { onConflict: "user_id,article_id,perspective_id" });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["perspective-vote-counts", articleId] });
      qc.invalidateQueries({ queryKey: ["my-perspective-votes", articleId, user?.id] });
    },
  });

  return { counts, myVotes, vote };
}
