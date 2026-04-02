import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useArticle } from "@/hooks/useArticles";
import type { Perspective } from "@/types/article";
import { ArrowLeft, Clock, User, Lock, Sparkles } from "lucide-react";

const tagColorMap: Record<string, string> = {
  política: "bg-tag-politics/15 text-tag-politics",
  economía: "bg-tag-economy/15 text-tag-economy",
  social: "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech: "bg-tag-tech/15 text-tag-tech",
  tecnología: "bg-tag-tech/15 text-tag-tech",
};

const defaultTagColor = "bg-secondary text-secondary-foreground";

const PerspectiveView = ({ perspective }: { perspective: Perspective }) => (
  <motion.div
    key={perspective.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">{perspective.icon}</span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{perspective.label}</h3>
        <span className="text-xs text-muted-foreground">{perspective.tone}</span>
      </div>
    </div>

    <div className="space-y-3">
      {perspective.content.map((paragraph, i) => (
        <p key={i} className="text-base text-secondary-foreground leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>

    {perspective.keyArguments.length > 0 && (
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Argumentos clave
        </p>
        <ul className="space-y-1.5">
          {perspective.keyArguments.map((arg, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-secondary-foreground">
              <span className="text-primary mt-0.5">•</span>
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
                {article.journalist_name}
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
          </div>

          {/* Tabs: solo si hay perspectivas */}
          {hasPerspectives && (
            <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none">
              <button
                onClick={() => setActiveTab("body")}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "body"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                📰 Artículo
              </button>
              {article.perspectives!.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === p.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
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
                    .map((p) => (
                      <PerspectiveView key={p.id} perspective={p} />
                    ))}
                </AnimatePresence>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!hasPerspectives && (
            <div className="mt-10 bg-primary/5 border border-dashed border-primary/30 rounded-xl p-4 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Las perspectivas múltiples con IA estarán disponibles cuando el periodista las genere desde el editor.
              </p>
            </div>
          )}
        </motion.article>
      </div>
    </div>
  );
};

export default ArticlePage;
