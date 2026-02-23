import { motion } from "framer-motion";
import type { Journalist } from "@/data/mockEvents";
import { Heart, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface JournalistCardProps {
  journalist: Journalist;
}

const JournalistCard = ({ journalist }: JournalistCardProps) => {
  const [tipped, setTipped] = useState(false);

  const handleTip = () => {
    setTipped(true);
    toast.success(`Thank you for supporting ${journalist.name}!`, {
      description: "Tipping simulation — no real payment processed.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/30 border border-border/50 rounded-xl p-5 flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
        {journalist.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{journalist.name}</h4>
        <p className="text-xs text-primary mb-1">{journalist.specialization}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          {journalist.bio}
        </p>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {journalist.articlesCount} articles
        </span>
      </div>
      <button
        onClick={handleTip}
        disabled={tipped}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          tipped
            ? "bg-primary/10 text-primary cursor-default"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${tipped ? "fill-primary" : ""}`} />
        {tipped ? "Supported" : "Support"}
      </button>
    </motion.div>
  );
};

export default JournalistCard;
