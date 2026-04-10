import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layers, ArrowRight, CheckCircle, ChevronRight, Globe, Zap, BookOpen, BarChart2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEMO_PERSPECTIVES = [
  {
    id: "economica",
    label: "Económica",
    icon: "📈",
    tone: "Analítico",
    color: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    labelColor: "text-blue-400",
    content: "El ajuste fiscal reduce el déficit en el corto plazo, pero al costo de contraer el consumo interno. Las proyecciones del FMI estiman una caída del 2,3% del PIB en 2026, aunque con rebote esperado para 2027 si se consolida la estabilidad cambiaria.",
  },
  {
    id: "politica",
    label: "Política",
    icon: "🏛️",
    tone: "Contextual",
    color: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    labelColor: "text-purple-400",
    content: "El gobierno apuesta a que los resultados macroeconómicos lleguen antes de las elecciones de octubre. La oposición, fragmentada, no logra articular una narrativa alternativa creíble, lo que paradójicamente da al ejecutivo más margen del que las encuestas sugieren.",
  },
  {
    id: "social",
    label: "Social",
    icon: "👥",
    tone: "Humano",
    color: "from-green-500/10 to-green-600/5 border-green-500/20",
    labelColor: "text-green-400",
    content: "Para los trabajadores informales —el 40% de la fuerza laboral— el ajuste no es un debate abstracto: es el precio del supermercado del día siguiente. La canasta básica subió un 18% en el último trimestre, mientras los salarios reales cayeron un 11%.",
  },
];

const STATS = [
  { value: "5", label: "perspectivas por artículo" },
  { value: "LATAM", label: "contexto regional" },
  { value: "IA", label: "generación automática" },
];

const FEATURES = [
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Perspectivas múltiples",
    desc: "Económica, política, social, internacional y cultural. La misma noticia, 5 lecturas distintas.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Tiempo de lectura a medida",
    desc: "2, 5, 10 minutos o lectura completa. Vos elegís la profundidad según tu tiempo.",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Comparar enfoques",
    desc: "Poné dos perspectivas lado a lado y descubrí qué argumentos se contradicen.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Contexto integrado",
    desc: "Términos técnicos explicados en el momento justo, sin salir del artículo.",
  },
];

export default function Landing() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("economica");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist" as any).insert({ email });
      if (error && !error.message.includes("duplicate")) throw error;
      setSubmitted(true);
      toast.success("¡Te anotamos! Te avisamos cuando abramos el acceso.");
    } catch {
      toast.error("Hubo un error. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const active = DEMO_PERSPECTIVES.find((p) => p.id === activeTab) ?? DEMO_PERSPECTIVES[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-gradient-brand">MIDIA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Iniciar sesión
            </Link>
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs text-primary uppercase tracking-[0.2em] font-medium mb-4 px-3 py-1 rounded-full border border-primary/30 bg-primary/5">
              Periodismo sin filtros · LATAM
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Todas las voces.
              <br />
              <span className="text-gradient-brand">Una plataforma.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              MIDIA genera automáticamente 5 perspectivas sobre cada noticia: económica, política, social, internacional y cultural.
              Leé el panorama completo en el tiempo que tenés.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base"
              >
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo"
                className="border border-border/60 text-foreground font-medium px-8 py-4 rounded-xl hover:bg-secondary/50 transition-colors text-base"
              >
                Ver demo
              </a>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" className="py-20 px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">La misma noticia, 5 lecturas</h2>
            <p className="text-muted-foreground">Crisis económica en Argentina · seleccioná una perspectiva</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {DEMO_PERSPECTIVES.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeTab === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-border/30 text-muted-foreground/50 cursor-default">
              🌍 Internacional
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-border/30 text-muted-foreground/50 cursor-default">
              🎭 Cultural
            </button>
          </div>

          {/* Active perspective card */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl border bg-gradient-to-br p-6 ${active.color}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{active.icon}</span>
              <div>
                <span className={`text-sm font-semibold ${active.labelColor}`}>{active.label}</span>
                <span className="text-xs text-muted-foreground ml-2">· {active.tone}</span>
              </div>
            </div>
            <p className="text-foreground leading-relaxed">{active.content}</p>
            <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground flex items-center gap-2">
              <span>🔒</span>
              <span>Iniciá sesión para ver las 5 perspectivas completas y comparar enfoques</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Diseñado para pensar mejor</h2>
            <p className="text-muted-foreground">No más burbujas de información. Leer distinto es pensar distinto.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-border/50 bg-secondary/20 p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-20 px-6 bg-secondary/20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Sé parte desde el inicio</h2>
          <p className="text-muted-foreground mb-8">
            MIDIA está en acceso anticipado. Anotate para recibir actualizaciones y acceso prioritario.
          </p>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
              <p className="font-semibold text-foreground">¡Listo! Te avisamos cuando abramos.</p>
              <Link to="/auth" className="text-sm text-primary hover:underline flex items-center gap-1">
                O creá tu cuenta ahora <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {submitting ? "..." : "Anotarme"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/40 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-bold text-gradient-brand">MIDIA</span>
        </div>
        <p className="text-xs text-muted-foreground">Periodismo sin filtros · América Latina · 2026</p>
      </footer>
    </div>
  );
}
