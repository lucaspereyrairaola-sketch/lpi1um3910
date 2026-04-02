import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/data/mockEvents";
import { useArticles } from "@/hooks/useArticles";
import { useReaderProfile } from "@/hooks/useReaderProfile";
import type { ArticleFeed } from "@/types/article";
import { Clock, User, Layers, Lock, ArrowRight, Settings } from "lucide-react";

// ─── Depth config ─────────────────────────────────────────
// depth values from both Onboarding and Preferences pages
type DepthLevel = "minimal" | "brief" | "full";

function resolveDepth(depth: string | undefined): DepthLevel {
  if (!depth) return "brief";
  if (depth === "headlines" || depth === "quick") return "minimal";
  if (depth === "full" || depth === "deep") return "full";
  return "brief"; // summary / standard
}

function excerptLength(level: DepthLevel, slot: "main" | "q1" | "q2q3" | "q4"): number {
  const map: Record<DepthLevel, Record<string, number>> = {
    minimal: { main: 0,   q1: 0,   q2q3: 0,   q4: 0   },
    brief:   { main: 120, q1: 140, q2q3: 90,  q4: 0   },
    full:    { main: 220, q1: 280, q2q3: 160, q4: 80  },
  };
  return map[level][slot];
}

// ─── Helpers ──────────────────────────────────────────────
const tagColorMap: Record<string, string> = {
  política:      "bg-tag-politics/15 text-tag-politics",
  economía:      "bg-tag-economy/15 text-tag-economy",
  social:        "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech:          "bg-tag-tech/15 text-tag-tech",
  tecnología:    "bg-tag-tech/15 text-tag-tech",
};
const defaultTag = "bg-secondary text-secondary-foreground";

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${tagColorMap[tag.toLowerCase()] ?? defaultTag}`}>
      {tag}
    </span>
  );
}

function getExcerpt(body: string, max: number): string {
  if (max === 0) return "";
  const clean = body.replace(/[#*_`>\[\]]/g, "").trim();
  return clean.length > max ? clean.slice(0, max).trim() + "…" : clean;
}

function PriorityDot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 shrink-0" />;
}

// ─── LEFT COLUMN: main card ───────────────────────────────
function LeftMainCard({
  article,
  depth,
  isPriority,
}: {
  article: ArticleFeed;
  depth: DepthLevel;
  isPriority: boolean;
}) {
  const excerpt = getExcerpt(article.body, excerptLength(depth, "main"));
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;
  const date = article.published_at ?? article.created_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Link to={`/article/${article.id}`} className="block group">
        <div className="bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 flex flex-col gap-3">
          {/* Priority + Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPriority && (
              <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-primary">
                <PriorityDot />Para vos
              </span>
            )}
            {article.tags.slice(0, 2).map((t) => <TagBadge key={t} tag={t} />)}
            {article.access_level !== "free" && (
              <Lock className="w-3 h-3 text-amber-500 ml-auto shrink-0" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h2>

          {/* Excerpt — adapts to depth */}
          {excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/30 mt-auto">
            {hasPerspectives && (
              <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                <Layers className="w-3 h-3" />
                {article.perspectives!.length} perspectivas
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <Clock className="w-3 h-3" />{article.read_time} min
            </span>
            {article.journalist_name && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />{article.journalist_name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── LEFT COLUMN: compact row ─────────────────────────────
function LeftCompactRow({
  article,
  index,
  isPriority,
}: {
  article: ArticleFeed;
  index: number;
  isPriority: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.04 }}
    >
      <Link to={`/article/${article.id}`} className="block group">
        <div className="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/40">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {isPriority && <PriorityDot />}
              {article.tags.slice(0, 1).map((t) => <TagBadge key={t} tag={t} />)}
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {article.title}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0 mt-0.5">
            <Clock className="w-2.5 h-2.5" />{article.read_time}m
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── RIGHT: quadrant card ─────────────────────────────────
type QuadrantSlot = "q1" | "q2q3" | "q4";

function QuadrantCard({
  article,
  depth,
  slot,
  index,
  isPriority,
}: {
  article: ArticleFeed;
  depth: DepthLevel;
  slot: QuadrantSlot;
  index: number;
  isPriority: boolean;
}) {
  const excerpt = getExcerpt(article.body, excerptLength(depth, slot));
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;
  const date = article.published_at ?? article.created_at;

  // Q1 is larger, Q4 is minimal
  const titleSize =
    slot === "q1" ? "text-base font-bold" :
    slot === "q4" ? "text-sm font-semibold" :
    "text-sm font-bold";

  const padding = slot === "q1" ? "p-5" : "p-4";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.07 }}
      className="h-full"
    >
      <Link to={`/article/${article.id}`} className="block group h-full">
        <div className={`bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl ${padding} transition-all duration-300 h-full flex flex-col gap-2.5`}>
          {/* Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPriority && (
              <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-primary">
                <PriorityDot />
              </span>
            )}
            {article.tags.slice(0, slot === "q4" ? 1 : 2).map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
            {hasPerspectives && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary font-medium ml-auto">
                <Layers className="w-3 h-3" />
                {article.perspectives!.length}
              </span>
            )}
            {article.access_level !== "free" && (
              <Lock className="w-3 h-3 text-amber-500 ml-auto" />
            )}
          </div>

          {/* Title */}
          <h3 className={`${titleSize} text-foreground leading-snug group-hover:text-primary transition-colors`}>
            {article.title}
          </h3>

          {/* Excerpt — depth-controlled */}
          {excerpt && (
            <p className={`text-muted-foreground leading-relaxed flex-1 ${slot === "q1" ? "text-sm line-clamp-4" : "text-xs line-clamp-3"}`}>
              {excerpt}
            </p>
          )}

          {/* Footer */}
          {slot !== "q4" && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30 mt-auto">
              {article.journalist_name && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.journalist_name}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />{article.read_time} min
              </span>
            </div>
          )}

          {/* Q4: just read time inline */}
          {slot === "q4" && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-auto">
              <Clock className="w-3 h-3" />{article.read_time} min
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="flex flex-col gap-3">
        <div className="h-56 rounded-2xl bg-secondary/30 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-secondary/20 animate-pulse" />
        ))}
      </div>
      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-secondary/25 animate-pulse"
            style={{ height: i === 0 ? "200px" : "160px" }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────
const ALL_FILTER = "todos";

const Index = () => {
  const { data: articles, isLoading } = useArticles();
  const { data: profile } = useReaderProfile();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const preferredTopics: string[] = useMemo(
    () => (profile?.topics ?? []).map((t) => t.toLowerCase()),
    [profile]
  );

  const depth = resolveDepth(profile?.depth);

  const filterPills = useMemo(() => {
    if (!preferredTopics.length) return [];
    return [ALL_FILTER, ...preferredTopics.slice(0, 6)];
  }, [preferredTopics]);

  const isPriority = (article: ArticleFeed) =>
    preferredTopics.length > 0 &&
    article.tags.some((t) => preferredTopics.includes(t.toLowerCase()));

  const sortedArticles = useMemo(() => {
    if (!articles) return [];
    const filtered =
      activeFilter === ALL_FILTER
        ? articles
        : articles.filter((a) =>
            a.tags.some((t) => t.toLowerCase() === activeFilter)
          );
    const priority = filtered.filter((a) => isPriority(a));
    const rest = filtered.filter((a) => !isPriority(a));
    return [...priority, ...rest];
  }, [articles, activeFilter, preferredTopics]);

  const hasRealArticles = sortedArticles.length > 0;

  // Slot distribution
  const leftMain    = sortedArticles[0];
  const quadrants   = sortedArticles.slice(1, 5);   // Q1, Q2, Q3, Q4
  const leftCompact = sortedArticles.slice(5, 10);  // below main

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {preferredTopics.length > 0 ? "Tu Feed" : "Noticias"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {preferredTopics.length > 0
                ? `${preferredTopics.slice(0, 3).join(", ")} · profundidad ${depth === "minimal" ? "titulares" : depth === "full" ? "completa" : "resumen"}`
                : "Configurá tus preferencias para personalizar este feed"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              <span className="text-xs text-muted-foreground">
                {hasRealArticles ? sortedArticles.length : mockEvents.length} artículos
              </span>
            )}
            <Link
              to="/preferences"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/40 hover:border-border rounded-full px-3 py-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Ajustar
            </Link>
          </div>
        </motion.div>

        {/* ── Topic filter pills ── */}
        {filterPills.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 flex-wrap"
          >
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  activeFilter === pill
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {pill === ALL_FILTER ? "Todos" : pill}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {isLoading && <DashboardSkeleton />}

        {/* ── Dashboard layout ── */}
        {!isLoading && hasRealArticles && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                {/* ── LEFT COLUMN ── */}
                <div className="flex flex-col gap-3">
                  {/* Main story */}
                  {leftMain && (
                    <LeftMainCard
                      article={leftMain}
                      depth={depth}
                      isPriority={isPriority(leftMain)}
                    />
                  )}

                  {/* Compact list */}
                  {leftCompact.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Más noticias
                        </span>
                        <div className="flex-1 h-px bg-border/30" />
                      </div>
                      {leftCompact.map((article, i) => (
                        <LeftCompactRow
                          key={article.id}
                          article={article}
                          index={i}
                          isPriority={isPriority(article)}
                        />
                      ))}
                      {sortedArticles.length > 10 && (
                        <div className="px-3 pt-2">
                          <span className="text-xs text-muted-foreground">
                            +{sortedArticles.length - 10} más
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── RIGHT QUADRANTS (2x2) ── */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 auto-rows-fr">
                  {quadrants[0] && (
                    <QuadrantCard
                      article={quadrants[0]}
                      depth={depth}
                      slot="q1"
                      index={0}
                      isPriority={isPriority(quadrants[0])}
                    />
                  )}
                  {quadrants[1] && (
                    <QuadrantCard
                      article={quadrants[1]}
                      depth={depth}
                      slot="q2q3"
                      index={1}
                      isPriority={isPriority(quadrants[1])}
                    />
                  )}
                  {quadrants[2] && (
                    <QuadrantCard
                      article={quadrants[2]}
                      depth={depth}
                      slot="q2q3"
                      index={2}
                      isPriority={isPriority(quadrants[2])}
                    />
                  )}
                  {quadrants[3] && (
                    <QuadrantCard
                      article={quadrants[3]}
                      depth={depth}
                      slot="q4"
                      index={3}
                      isPriority={isPriority(quadrants[3])}
                    />
                  )}

                  {/* Placeholders if fewer than 4 quadrant articles */}
                  {quadrants.length < 4 &&
                    [...Array(4 - quadrants.length)].map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="rounded-xl border border-dashed border-border/30 flex items-center justify-center p-6"
                      >
                        <p className="text-xs text-muted-foreground text-center">
                          Más artículos<br />pronto
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Empty after filter */}
              {sortedArticles.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-sm">
                  No hay artículos para este tema todavía.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Mock fallback ── */}
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
