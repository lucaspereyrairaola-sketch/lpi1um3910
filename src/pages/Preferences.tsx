import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Check } from "lucide-react";
import { toast } from "sonner";

const verticals = ["Economy", "Tech", "Global", "Politics", "Social"] as const;
const intensities = [
  { label: "Quick Read", desc: "~2 min", value: "quick" },
  { label: "Standard", desc: "~5 min", value: "standard" },
  { label: "Deep Dive", desc: "~10 min", value: "deep" },
] as const;

const Preferences = () => {
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>(["Economy", "Tech"]);
  const [intensity, setIntensity] = useState("standard");

  const toggleVertical = (v: string) => {
    setSelectedVerticals((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const handleSave = () => {
    toast.success("Preferences saved!", {
      description: `${selectedVerticals.length} verticals, ${intensity} intensity`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Personalize Your Feed
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Choose your preferred verticals and reading intensity.
          </p>

          {/* Verticals */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-foreground mb-3">
              Preferred Verticals
            </h2>
            <div className="flex flex-wrap gap-2">
              {verticals.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleVertical(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedVerticals.includes(v)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {selectedVerticals.includes(v) && <Check className="w-3.5 h-3.5" />}
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="mb-10">
            <h2 className="text-sm font-medium text-foreground mb-3">
              Reading Intensity
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {intensities.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntensity(opt.value)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    intensity === opt.value
                      ? "border-primary bg-primary/10 glow-border"
                      : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground block">
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Save Preferences
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Preferences;
