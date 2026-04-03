import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useArticle } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import type { Perspective } from "@/types/article";
import { ArrowLeft, Clock, User, Lock, Sparkles, Layers, ChevronRight, Zap, BookMarked, Library, PenSquare } from "lucide-react";

// ─── Selector de tiempo de lectura ───────────────────────
type ReadMode = "2" | "5" | "10" | "full";

const READ_MODES: { id: ReadMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "2",    label: "2 min",    icon: <Zap className="w-3.5 h-3.5" />,        desc: "Lo esencial" },
  { id: "5",    label: "5 min",    icon: <Clock className="w-3.5 h-3.5" />,      desc: "Resumen" },
  { id: "10",   label: "10 min",   icon: <BookMarked className="w-3.5 h-3.5" />, desc: "Análisis" },
  { id: "full", label: "Completo", icon: <Library className="w-3.5 h-3.5" />,    desc: "Todo" },
];

function adaptPerspective(p: Perspective, mode: ReadMode): Perspective {
  switch (mode) {
    case "2":  return { ...p, content: [],                  keyArguments: p.keyArguments.slice(0, 2) };
    case "5":  return { ...p, content: p.content.slice(0,1), keyArguments: p.keyArguments.slice(0, 3) };
    case "10": return { ...p, content: p.content.slice(0,2), keyArguments: p.keyArguments };
    default:   return p;
  }
}

const tagColorMap: Record<string, string> = {
  política: "bg-tag-politics/15 text-tag-politics",
  economía: "bg-tag-economy/15 text-tag-economy",
  social: "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech: "bg-tag-tech/15 text-tag-tech",
  tecnología: "bg-tag-tech/15 text-tag-tech",
};
const defaultTagColor = "bg-secondary text-secondary-foreground";

// Color accent per perspective index
const perspectiveAccents = [
  "border-l-tag-politics text-tag-politics bg-tag-politics/5",
  "border-l-tag-economy text-tag-economy bg-tag-economy/5",
  "border-l-tag-global text-tag-global bg-tag-global/5",
];
const perspectiveTabActive = [
  "bg-tag-politics/20 text-tag-politics border border-tag-politics/30",
  "bg-tag-economy/20 text-tag-economy border border-tag-economy/30",
  "bg-tag-global/20 text-tag-global border border-tag-global/30",
];

const PerspectiveView = ({
  perspective,
  accentClass,
}: {
  perspective: Perspective;
  accentClass: string;
}) => (
  <motion.div
    key={perspective.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <div className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${accentClass} mb-6`}>
      <span className="text-2xl">{perspective.icon}</span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{perspective.label}</h3>
        <span className="text-xs text-muted-foreground">{perspective.tone}</span>
      </div>
    </div>

    <div className="space-y-4">
      {perspective.content.map((paragraph, i) => (
        <p key={i} className="text-base text-secondary-foreground leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>

    {perspective.keyArguments.length > 0 && (
      <div className="mt-6 pt-5 border-t border-border/50">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Argumentos clave
        </p>
        <ul className="space-y-2">
          {perspective.keyArguments.map((arg, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-secondary-foreground">
              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {arg}
            </li>
          ))}
        </ul>
      </div>
    )}
  </motion.div>
);

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useArticle(id ?? "");
  const [activeTab, setActiveTab] = useState<string>("body");
  const [readProgress, setReadProgress] = useState(0);
  const [readMode, setReadMode] = useState<ReadMode>("5");
  const { roles } = useAuth();

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setReadProgress(height > 0 ? Math.min(100, (scrolled / height) * 100) : 0);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 space-y-4">
          <div className="h-8 w-2/3 bg-secondary/30 rounded animate-pulse" />
          <div className="h-4 w-full bg-secondary/30 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-secondary/30 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground">Artículo no encontrado.</p>
          <Link to="/feed" className="text-primary text-sm mt-4 inline-block">
            ← Volver al feed
          </Link>
        </div>
      </div>
    );
  }

  const date = article.published_at ?? article.created_at;
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-border/20">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al feed
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Tags + acceso */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  tagColorMap[tag.toLowerCase()] ?? defaultTagColor
                }`}
              >
                {tag}
              </span>
            ))}
            {hasPerspectives && (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                <Layers className="w-3 h-3" />
                {article.perspectives!.length} perspectivas
              </span>
            )}
            {article.access_level !== "free" && (
              <span className="flex items-center gap-1 text-xs text-amber-500 ml-auto">
                <Lock className="w-3 h-3" />
                {article.access_level === "premium" ? "Premium" : "Micropago"}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Byline */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/50 flex-wrap">
            {article.journalist_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{article.journalist_name}</span>
              </span>
            )}
            <span>
              {new Date(date).toLocaleDateString("es-ES", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.read_time} min de lectura
            </span>
            {readProgress > 5 && (
              <span className="ml-auto text-xs text-primary font-medium">
                {Math.round(readProgress)}% leído
              </span>
            )}
          </div>

          {/* Selector de tiempo de lectura */}
          <div className="mb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
              ¿Cuánto tiempo tenés?
            </p>
            <div className="flex gap-2 flex-wrap">
              {READ_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setReadMode(m.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                    readMode === m.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {m.icon}
                  {m.label}
                  <span className={`text-[10px] ${readMode === m.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    · {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Perspective tabs */}
          {hasPerspectives && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                Elegí el enfoque
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                <button
                  onClick={() => setActiveTab("body")}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "body"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  📰 Original
                </button>
                {article.perspectives!.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === p.id
                        ? perspectiveTabActive[i % perspectiveTabActive.length]
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === "body" || !hasPerspectives ? (
                <motion.div
                  key="body"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {article.body.split("\n").filter(Boolean).map((paragraph, i) => (
                    <p key={i} className="text-base text-secondary-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {article.perspectives!
                    .filter((p) => p.id === activeTab)
                    .map((p, i) => (
                      <PerspectiveView
                        key={`${p.id}-${readMode}`}
                        perspective={adaptPerspective(p, readMode)}
                        accentClass={perspectiveAccents[i % perspectiveAccents.length]}
                      />
                    ))}
                </AnimatePresence>
              )}
            </AnimatePresence>
          </div>

          {/* Compare perspectives CTA */}
          {hasPerspectives && activeTab !== "body" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 grid grid-cols-1 gap-2"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                Otras perspectivas
              </p>
              {article.perspectives!
                .filter((p) => p.id !== activeTab)
                .map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    className="flex items-center gap-3 p-3.5 bg-secondary/30 hover:bg-secondary/50 border border-border/50 rounded-xl text-left transition-colors group"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.tone}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
            </motion.div>
          )}

          {/* No perspectives yet */}
          {!hasPerspectives && (
            <div className="mt-10 bg-primary/5 border border-dashed border-primary/30 rounded-xl p-5 flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Las perspectivas aún no están generadas
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  El periodista puede generar los enfoques (Político, Económico, Social...) desde el editor con un click.
                </p>
                {roles.includes("journalist") && (
                  <Link
                    to={`/journalist/editor/${article.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    Ir al editor y generar perspectivas
                  </Link>
                )}
              </div>
            </div>
          )}
        </motion.article>
      </div>
    </div>
  );
};

export default ArticlePage;
