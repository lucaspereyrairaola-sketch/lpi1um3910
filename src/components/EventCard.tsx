import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { NewsEvent, Tag } from "@/data/mockEvents";
import { ArrowRight, Clock } from "lucide-react";

const tagColorMap: Record<Tag, string> = {
  "Política": "bg-tag-politics/15 text-tag-politics",
  "Economía": "bg-tag-economy/15 text-tag-economy",
  Social: "bg-tag-social/15 text-tag-social",
  Global: "bg-tag-global/15 text-tag-global",
  Tech: "bg-tag-tech/15 text-tag-tech",
};

interface EventCardProps {
  event: NewsEvent;
  index: number;
}

const EventCard = ({ event, index }: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/event/${event.id}`} className="block group">
        <div className="surface-interactive rounded-xl p-6 border border-border/50 hover:glow-border transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColorMap[tag]}`}
              >
                {tag}
              </span>
            ))}
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.readTime} min
            </span>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {event.neutralSummary}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {new Date(event.date).toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver Perspectivas
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
