import { motion } from "framer-motion";
import type { Perspective } from "@/data/mockEvents";
import { Lightbulb } from "lucide-react";

interface PerspectivePanelProps {
  perspective: Perspective;
}

const PerspectivePanel = ({ perspective }: PerspectivePanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{perspective.icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {perspective.label} Perspective
          </h3>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Tone: {perspective.tone}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {perspective.content.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="rounded-lg bg-secondary/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Key Arguments
          </span>
        </div>
        <ul className="space-y-2">
          {perspective.keyArguments.map((arg, i) => (
            <li
              key={i}
              className="text-sm text-muted-foreground flex items-start gap-2"
            >
              <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {arg}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default PerspectivePanel;
