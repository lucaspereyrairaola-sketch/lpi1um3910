import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useJournalistMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["journalist-metrics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get journalist's articles
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, perspectives")
        .eq("journalist_id", user!.id);

      if (!articles || articles.length === 0) return { totalArticles: 0, totalVotes: 0, totalSaved: 0, topPerspective: null, articles: [] };

      const articleIds = articles.map(a => a.id);

      // Votes across all articles
      const { data: votes } = await supabase
        .from("perspective_votes")
        .select("article_id, perspective_id, vote")
        .in("article_id", articleIds);

      // Saved count
      const { data: saved } = await supabase
        .from("saved_articles")
        .select("article_id")
        .in("article_id", articleIds);

      // Aggregate votes by perspective
      const perspectiveCounts: Record<string, number> = {};
      (votes ?? []).forEach((v: any) => {
        if (v.vote === 1) perspectiveCounts[v.perspective_id] = (perspectiveCounts[v.perspective_id] ?? 0) + 1;
      });
      const topPerspective = Object.entries(perspectiveCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      // Per-article stats
      const enriched = articles.map(a => ({
        ...a,
        upvotes: (votes ?? []).filter((v: any) => v.article_id === a.id && v.vote === 1).length,
        savedCount: (saved ?? []).filter((s: any) => s.article_id === a.id).length,
      }));

      return {
        totalArticles: articles.length,
        totalVotes: (votes ?? []).filter((v: any) => v.vote === 1).length,
        totalSaved: (saved ?? []).length,
        topPerspective,
        articles: enriched,
      };
    },
  });
}
