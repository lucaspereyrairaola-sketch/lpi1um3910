import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Glosario de términos clave para LATAM
const GLOSSARY: Record<string, { definition: string; category: string }> = {
  "BCRA": { definition: "Banco Central de la República Argentina. Regula la política monetaria, cambiaria y financiera del país.", category: "Institución" },
  "FMI": { definition: "Fondo Monetario Internacional. Organismo que otorga préstamos a países con dificultades financieras, generalmente con condiciones de ajuste económico.", category: "Organismo internacional" },
  "tipo de cambio": { definition: "Precio al que se intercambia una moneda por otra. En Argentina, determina cuántos pesos vale un dólar.", category: "Economía" },
  "inflación": { definition: "Aumento generalizado y sostenido de los precios de bienes y servicios. Reduce el poder adquisitivo de la moneda.", category: "Economía" },
  "riesgo país": { definition: "Indicador que mide la probabilidad de que un país no pueda pagar su deuda. Cuanto más alto, mayor desconfianza de los inversores.", category: "Finanzas" },
  "PBI": { definition: "Producto Bruto Interno. Mide el valor total de bienes y servicios producidos en un país durante un período.", category: "Economía" },
  "PIB": { definition: "Producto Interno Bruto. Equivalente al PBI. Mide la actividad económica total de un país.", category: "Economía" },
  "cepo cambiario": { definition: "Restricción impuesta por el gobierno para limitar la compra de divisas extranjeras, especialmente dólares.", category: "Política monetaria" },
  "brecha cambiaria": { definition: "Diferencia entre el tipo de cambio oficial y el paralelo (blue). Una brecha alta indica desconfianza en el tipo oficial.", category: "Economía" },
  "deuda soberana": { definition: "Deuda contraída por un Estado. Si no puede pagarla, puede declarar un default o reestructurar sus obligaciones.", category: "Finanzas" },
  "Mercosur": { definition: "Mercado Común del Sur. Bloque de integración económica conformado por Argentina, Brasil, Paraguay, Uruguay y Venezuela.", category: "Organismo regional" },
  "OCDE": { definition: "Organización para la Cooperación y el Desarrollo Económico. Agrupa a los países más desarrollados del mundo.", category: "Organismo internacional" },
  "default": { definition: "Incumplimiento en el pago de deudas. Cuando un país declara default, no puede pagar sus compromisos con acreedores.", category: "Finanzas" },
  "dólar blue": { definition: "Cotización del dólar en el mercado informal o paralelo, fuera del sistema financiero oficial.", category: "Economía" },
  "punto de inflexión": { definition: "Momento en que una situación cambia de dirección o de tendencia de manera significativa.", category: "General" },
};

interface ContextTooltipProps {
  text: string;
}

function highlightTerms(text: string, onTermClick: (term: string) => void): React.ReactNode[] {
  const terms = Object.keys(GLOSSARY);
  // Build regex that matches any term (case insensitive)
  const pattern = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const term = match[0];
    const key = Object.keys(GLOSSARY).find(k => k.toLowerCase() === term.toLowerCase()) ?? term;
    parts.push(
      <button
        key={`${match.index}-${term}`}
        onClick={() => onTermClick(key)}
        className="underline decoration-dotted decoration-primary/50 text-foreground hover:text-primary transition-colors cursor-help"
      >
        {term}
      </button>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function ContextualBody({ body }: { body: string }) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const entry = activeTerm ? GLOSSARY[activeTerm] : null;

  const paragraphs = body.split("\n").filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Tooltip banner */}
      <AnimatePresence>
        {activeTerm && entry && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-20 z-20 bg-background border border-primary/30 rounded-xl p-4 shadow-lg flex items-start gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{activeTerm}</span>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{entry.category}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{entry.definition}</p>
            </div>
            <button onClick={() => setActiveTerm(null)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paragraphs with highlighted terms */}
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="text-base text-secondary-foreground leading-relaxed">
          {highlightTerms(paragraph, setActiveTerm)}
        </p>
      ))}

      {Object.keys(GLOSSARY).some(term =>
        body.toLowerCase().includes(term.toLowerCase())
      ) && (
        <p className="text-[10px] text-muted-foreground mt-2">
          💡 Las palabras subrayadas tienen definición contextual — tocalas para entender mejor.
        </p>
      )}
    </div>
  );
}
