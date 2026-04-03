import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function useBookmarks() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: savedIds = [] } = useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_articles")
        .select("article_id")
        .eq("user_id", user!.id);
      return (data ?? []).map((r: { article_id: string }) => r.article_id);
    },
  });

  const toggle = useMutation({
    mutationFn: async (articleId: string) => {
      if (savedIds.includes(articleId)) {
        await supabase
          .from("saved_articles")
          .delete()
          .eq("user_id", user!.id)
          .eq("article_id", articleId);
      } else {
        await supabase
          .from("saved_articles")
          .insert({ user_id: user!.id, article_id: articleId });
      }
    },
    onSuccess: (_data, articleId) => {
      const isSaved = savedIds.includes(articleId);
      toast({
        title: isSaved ? "Artículo eliminado de guardados" : "Artículo guardado",
        description: isSaved ? "" : "Lo encontrás en la sección Guardados",
      });
      qc.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
      qc.invalidateQueries({ queryKey: ["saved-articles", user?.id] });
    },
  });

  return { savedIds, toggle, isSaved: (id: string) => savedIds.includes(id) };
}

export function useSavedArticles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-articles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_articles")
        .select("article_id, saved_at, articles(*)")
        .eq("user_id", user!.id)
        .order("saved_at", { ascending: false });
      return (data ?? []).map((r: any) => ({ ...r.articles, savedAt: r.saved_at }));
    },
  });
}
