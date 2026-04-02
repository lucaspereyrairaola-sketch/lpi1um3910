import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useArticle } from "@/hooks/useArticles";
import { ArrowLeft, Clock, User, Lock } from "lucide-react";

const tagColorMap: Record<string, string> = {
  política: "bg-tag-politics/15 text-tag-politics",
  economía: "bg-tag-economy/15 text-tag-economy",
  social: "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech: "bg-tag-tech/15 text-tag-tech",
  tecnología: "bg-tag-tech/15 text-tag-tech",
};

const defaultTagColor = "bg-secondary text-secondary-foreground";

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useArticle(id ?? "");

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
          {/* Tags + meta */}
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-6 border-b border-border/50">
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

          {/* Body */}
          <div className="prose prose-sm prose-invert max-w-none text-foreground leading-relaxed space-y-4">
            {article.body.split("\n").filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-base text-secondary-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-border/50 bg-secondary/20 rounded-xl p-4">
            <p className="text-xs text-muted-foreground text-center">
              Este artículo fue publicado en MIDIA. Las perspectivas múltiples estarán disponibles próximamente.
            </p>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default ArticlePage;
