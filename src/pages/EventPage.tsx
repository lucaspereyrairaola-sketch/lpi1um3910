import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PerspectivePanel from "@/components/PerspectivePanel";
import CompareNarratives from "@/components/CompareNarratives";
import JournalistCard from "@/components/JournalistCard";
import { mockEvents } from "@/data/mockEvents";
import { ArrowLeft, Clock, GitCompare, BookOpen } from "lucide-react";
import type { Tag } from "@/data/mockEvents";

const tagColorMap: Record<Tag, string> = {
  "Política": "bg-tag-politics/15 text-tag-politics",
  "Economía": "bg-tag-economy/15 text-tag-economy",
  Social: "bg-tag-social/15 text-tag-social",
  Global: "bg-tag-global/15 text-tag-global",
  Tech: "bg-tag-tech/15 text-tag-tech",
};

const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const event = mockEvents.find((e) => e.id === id);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [compareMode, setCompareMode] = useState(false);

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

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mt-8 mb-6">
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
                      key={activePerspective.id}
                      perspective={activePerspective}
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
