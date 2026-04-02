import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ArticleFeed } from "@/types/article";
import { ArrowRight, Clock, Lock, User } from "lucide-react";

const tagColorMap: Record<string, string> = {
  política: "bg-tag-politics/15 text-tag-politics",
  economía: "bg-tag-economy/15 text-tag-economy",
  social: "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech: "bg-tag-tech/15 text-tag-tech",
  tecnología: "bg-tag-tech/15 text-tag-tech",
};

const defaultTagColor = "bg-secondary text-secondary-foreground";

interface ArticleCardProps {
  article: ArticleFeed;
  index: number;
}

function getExcerpt(body: string, maxChars = 160): string {
  const plain = body.replace(/[#*_`>\[\]]/g, "").trim();
  return plain.length > maxChars ? plain.slice(0, maxChars).trim() + "…" : plain;
}

const ArticleCard = ({ article, index }: ArticleCardProps) => {
  const date = article.published_at ?? article.created_at;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/article/${article.id}`} className="block group">
        <div className="surface-interactive rounded-xl p-6 border border-border/50 hover:glow-border transition-all duration-300">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {article.tags.slice(0, 3).map((tag) => (
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
              <span className="ml-auto flex items-center gap-1 text-xs text-amber-500">
                <Lock className="w-3 h-3" />
                {article.access_level === "premium" ? "Premium" : "Micropago"}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {article.read_time} min
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {getExcerpt(article.body)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {new Date(date).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {article.journalist_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.journalist_name}
                </span>
              )}
            </div>
            <span className="text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Leer
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArticleCard;
