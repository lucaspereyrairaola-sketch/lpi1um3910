import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ArticleFeed } from "@/types/article";
import { ArrowRight, Clock, Lock, User, Layers } from "lucide-react";

const tagColorMap: Record<string, string> = {
  política: "bg-tag-politics/15 text-tag-politics",
  economía: "bg-tag-economy/15 text-tag-economy",
  social: "bg-tag-social/15 text-tag-social",
  internacional: "bg-tag-global/15 text-tag-global",
  tech: "bg-tag-tech/15 text-tag-tech",
  tecnología: "bg-tag-tech/15 text-tag-tech",
};
const defaultTagColor = "bg-secondary text-secondary-foreground";

export type CardSize = "featured" | "medium" | "compact";

interface ArticleCardProps {
  article: ArticleFeed;
  index: number;
  size?: CardSize;
  isPriority?: boolean;
  className?: string;
}

function getExcerpt(body: string, maxChars = 160): string {
  const plain = body.replace(/[#*_`>\[\]]/g, "").trim();
  return plain.length > maxChars ? plain.slice(0, maxChars).trim() + "…" : plain;
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${tagColorMap[tag.toLowerCase()] ?? defaultTagColor}`}>
      {tag}
    </span>
  );
}

function PerspectivesBadge({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
      <Layers className="w-3 h-3" />
      {count} perspectivas
    </span>
  );
}

function AccessBadge({ level }: { level: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-amber-500">
      <Lock className="w-3 h-3" />
      {level === "premium" ? "Premium" : "Micropago"}
    </span>
  );
}

// ── FEATURED ──────────────────────────────────────────────
const FeaturedCard = ({ article, index, isPriority }: ArticleCardProps) => {
  const date = article.published_at ?? article.created_at;
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Link to={`/article/${article.id}`} className="block group h-full">
        <div className="surface-interactive rounded-2xl p-8 border border-border/50 hover:glow-border transition-all duration-300 h-full flex flex-col">
          {/* Priority badge */}
          {isPriority && (
            <span className="self-start mb-3 text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary">
              Para vos
            </span>
          )}

          {/* Tags row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {article.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
            {hasPerspectives && <PerspectivesBadge count={article.perspectives!.length} />}
            {article.access_level !== "free" && (
              <span className="ml-auto"><AccessBadge level={article.access_level} /></span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-base text-muted-foreground leading-relaxed mb-6 flex-1">
            {getExcerpt(article.body, 280)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-3">
              {article.journalist_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {article.journalist_name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.read_time} min
              </span>
            </div>
            <span className="text-sm text-primary font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Leer
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── MEDIUM ────────────────────────────────────────────────
const MediumCard = ({ article, index, isPriority }: ArticleCardProps) => {
  const date = article.published_at ?? article.created_at;
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/article/${article.id}`} className="block group">
        <div className="surface-interactive rounded-xl p-5 border border-border/50 hover:glow-border transition-all duration-300 h-full flex flex-col">
          {isPriority && (
            <span className="self-start mb-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              Para vos
            </span>
          )}

          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            {article.tags.slice(0, 2).map((tag) => <TagBadge key={tag} tag={tag} />)}
            {hasPerspectives && <PerspectivesBadge count={article.perspectives!.length} />}
            {article.access_level !== "free" && (
              <span className="ml-auto"><AccessBadge level={article.access_level} /></span>
            )}
          </div>

          <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
            {article.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {getExcerpt(article.body, 130)}
          </p>

          <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border/30">
            {article.journalist_name && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {article.journalist_name}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {article.read_time} min
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── COMPACT ───────────────────────────────────────────────
const CompactCard = ({ article, index, isPriority }: ArticleCardProps) => {
  const hasPerspectives = article.perspectives && article.perspectives.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link to={`/article/${article.id}`} className="block group">
        <div className="flex items-center gap-4 surface-interactive rounded-xl px-4 py-3.5 border border-border/50 hover:glow-border transition-all duration-200">
          {/* Left: tags + title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {article.tags.slice(0, 1).map((tag) => <TagBadge key={tag} tag={tag} />)}
              {hasPerspectives && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
                  <Layers className="w-2.5 h-2.5" />
                  {article.perspectives!.length}
                </span>
              )}
              {isPriority && (
                <span className="text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                  Para vos
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </div>

          {/* Right: meta */}
          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {article.read_time}m
            </span>
            {article.access_level !== "free" && (
              <Lock className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── MAIN EXPORT ───────────────────────────────────────────
const ArticleCard = ({
  article,
  index,
  size = "medium",
  isPriority = false,
  className = "",
}: ArticleCardProps) => {
  if (size === "featured")
    return (
      <div className={className}>
        <FeaturedCard article={article} index={index} isPriority={isPriority} />
      </div>
    );
  if (size === "compact")
    return (
      <div className={className}>
        <CompactCard article={article} index={index} isPriority={isPriority} />
      </div>
    );
  return (
    <div className={className}>
      <MediumCard article={article} index={index} isPriority={isPriority} />
    </div>
  );
};

export default ArticleCard;
