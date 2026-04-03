import { useState } from "react";
import { motion } from "framer-motion";
import type { Perspective, BiasAnalysis } from "@/data/mockEvents";
import { AlertTriangle, ArrowLeftRight, Eye } from "lucide-react";

interface CompareNarrativesProps {
  perspectives: Perspective[];
  biasAnalysis?: BiasAnalysis;
}

const CompareNarratives = ({ perspectives, biasAnalysis }: CompareNarrativesProps) => {
  const [leftId, setLeftId] = useState(perspectives[0]?.id || "");
  const [rightId, setRightId] = useState(perspectives[1]?.id || "");

  const left = perspectives.find((p) => p.id === leftId);
  const right = perspectives.find((p) => p.id === rightId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Selectors */}
      <div className="flex items-center gap-4">
        <select
          value={leftId}
          onChange={(e) => setLeftId(e.target.value)}
          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
        >
          {perspectives.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.label}
            </option>
          ))}
        </select>

        <ArrowLeftRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        <select
          value={rightId}
          onChange={(e) => setRightId(e.target.value)}
          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
        >
          {perspectives.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {left && (
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{left.icon}</span>
              <span className="font-semibold text-foreground text-sm">{left.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{left.tone}</span>
            </div>
            {left.content.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-secondary-foreground">
                {p}
              </p>
            ))}
          </div>
        )}
        {right && (
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{right.icon}</span>
              <span className="font-semibold text-foreground text-sm">{right.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{right.tone}</span>
            </div>
            {right.content.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-secondary-foreground">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Bias Analysis — solo si está disponible */}
      {biasAnalysis && (
        <div className="space-y-4 pt-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Análisis de Sesgo IA
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <h5 className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">
                Diferencias de Encuadre
              </h5>
              <ul className="space-y-2">
                {biasAnalysis.framingDifferences.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <h5 className="text-xs font-medium text-tag-economy mb-2 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Sesgo en Palabras
              </h5>
              <ul className="space-y-2">
                {biasAnalysis.wordChoiceBias.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <h5 className="text-xs font-medium text-tag-social mb-2 uppercase tracking-wider">
                Elementos Omitidos
              </h5>
              <ul className="space-y-2">
                {biasAnalysis.omittedElements.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CompareNarratives;
