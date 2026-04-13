import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { EconTicker } from "@/components/EconTicker";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/data/mockEvents";
import { useArticles } from "@/hooks/useArticles";
import { useReaderProfile } from "@/hooks/useReaderProfile";
import { useSavedArticles } from "@/hooks/useBookmarks";
import type { ArticleFeed } from "@/types/article";
import {
  Clock, User, Layers, Lock, Settings,
  Sparkles, Hash, Users, AlarmClock, PenTool, Bookmark, History,
} from "lucide-react";
import { useReadingHistory } from "@/hooks/useReadingHistory";

// ─── Types ────────────────────────────────────────────────
type Section   = "foryou" | "topics" | "authors" | "recent" | "saved" | "history";
type DepthLevel = "minimal" | "brief" | "full";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "foryou",  label: "Para vos",  icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "topics",  label: "Temas",     icon: <Hash className="w-3.5 h-3.5" /> },
  { id: "authors", label: "Autores",   icon: <Users className="w-3.5 h-3.5" /> },
  { id: "recent",  label: "Recientes", icon: <AlarmClock className="w-3.5 h-3.5" /> },
  { id: "saved",   label: "Guardados", icon: <Bookmark className="w-3.5 h-3.5" /> },
  { id: "history", label: "Historial", icon: <History className="w-3.5 h-3.5" /> },
];

// ─── Depth config ─────────────────────────────────────────
function resolveDepth(depth: string | undefined): DepthLevel {
  if (!depth) return "brief";
  if (depth === "headlines" || depth === "quick") return "minimal";
  if (depth === "full"      || depth === "deep")  return "full";
  return "brief";
}

function excerptLength(level: DepthLevel, slot: "main" | "q1" | "q2q3" | "q4"): number {
  const map: Record<DepthLevel, Record<string, number>> = {
    minimal: { main: 0,   q1: 0,   q2q3: 0,  q4: 0  },
    brief:   { main: 120, q1: 140, q2q3: 90, q4: 0  },
    full:    { main: 220, q1: 280, q2q3: 160, q4: 80 },
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

function TagBadge({ tag, size = "sm" }: { tag: string; size?: "sm" | "md" }) {
  const base = size === "md"
    ? "text-xs font-semibold px-3 py-1 rounded-full capitalize"
    : "text-xs font-medium px-2 py-0.5 rounded-full capitalize";
  return (
    <span className={`${base} ${tagColorMap[tag.toLowerCase()] ?? defaultTag}`}>
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

// ─── Card: left column main ───────────────────────────────
function LeftMainCard({ article, depth, isPriority }: { article: ArticleFeed; depth: DepthLevel; isPriority: boolean }) {
  const excerpt = getExcerpt(article.body, excerptLength(depth, "main"));
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link to={`/article/${article.id}`} className="block group">
        <div className="bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isPriority && <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-primary"><PriorityDot />Para vos</span>}
            {article.tags.slice(0, 2).map((t) => <TagBadge key={t} tag={t} />)}
            {article.access_level !== "free" && <Lock className="w-3 h-3 text-amber-500 ml-auto shrink-0" />}
          </div>
          <h2 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          {excerpt && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{excerpt}</p>}
          <div className="flex items-center gap-2 pt-1 border-t border-border/30 mt-auto">
            {hasPerspectives && (
              <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                <Layers className="w-3 h-3" />{article.perspectives!.length} perspectivas
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

// ─── Card: left compact row ───────────────────────────────
function LeftCompactRow({ article, index, isPriority }: { article: ArticleFeed; index: number; isPriority: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 + index * 0.04 }}>
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

// ─── Card: quadrant ───────────────────────────────────────
type QuadrantSlot = "q1" | "q2q3" | "q4";

function QuadrantCard({ article, depth, slot, index, isPriority }: { article: ArticleFeed; depth: DepthLevel; slot: QuadrantSlot; index: number; isPriority: boolean }) {
  const excerpt = getExcerpt(article.body, excerptLength(depth, slot));
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;
  const titleSize = slot === "q1" ? "text-base font-bold" : slot === "q4" ? "text-sm font-semibold" : "text-sm font-bold";
  const padding   = slot === "q1" ? "p-5" : "p-4";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 + index * 0.07 }} className="h-full">
      <Link to={`/article/${article.id}`} className="block group h-full">
        <div className={`bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl ${padding} transition-all duration-300 h-full flex flex-col gap-2.5`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPriority && <PriorityDot />}
            {article.tags.slice(0, slot === "q4" ? 1 : 2).map((t) => <TagBadge key={t} tag={t} />)}
            {hasPerspectives && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary font-medium ml-auto">
                <Layers className="w-3 h-3" />{article.perspectives!.length}
              </span>
            )}
            {article.access_level !== "free" && <Lock className="w-3 h-3 text-amber-500 ml-auto" />}
          </div>
          <h3 className={`${titleSize} text-foreground leading-snug group-hover:text-primary transition-colors`}>{article.title}</h3>
          {excerpt && <p className={`text-muted-foreground leading-relaxed flex-1 ${slot === "q1" ? "text-sm line-clamp-4" : "text-xs line-clamp-3"}`}>{excerpt}</p>}
          {slot !== "q4" && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30 mt-auto">
              {article.journalist_name && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{article.journalist_name}</span>}
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{article.read_time} min</span>
            </div>
          )}
          {slot === "q4" && <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-auto"><Clock className="w-3 h-3" />{article.read_time} min</span>}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="flex flex-col gap-3">
        <div className="h-56 rounded-2xl bg-secondary/30 animate-pulse" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-secondary/20 animate-pulse" />)}
      </div>
      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-secondary/25 animate-pulse" style={{ height: i === 0 ? "200px" : "160px" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Section: Para vos (bento) ────────────────────────────
function ForYouSection({ articles, depth, isPriority }: { articles: ArticleFeed[]; depth: DepthLevel; isPriority: (a: ArticleFeed) => boolean }) {
  const leftMain    = articles[0];
  const quadrants   = articles.slice(1, 5);
  const leftCompact = articles.slice(5, 10);

  if (articles.length === 0) return <EmptyState message="No hay artículos para tus temas todavía." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      {/* Left column */}
      <div className="flex flex-col gap-3">
        {leftMain && <LeftMainCard article={leftMain} depth={depth} isPriority={isPriority(leftMain)} />}
        {leftCompact.length > 0 && (
          <div>
            <div className="flex items-center gap-2 px-3 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Más noticias</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            {leftCompact.map((a, i) => <LeftCompactRow key={a.id} article={a} index={i} isPriority={isPriority(a)} />)}
            {articles.length > 10 && (
              <p className="text-xs text-muted-foreground px-3 pt-2">+{articles.length - 10} más</p>
            )}
          </div>
        )}
      </div>
      {/* Right quadrants */}
      <div className="lg:col-span-2 grid grid-cols-2 gap-4 auto-rows-fr">
        {quadrants[0] && <QuadrantCard article={quadrants[0]} depth={depth} slot="q1"  index={0} isPriority={isPriority(quadrants[0])} />}
        {quadrants[1] && <QuadrantCard article={quadrants[1]} depth={depth} slot="q2q3" index={1} isPriority={isPriority(quadrants[1])} />}
        {quadrants[2] && <QuadrantCard article={quadrants[2]} depth={depth} slot="q2q3" index={2} isPriority={isPriority(quadrants[2])} />}
        {quadrants[3] && <QuadrantCard article={quadrants[3]} depth={depth} slot="q4"  index={3} isPriority={isPriority(quadrants[3])} />}
        {quadrants.length < 4 && [...Array(4 - quadrants.length)].map((_, i) => (
          <div key={`ph-${i}`} className="rounded-xl border border-dashed border-border/30 flex items-center justify-center p-6 min-h-[120px]">
            <p className="text-xs text-muted-foreground text-center">Más artículos<br />pronto</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Temas ───────────────────────────────────────
const TOPIC_ICONS: Record<string, string> = {
  política: "🏛️", economía: "📊", deportes: "⚽", deporte: "⚽",
  cultura: "🎭", cultural: "🎭", chimentos: "🌟", espectáculos: "🌟",
  tech: "💻", tecnología: "💻", ciencia: "🔬", salud: "🏥",
  internacional: "🌍", "medio-ambiente": "🌱", ambiente: "🌱", Ambiente: "🌱", educación: "📚", social: "🤝",
  independiente: "🔴", arte: "🎨", música: "🎵", cine: "🎬",
};

const TOPIC_LABELS: Record<string, string> = {
  "medio-ambiente": "Medio Ambiente",
  ambiente: "Medio Ambiente",
  Ambiente: "Medio Ambiente",
};

function TopicsSection({ articles, preferredTopics }: { articles: ArticleFeed[]; preferredTopics: string[] }) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.tags.forEach((t) => set.add(t.toLowerCase())));
    // preferred topics first
    const sorted = [
      ...preferredTopics.filter((t) => set.has(t)),
      ...[...set].filter((t) => !preferredTopics.includes(t)),
    ];
    return sorted;
  }, [articles, preferredTopics]);

  const filtered = useMemo(() =>
    activeTopic ? articles.filter((a) => a.tags.some((t) => t.toLowerCase() === activeTopic)) : [],
    [articles, activeTopic]
  );

  return (
    <div className="space-y-6">
      {/* Topic grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allTopics.map((topic, i) => {
          const isPref = preferredTopics.includes(topic);
          const count  = articles.filter((a) => a.tags.some((t) => t.toLowerCase() === topic)).length;
          const active = activeTopic === topic;
          return (
            <motion.button
              key={topic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActiveTopic(active ? null : topic)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                active
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/50 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{TOPIC_ICONS[topic] ?? "📰"}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground capitalize truncate">{TOPIC_LABELS[topic] ?? topic}</p>
                <p className="text-[10px] text-muted-foreground">{count} artículo{count !== 1 ? "s" : ""}</p>
                {isPref && <p className="text-[10px] text-primary font-medium mt-0.5">★ Tu tema</p>}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Articles for selected topic */}
      <AnimatePresence mode="wait">
        {activeTopic && (
          <motion.div key={activeTopic} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">{TOPIC_ICONS[activeTopic] ?? "📰"}</span>
              <h2 className="text-base font-semibold text-foreground capitalize">{TOPIC_LABELS[activeTopic] ?? activeTopic}</h2>
              <span className="text-xs text-muted-foreground">({filtered.length} artículos)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/article/${a.id}`} className="block group">
                    <div className="bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all h-full flex flex-col gap-2">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-3">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/30">
                        {a.journalist_name && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{a.journalist_name}</span>}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{a.read_time} min</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && <EmptyState message={`No hay artículos de "${activeTopic}" todavía.`} />}
          </motion.div>
        )}
      </AnimatePresence>

      {!activeTopic && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Seleccioná un tema para ver sus artículos
        </p>
      )}
    </div>
  );
}

// ─── Section: Autores ─────────────────────────────────────
interface AuthorInfo { name: string; count: number; readTime: number; tags: string[]; latest: ArticleFeed }

function AuthorsSection({ articles }: { articles: ArticleFeed[] }) {
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);

  const authors = useMemo<AuthorInfo[]>(() => {
    const map = new Map<string, AuthorInfo>();
    articles.forEach((a) => {
      if (!a.journalist_name) return;
      const existing = map.get(a.journalist_name);
      if (!existing) {
        map.set(a.journalist_name, { name: a.journalist_name, count: 1, readTime: a.read_time, tags: a.tags, latest: a });
      } else {
        existing.count++;
        existing.readTime += a.read_time;
        a.tags.forEach((t) => { if (!existing.tags.includes(t)) existing.tags.push(t); });
        if (new Date(a.created_at) > new Date(existing.latest.created_at)) existing.latest = a;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [articles]);

  const authorArticles = useMemo(() =>
    activeAuthor ? articles.filter((a) => a.journalist_name === activeAuthor) : [],
    [articles, activeAuthor]
  );

  if (authors.length === 0) return <EmptyState message="Todavía no hay autores publicados." />;

  return (
    <div className="space-y-6">
      {/* Author grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((author, i) => {
          const active = activeAuthor === author.name;
          return (
            <motion.button
              key={author.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveAuthor(active ? null : author.name)}
              className={`text-left p-5 rounded-xl border transition-all ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] hover:border-primary/30"
              }`}
            >
              {/* Avatar initials */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {author.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{author.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {author.count} artículo{author.count !== 1 ? "s" : ""} · ~{Math.round(author.readTime / author.count)} min avg
                  </p>
                </div>
              </div>
              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap">
                {author.tags.slice(0, 3).map((t) => <TagBadge key={t} tag={t} />)}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Articles for selected author */}
      <AnimatePresence mode="wait">
        {activeAuthor && (
          <motion.div key={activeAuthor} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <PenTool className="w-3.5 h-3.5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">{activeAuthor}</h2>
              <span className="text-xs text-muted-foreground">({authorArticles.length} artículos)</span>
            </div>
            <div className="space-y-2">
              {authorArticles.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/article/${a.id}`} className="block group">
                    <div className="flex items-center gap-4 px-4 py-3.5 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-1.5 mb-1 flex-wrap">
                          {a.tags.slice(0, 2).map((t) => <TagBadge key={t} tag={t} />)}
                        </div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                        {a.perspectives && <span className="text-[10px] text-primary flex items-center gap-0.5"><Layers className="w-3 h-3" />{a.perspectives.length}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeAuthor && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Seleccioná un autor para ver sus artículos
        </p>
      )}
    </div>
  );
}

// ─── Section: Recientes ───────────────────────────────────
function RecentSection({ articles }: { articles: ArticleFeed[] }) {
  const sorted = useMemo(() =>
    [...articles].sort((a, b) =>
      new Date(b.published_at ?? b.created_at).getTime() -
      new Date(a.published_at ?? a.created_at).getTime()
    ), [articles]
  );

  if (sorted.length === 0) return <EmptyState message="No hay artículos publicados todavía." />;

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, ArticleFeed[]>();
    sorted.forEach((a) => {
      const d = new Date(a.published_at ?? a.created_at);
      const key = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return map;
  }, [sorted]);

  return (
    <div className="space-y-8">
      {[...grouped.entries()].map(([dateLabel, dayArticles]) => (
        <div key={dateLabel}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest capitalize">{dateLabel}</h2>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <div className="space-y-2">
            {dayArticles.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/article/${a.id}`} className="block group">
                  <div className="flex items-center gap-4 px-4 py-3.5 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {a.tags.slice(0, 2).map((t) => <TagBadge key={t} tag={t} />)}
                        {a.access_level !== "free" && <Lock className="w-3 h-3 text-amber-500" />}
                      </div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                      {a.journalist_name && (
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" />{a.journalist_name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                      {a.perspectives && <span className="text-[10px] text-primary flex items-center gap-0.5"><Layers className="w-3 h-3" />{a.perspectives.length}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Mock sections (fallback cuando no hay artículos reales) ──
function MockTopicsSection() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const allTags = [...new Set(mockEvents.flatMap((e) => e.tags))];
  const filtered = activeTopic
    ? mockEvents.filter((e) => e.tags.includes(activeTopic as never))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allTags.map((tag, i) => {
          const count = mockEvents.filter((e) => e.tags.includes(tag)).length;
          const active = activeTopic === tag;
          return (
            <motion.button
              key={tag}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveTopic(active ? null : tag)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{TOPIC_ICONS[tag.toLowerCase()] ?? "📰"}</span>
              <div>
                <p className="text-sm font-semibold text-foreground capitalize">{tag}</p>
                <p className="text-[10px] text-muted-foreground">{count} evento{count !== 1 ? "s" : ""}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {activeTopic && (
          <motion.div key={activeTopic} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{TOPIC_ICONS[activeTopic.toLowerCase()] ?? "📰"}</span>
              <h2 className="text-base font-semibold text-foreground">{activeTopic}</h2>
            </div>
            <div className="space-y-3">
              {filtered.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!activeTopic && <p className="text-xs text-muted-foreground text-center py-4">Seleccioná un tema para ver sus eventos</p>}
    </div>
  );
}

function MockAuthorsSection() {
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const authors = [...new Map(
    mockEvents.flatMap((e) => e.journalists).map((j) => [j.id, j])
  ).values()];
  const filtered = activeAuthor
    ? mockEvents.filter((e) => e.journalists.some((j) => j.id === activeAuthor))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((author, i) => {
          const active = activeAuthor === author.id;
          const count = mockEvents.filter((e) => e.journalists.some((j) => j.id === author.id)).length;
          return (
            <motion.button
              key={author.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveAuthor(active ? null : author.id)}
              className={`text-left p-5 rounded-xl border transition-all ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {author.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{author.name}</p>
                  <p className="text-[10px] text-muted-foreground">{author.specialization} · {count} evento{count !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{author.bio}</p>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {activeAuthor && (
          <motion.div key={activeAuthor} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="w-4 h-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                {authors.find((a) => a.id === activeAuthor)?.name}
              </h2>
            </div>
            <div className="space-y-3">
              {filtered.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!activeAuthor && <p className="text-xs text-muted-foreground text-center py-4">Seleccioná un autor para ver sus eventos</p>}
    </div>
  );
}

function MockRecentSection() {
  const sorted = [...mockEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const grouped = new Map<string, typeof mockEvents>();
  sorted.forEach((e) => {
    const key = new Date(e.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(e);
  });

  return (
    <div className="space-y-8">
      {[...grouped.entries()].map(([dateLabel, events]) => (
        <div key={dateLabel}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest capitalize">{dateLabel}</h2>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <div className="space-y-3">
            {events.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Guardados ───────────────────────────────────
function SavedSection() {
  const { data: articles, isLoading } = useSavedArticles();

  if (isLoading) return <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/20 animate-pulse" />)}</div>;
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Bookmark className="w-8 h-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">Todavía no guardaste artículos.</p>
        <p className="text-xs text-muted-foreground">Usá el botón Guardar dentro de cualquier noticia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {articles.map((a: any, i: number) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Link to={`/article/${a.id}`} className="block group">
            <div className="flex items-center gap-4 px-4 py-3.5 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex gap-1.5 mb-1 flex-wrap">
                  {(a.tags ?? []).slice(0, 2).map((t: string) => <TagBadge key={t} tag={t} />)}
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                <Bookmark className="w-3.5 h-3.5 text-primary fill-primary" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Daily Brief ──────────────────────────────────────────
function DailyBrief({ articles, mockEvts }: { articles: ArticleFeed[]; mockEvts: typeof mockEvents }) {
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const [open, setOpen] = useState(true);

  // Get top 3: prefer real articles, fallback to mock events
  const items = articles.length >= 3
    ? articles.slice(0, 3).map(a => ({ id: a.id, title: a.title, tags: a.tags, readTime: a.read_time, href: `/article/${a.id}`, summary: a.body.slice(0, 100).replace(/[#*_`]/g, "") + "…" }))
    : mockEvts.slice(0, 3).map(e => ({ id: e.id, title: e.title, tags: e.tags as string[], readTime: e.readTime, href: `/event/${e.id}`, summary: e.neutralSummary.slice(0, 100) + "…" }));

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">⚡ El Minuto MIDIA</p>
          <p className="text-xs text-muted-foreground capitalize">{today}</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <Link key={item.id} to={item.href} className="flex items-start gap-3 group">
            <span className="text-xs font-bold text-primary/50 w-4 shrink-0 mt-0.5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.summary}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5 mt-0.5"><Clock className="w-3 h-3" />{item.readTime}m</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Section: Historial ───────────────────────────────────
function HistorySection() {
  const { history } = useReadingHistory();

  if (history.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <History className="w-8 h-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm text-muted-foreground">Todavía no leíste artículos.</p>
        <p className="text-xs text-muted-foreground">Tu historial aparece acá automáticamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((a: any, i: number) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Link to={`/article/${a.id}`} className="block group">
            <div className="flex items-center gap-4 px-4 py-3.5 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] border border-border/50 hover:border-primary/30 rounded-xl transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex gap-1.5 mb-1 flex-wrap">
                  {(a.tags ?? []).slice(0, 2).map((t: string) => <TagBadge key={t} tag={t} />)}
                </div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-secondary/40 rounded-full overflow-hidden w-24">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.read_time} min</span>
                <span className="text-[10px] text-primary font-medium">{a.progress}% leído</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground text-sm">{message}</div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────
const Index = () => {
  const { data: articles, isLoading } = useArticles();
  const { data: profile } = useReaderProfile();

  const [activeSection, setActiveSection] = useState<Section>("foryou");
  const [activeTopicFilter, setActiveTopicFilter] = useState("todos");

  const preferredTopics = useMemo(
    () => (profile?.topics ?? []).map((t) => t.toLowerCase()),
    [profile]
  );

  const depth = resolveDepth(profile?.depth);

  const isPriority = (a: ArticleFeed) =>
    preferredTopics.length > 0 &&
    a.tags.some((t) => preferredTopics.includes(t.toLowerCase()));

  // Sorted articles for "Para vos"
  const forYouArticles = useMemo(() => {
    if (!articles) return [];
    const filtered = activeTopicFilter === "todos"
      ? articles
      : articles.filter((a) => a.tags.some((t) => t.toLowerCase() === activeTopicFilter));
    return [
      ...filtered.filter((a) => isPriority(a)),
      ...filtered.filter((a) => !isPriority(a)),
    ];
  }, [articles, activeTopicFilter, preferredTopics]);

  const filterPills = useMemo(() => {
    if (!preferredTopics.length) return [];
    return ["todos", ...preferredTopics.slice(0, 6)];
  }, [preferredTopics]);

  const allArticles = articles ?? [];
  const hasArticles = allArticles.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EconTicker />

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight leading-tight">
              {preferredTopics.length > 0 ? "Tu panorama de hoy" : "El panorama completo"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {preferredTopics.length > 0
                ? `${preferredTopics.slice(0, 3).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" · ")}`
                : "Configurá tus temas para personalizar este feed"}
            </p>
          </div>
          <Link
            to="/preferences"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/40 hover:border-border rounded-full px-3 py-1.5 transition-all shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Ajustar
          </Link>
        </motion.div>

        {/* ── Daily Brief ── */}
        {activeSection === "foryou" && !isLoading && (
          <DailyBrief articles={forYouArticles} mockEvts={mockEvents} />
        )}

        {/* ── Section nav bar (sticky) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="sticky top-16 z-30 -mx-6 px-6 mb-6 bg-background/90 backdrop-blur-md border-b border-border/40"
        >
          <div className="flex overflow-x-auto scrollbar-none">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === s.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.icon}
                {s.label}
                {/* Active underline */}
                {activeSection === s.id && (
                  <motion.div
                    layoutId="section-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Topic sub-filter (only in Para vos) ── */}
        {activeSection === "foryou" && filterPills.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 mb-6 flex-wrap"
          >
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveTopicFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  activeTopicFilter === pill
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {pill === "todos" ? "Todos" : pill}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {isLoading && <DashboardSkeleton />}

        {/* ── Content per section ── */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Para vos */}
              {activeSection === "foryou" && (
                hasArticles
                  ? <ForYouSection articles={forYouArticles} depth={depth} isPriority={isPriority} />
                  : <div className="space-y-4">{mockEvents.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}</div>
              )}

              {/* Temas */}
              {activeSection === "topics" && (
                hasArticles
                  ? <TopicsSection articles={allArticles} preferredTopics={preferredTopics} />
                  : <MockTopicsSection />
              )}

              {/* Autores */}
              {activeSection === "authors" && (
                hasArticles
                  ? <AuthorsSection articles={allArticles} />
                  : <MockAuthorsSection />
              )}

              {/* Recientes */}
              {activeSection === "recent" && (
                hasArticles
                  ? <RecentSection articles={allArticles} />
                  : <MockRecentSection />
              )}

              {/* Guardados */}
              {activeSection === "saved" && <SavedSection />}

              {/* Historial */}
              {activeSection === "history" && <HistorySection />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Index;
