import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePerspectivePoll(articleId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: results = {} } = useQuery({
    queryKey: ["poll-results", articleId],
    queryFn: async () => {
      const { data } = await (supabase
        .from("perspective_polls") as any)
        .select("chosen_perspective")
        .eq("article_id", articleId);
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: { chosen_perspective: string }) => {
        map[r.chosen_perspective] = (map[r.chosen_perspective] ?? 0) + 1;
      });
      return map;
    },
  });

  const { data: myChoice = null } = useQuery({
    queryKey: ["my-poll", articleId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase
        .from("perspective_polls") as any)
        .select("chosen_perspective")
        .eq("article_id", articleId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data?.chosen_perspective ?? null;
    },
  });

  const choose = useMutation({
    mutationFn: async (perspectiveId: string) => {
      if (!user) return;
      await (supabase
        .from("perspective_polls") as any)
        .upsert({ user_id: user.id, article_id: articleId, chosen_perspective: perspectiveId },
          { onConflict: "user_id,article_id" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poll-results", articleId] });
      qc.invalidateQueries({ queryKey: ["my-poll", articleId, user?.id] });
    },
  });

  const total = Object.values(results).reduce((a, b) => a + b, 0);

  return { results, myChoice, choose, total };
}
