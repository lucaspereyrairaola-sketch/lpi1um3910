import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ArticleFeed } from "@/types/article";

function estimateReadTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function useArticles() {
  return useQuery<ArticleFeed[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data: articles, error } = await supabase
        .from("articles")
        .select("id, title, body, tags, access_level, published_at, created_at, journalist_id, perspectives")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!articles || articles.length === 0) return [];

      const journalistIds = [...new Set(articles.map((a) => a.journalist_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", journalistIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) ?? []);

      return articles.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body ?? "",
        tags: a.tags ?? [],
        access_level: a.access_level,
        published_at: a.published_at,
        created_at: a.created_at,
        journalist_id: a.journalist_id,
        journalist_name: profileMap.get(a.journalist_id) ?? null,
        read_time: estimateReadTime(a.body ?? ""),
        perspectives: (a as any).perspectives ?? null,
      }));
    },
  });
}

export function useArticle(id: string) {
  return useQuery<ArticleFeed | null>({
    queryKey: ["article", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, body, tags, access_level, published_at, created_at, journalist_id, perspectives")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.journalist_id)
        .maybeSingle();

      return {
        id: data.id,
        title: data.title,
        body: data.body ?? "",
        tags: data.tags ?? [],
        access_level: data.access_level,
        published_at: data.published_at,
        created_at: data.created_at,
        journalist_id: data.journalist_id,
        journalist_name: profile?.display_name ?? null,
        read_time: estimateReadTime(data.body ?? ""),
        perspectives: (data as any).perspectives ?? null,
      };
    },
    enabled: !!id,
  });
}
