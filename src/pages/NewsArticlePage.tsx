import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useNewsFeedArticle } from "@/hooks/useNewsFeed";
import type { Perspective } from "@/types/article";
import {
  ArrowLeft, Clock, ExternalLink, Layers, Zap, BookMarked, Library,
  ChevronRight, Globe,
} from "lucide-react";

// ─── Selector de modo de lectura ──────────────────────────────────────────────
type ReadMode = "2" | "5" | "10" | "full";

const READ_MODES: { id: ReadMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "2",    label: "2 min",    icon: <Zap className="w-3.5 h-3.5" />,        desc: "Lo esencial" },
  { id: "5",    label: "5 min",    icon: <Clock className="w-3.5 h-3.5" />,      desc: "Resumen" },
  { id: "10",   label: "10 min",   icon: <BookMarked className="w-3.5 h-3.5" />, desc: "Análisis" },
  { id: "full", label: "Completo", icon: <Library className="w-3.5 h-3.5" />,    desc: "Todo" },
];

function adaptPerspective(p: Perspective, mode: ReadMode): Perspective {
  const content = p.content ?? [];
  const keyArgs = p.keyArguments ?? [];
  switch (mode) {
    case "2":  return { ...p, content: [],                 keyArguments: keyArgs.slice(0, 2) };
    case "5":  return { ...p, content: content.slice(0,1), keyArguments: keyArgs.slice(0, 3) };
    case "10": return { ...p, content: content.slice(0,2), keyArguments: keyArgs };
    default:   return { ...p, content,                     keyArguments: keyArgs };
  }
}

const tagColorMap: Record<string, string> = {
  política:      "bg-tag-politics/15 text-tag-politics",
  economía:      "bg-tag-economy/15 text-tag-economy",
  social:        "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech:          "bg-tag-tech/15 text-tag-tech",
  tecnología:    "bg-tag-tech/15 text-tag-tech",
  ambiente:      "bg-emerald-500/15 text-emerald-400",
};
const defaultTagColor = "bg-secondary text-secondary-foreground";

// ─── PerspectiveView ──────────────────────────────────────────────────────────
function PerspectiveView({ perspective, mode }: { perspective: Perspective; mode: ReadMode }) {
  const adapted = adaptPerspective(perspective, mode);
  return (
    <motion.div
      key={perspective.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Key arguments */}
      {adapted.keyArguments.length > 0 && (
        <div className="space-y-2">
          {adapted.keyArguments.map((arg, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/15 rounded-xl">
              <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">{arg}</p>
            </div>
          ))}
        </div>
      )}
      {/* Paragraphs */}
      {adapted.content.map((para, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">{para}</p>
      ))}
      {mode === "2" && (
        <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-3">
          Cambiá al modo 5 min o completo para ver el análisis completo.
        </p>
      )}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const NewsArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading, error } = useNewsFeedArticle(id ?? "");

  const [activeTab, setActiveTab] = useState(0);
  const [readMode, setReadMode] = useState<ReadMode>("5");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-20 space-y-4">
          <div className="h-8 w-24 bg-secondary/30 rounded-lg animate-pulse" />
          <div className="h-10 bg-secondary/30 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-secondary/20 rounded-lg animate-pulse" />
          <div className="h-64 bg-secondary/20 rounded-xl animate-pulse mt-6" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-20 text-center">
          <p className="text-muted-foreground mb-4">Artículo no encontrado.</p>
          <Link to="/" className="text-primary text-sm hover:underline">← Volver al feed</Link>
        </div>
      </div>
    );
  }

  const perspectives = article.perspectives ?? [];
  const activePerspective = perspectives[activeTab];
  const pubDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-24">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver al feed
        </Link>

        {/* Source badge */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs bg-secondary/60 border border-border/50 rounded-full px-3 py-1 text-muted-foreground font-medium">
            <Globe className="w-3 h-3" />
            {article.source_name ?? article.journalist_name}
          </span>
          {article.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                tagColorMap[t.toLowerCase()] ?? defaultTagColor
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 flex-wrap">
          {pubDate && <span>{pubDate}</span>}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />{article.read_time} min de lectura
          </span>
          {perspectives.length > 0 && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Layers className="w-3.5 h-3.5" />{perspectives.length} perspectivas
            </span>
          )}
        </div>

        {/* Source link */}
        {article.source_url && (
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mb-6"
          >
            <ExternalLink className="w-3 h-3" />
            Leer en {article.source_name}
          </a>
        )}

        <div className="mt-8">
          {perspectives.length > 0 ? (
            <>
              {/* Read mode selector */}
              <div className="flex items-center gap-1.5 mb-6 p-1.5 bg-secondary/40 rounded-xl w-fit">
                {READ_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setReadMode(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      readMode === m.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Perspective tabs */}
              <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-none pb-1">
                {perspectives.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      activeTab === i
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-[hsl(var(--surface))] text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
                    }`}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Tone badge */}
              {activePerspective && (
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">{activePerspective.icon}</span>
                  <div>
                    <p className="text-base font-semibold text-foreground">{activePerspective.label}</p>
                    <p className="text-xs text-muted-foreground">Tono: {activePerspective.tone}</p>
                  </div>
                </div>
              )}

              {/* Perspective content */}
              <div className="bg-[hsl(var(--surface))] border border-border/50 rounded-2xl p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {activePerspective && (
                    <PerspectiveView
                      key={activePerspective.id}
                      perspective={activePerspective}
                      mode={readMode}
                    />
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Sin perspectivas: mostrar resumen */
            <div className="bg-[hsl(var(--surface))] border border-border/50 rounded-2xl p-5 sm:p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.summary || article.body.slice(0, 600)}
              </p>
              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-4"
                >
                  <ExternalLink className="w-3 h-3" />
                  Leer artículo completo en {article.source_name}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsArticlePage;
