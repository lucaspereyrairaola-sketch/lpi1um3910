import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/data/mockEvents";
import { useArticles } from "@/hooks/useArticles";
import { useReaderProfile } from "@/hooks/useReaderProfile";
import type { ArticleFeed } from "@/types/article";

const ALL_FILTER = "todos";

const Index = () => {
  const { data: articles, isLoading } = useArticles();
  const { data: profile } = useReaderProfile();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const preferredTopics: string[] = useMemo(
    () => (profile?.topics ?? []).map((t) => t.toLowerCase()),
    [profile]
  );

  // Build filter pills from user's preferred topics + "Todos"
  const filterPills = useMemo(() => {
    if (!preferredTopics.length) return [];
    return [ALL_FILTER, ...preferredTopics];
  }, [preferredTopics]);

  const isPriority = (article: ArticleFeed) =>
    preferredTopics.length > 0 &&
    article.tags.some((t) => preferredTopics.includes(t.toLowerCase()));

  // Sort: priority articles first, then filter by active topic
  const sortedArticles = useMemo(() => {
    if (!articles) return [];
    const filtered =
      activeFilter === ALL_FILTER
        ? articles
        : articles.filter((a) =>
            a.tags.some((t) => t.toLowerCase() === activeFilter)
          );

    // Priority articles first
    const priority = filtered.filter((a) => isPriority(a));
    const rest = filtered.filter((a) => !isPriority(a));
    return [...priority, ...rest];
  }, [articles, activeFilter, preferredTopics]);

  const hasRealArticles = sortedArticles.length > 0;

  // Bento slots
  const featured = sortedArticles[0];
  const sidebarArticles = sortedArticles.slice(1, 3);
  const mediumArticles = sortedArticles.slice(3, 6);
  const compactArticles = sortedArticles.slice(6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {preferredTopics.length > 0 ? "Tu Feed" : "Últimas noticias"}
            </h1>
            {preferredTopics.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Personalizado según tus preferencias
              </p>
            )}
          </div>
          {!isLoading && (
            <span className="text-xs text-muted-foreground">
              {hasRealArticles ? sortedArticles.length : mockEvents.length} artículos
            </span>
          )}
        </motion.div>

        {/* Topic filter pills */}
        {filterPills.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex gap-2 mb-8 flex-wrap"
          >
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  activeFilter === pill
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {pill === ALL_FILTER ? "Todos" : pill}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-64 rounded-2xl bg-secondary/30 animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-secondary/30 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Real articles — bento grid */}
        {!isLoading && hasRealArticles && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Row 1: Featured + Sidebar */}
              {featured && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <ArticleCard
                      article={featured}
                      index={0}
                      size="featured"
                      isPriority={isPriority(featured)}
                    />
                  </div>

                  {sidebarArticles.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {sidebarArticles.map((article, i) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          index={i + 1}
                          size="medium"
                          isPriority={isPriority(article)}
                          className="flex-1"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Row 2: Medium cards */}
              {mediumArticles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {mediumArticles.map((article, i) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      index={i + 3}
                      size="medium"
                      isPriority={isPriority(article)}
                    />
                  ))}
                </div>
              )}

              {/* Row 3+: Compact list */}
              {compactArticles.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-border/40" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Más noticias</span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {compactArticles.map((article, i) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        index={i + 6}
                        size="compact"
                        isPriority={isPriority(article)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state after filter */}
              {sortedArticles.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-sm">
                  No hay artículos para este tema todavía.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Mock events fallback */}
        {!isLoading && !hasRealArticles && (
          <div className="space-y-4">
            {mockEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
