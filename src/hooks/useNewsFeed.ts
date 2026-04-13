import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ArticleFeed } from "@/types/article";

function estimateReadTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Transforma un registro de news_feed al mismo tipo ArticleFeed que usan los hooks de articles */
function mapNewsFeedItem(row: Record<string, unknown>): ArticleFeed {
  const body = (row.body as string) ?? "";
  return {
    id: `news:${row.id as string}`,          // prefijo para distinguirlo en routing
    title: row.title as string,
    body,
    tags: (row.tags as string[]) ?? [],
    access_level: "free",
    published_at: row.published_at as string,
    created_at: row.created_at as string,
    journalist_id: null as unknown as string, // no aplica
    journalist_name: row.source_name as string,
    read_time: estimateReadTime(body),
    perspectives: (row.perspectives as ArticleFeed["perspectives"]) ?? null,
    // campos extra de news_feed
    source_url: row.source_url as string,
    source_id: row.source_id as string,
    source_name: row.source_name as string,
    summary: row.summary as string,
  };
}

export function useNewsFeed(limit = 30) {
  return useQuery<ArticleFeed[]>({
    queryKey: ["news_feed", limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("news_feed")
        .select("id, title, summary, body, tags, source_url, source_id, source_name, published_at, created_at, perspectives")
        .eq("status", "done")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map(mapNewsFeedItem);
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useNewsFeedArticle(rawId: string) {
  // rawId puede ser "news:uuid" o solo "uuid"
  const id = rawId.startsWith("news:") ? rawId.slice(5) : rawId;

  return useQuery<ArticleFeed | null>({
    queryKey: ["news_feed_article", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("news_feed")
        .select("id, title, summary, body, tags, source_url, source_id, source_name, published_at, created_at, perspectives")
        .eq("id", id)
        .eq("status", "done")
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return mapNewsFeedItem(data);
    },
    enabled: !!id,
  });
}
