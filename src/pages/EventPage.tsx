import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PerspectivePanel from "@/components/PerspectivePanel";
import CompareNarratives from "@/components/CompareNarratives";
import JournalistCard from "@/components/JournalistCard";
import { mockEvents } from "@/data/mockEvents";
import { ArrowLeft, Clock, GitCompare, BookOpen, Zap, BookMarked, Library } from "lucide-react";
import type { Tag, Perspective } from "@/data/mockEvents";

// ─── Lectura adaptativa ───────────────────────────────────
type ReadTime = "2" | "5" | "10" | "full";

const READ_MODES: { id: ReadTime; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "2",    label: "2 min",    icon: <Zap className="w-3.5 h-3.5" />,        desc: "Lo esencial" },
  { id: "5",    label: "5 min",    icon: <Clock className="w-3.5 h-3.5" />,      desc: "Resumen" },
  { id: "10",   label: "10 min",   icon: <BookMarked className="w-3.5 h-3.5" />, desc: "Análisis" },
  { id: "full", label: "Completo", icon: <Library className="w-3.5 h-3.5" />,    desc: "Todo" },
];

function adaptedPerspective(p: Perspective, mode: ReadTime): Perspective {
  const content = p.content ?? [];
  const keyArgs = p.keyArguments ?? [];
  switch (mode) {
    case "2":
      return { ...p, content: [], keyArguments: keyArgs.slice(0, 2) };
    case "5":
      return { ...p, content: content.slice(0, 1), keyArguments: keyArgs.slice(0, 3) };
    case "10":
      return { ...p, content: content.slice(0, 2), keyArguments: keyArgs };
    default:
      return { ...p, content, keyArguments: keyArgs };
  }
}

const tagColorMap: Record<Tag, string> = {
  "Política": "bg-tag-politics/15 text-tag-politics",
  "Economía": "bg-tag-economy/15 text-tag-economy",
  Social: "bg-tag-social/15 text-tag-social",
  Global: "bg-tag-global/15 text-tag-global",
  Tech: "bg-tag-tech/15 text-tag-tech",
  Ambiente: "bg-tag-social/15 text-tag-social",
};

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const event = mockEvents.find((e) => e.id === id);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [compareMode, setCompareMode] = useState(false);
  const [readMode, setReadMode] = useState<ReadTime>("5");

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground">Evento no encontrado.</p>
          <Link to="/" className="text-primary text-sm mt-4 inline-block">
            ← Volver al feed
          </Link>
        </div>
      </div>
    );
  }

  const perspectiveTabs = event.perspectives.map((p) => ({
    id: p.id,
    label: p.label,
    icon: p.icon,
  }));

  const activePerspective = event.perspectives.find((p) => p.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a eventos
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColorMap[tag]}`}
              >
                {tag}
              </span>
            ))}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {event.readTime} min de lectura
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            {event.title}
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-2">
            {event.neutralSummary}
          </p>

          <span className="text-xs text-muted-foreground">
            {new Date(event.date).toLocaleDateString("es-ES", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </motion.div>

        {/* ── Selector de tiempo de lectura ── */}
        <div className="mt-8 mb-2">
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

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mt-6 mb-6">
          <button
            onClick={() => setCompareMode(false)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !compareMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Perspectivas
          </button>
          <button
            onClick={() => setCompareMode(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              compareMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Comparar Narrativas
          </button>
        </div>

        <AnimatePresence mode="wait">
          {compareMode ? (
            <motion.div
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CompareNarratives
                perspectives={event.perspectives}
                biasAnalysis={event.biasAnalysis}
              />
            </motion.div>
          ) : (
            <motion.div
              key="perspectives"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "summary"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  📰 Resumen
                </button>
                {perspectiveTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === "summary" ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        📰 Resumen Neutral
                      </h3>
                      <p className="text-sm leading-relaxed text-secondary-foreground">
                        {event.neutralSummary}
                      </p>
                      <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 mt-4">
                        <p className="text-xs text-muted-foreground">
                          Este resumen es generado por IA a partir de múltiples fuentes verificadas.
                          Explora las perspectivas individuales usando las pestañas de arriba para entender diferentes ángulos de este evento.
                        </p>
                      </div>
                    </motion.div>
                  ) : activePerspective ? (
                    <PerspectivePanel
                      key={`${activePerspective.id}-${readMode}`}
                      perspective={adaptedPerspective(activePerspective, readMode)}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journalists */}
        {event.journalists.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Periodistas Contribuyentes
            </h3>
            <div className="space-y-3">
              {event.journalists.map((j) => (
                <JournalistCard key={j.id} journalist={j} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;
