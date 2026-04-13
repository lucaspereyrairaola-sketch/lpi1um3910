import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import newspapersCollage from "@/assets/newspapers-collage.jpg";

// ─── Demo perspectives data ────────────────────────────────────────────────────
const PERSPECTIVES = [
  {
    id: 0,
    tab: "📈 Económica",
    label: "Económica · Analítico",
    labelClass: "bg-yellow-400/12 text-yellow-300",
    html: `El nuevo paquete de ajuste busca reducir el <strong>déficit fiscal del 4.2% al 1.8% del PBI</strong> en 18 meses. Los recortes se concentran en subsidios energéticos y transferencias a provincias. En el corto plazo, <span class="highlight">el consumo interno podría caer entre 3% y 5%</span>, golpeando especialmente al comercio minorista y la construcción. Sin embargo, el spread de riesgo país ya bajó 200 puntos — los mercados están comprando la señal de disciplina fiscal. La pregunta es si la recesión que viene será lo suficientemente corta como para que el modelo sea políticamente viable.`,
  },
  {
    id: 1,
    tab: "🏛️ Política",
    label: "Política · Estratégico",
    labelClass: "bg-red-400/12 text-red-300",
    html: `El ajuste llega <strong>a 14 meses de las legislativas</strong> — un timing que no es casual. El oficialismo apuesta a absorber el costo político ahora para llegar a octubre con indicadores en recuperación. La oposición, fragmentada entre los que piden "ajuste con rostro humano" y los que directamente rechazan cualquier recorte, <span class="highlight">no logra articular una alternativa coherente</span>. Los gobernadores del interior son la variable clave: si pierden transferencias, el conflicto federal se escala. Tres provincias ya anunciaron que evaluarán acciones legales.`,
  },
  {
    id: 2,
    tab: "👥 Social",
    label: "Social · Humano",
    labelClass: "bg-purple-400/12 text-purple-300",
    html: `Detrás de los números hay <strong>2.3 millones de hogares</strong> que dependen de los subsidios que se recortan. En el conurbano bonaerense, la tarifa de gas podría triplicarse en los próximos 6 meses. Las organizaciones sociales ya convocaron movilizaciones para la próxima semana. <span class="highlight">El impacto no es parejo: los deciles más bajos absorben proporcionalmente más del ajuste</span>. Para una familia tipo de ingresos medios-bajos, el aumento en servicios representa pasar del 12% al 22% del ingreso mensual. La pregunta que no se responde: ¿qué red de contención queda?`,
  },
  {
    id: 3,
    tab: "🌍 Internacional",
    label: "Internacional · Comparativo",
    labelClass: "bg-sky-400/12 text-sky-300",
    html: `Argentina no está sola en este camino. <strong>Ecuador, Colombia y Costa Rica</strong> implementaron ajustes similares en los últimos 3 años con resultados mixtos. El FMI publicó ayer un statement cautelosamente positivo — necesitan que funcione como caso de estudio para LATAM. <span class="highlight">Los inversores extranjeros miran dos cosas: la velocidad de implementación y la capacidad de sostenerlo políticamente</span>. Brasil, que enfrenta su propia presión fiscal, observa de cerca. Si el modelo argentino funciona, la presión para replicarlo en la región será enorme.`,
  },
  {
    id: 4,
    tab: "🎭 Cultural",
    label: "Cultural · Reflexivo",
    labelClass: "bg-pink-400/12 text-pink-300",
    html: `Hay algo que los economistas no miden: <strong>el agotamiento social acumulado</strong>. Esta es la cuarta "gran reforma" en 20 años para muchos argentinos. Cada una prometía ser la última. <span class="highlight">La narrativa del "sacrificio necesario" tiene fecha de vencimiento</span> — y para una generación que creció en crisis permanente, el escepticismo no es cinismo, es experiencia. En las redes, el humor negro ya procesa lo que el análisis formal todavía no: la sensación de que el sistema pide esfuerzos siempre a los mismos. La cultura del "arreglate como puedas" no es defecto — es adaptación.`,
  },
];

const STATS = [
  { value: "73%", desc: "de los latinoamericanos desconfía de los medios" },
  { value: "85%", desc: "de las noticias presentan un solo ángulo narrativo" },
  { value: "5",   desc: "perspectivas que MIDIA genera por cada noticia" },
];

const HOW = [
  { num: "01", icon: "📰", bg: "rgba(37,99,235,0.12)", title: "La noticia ingresa", desc: "Un periodista publica o una fuente se importa automáticamente desde medios de LATAM." },
  { num: "02", icon: "🧠", bg: "rgba(168,85,247,0.12)", title: "La IA analiza los ejes", desc: "Identifica las dimensiones relevantes: impacto económico, contexto político, efecto social, paralelos globales, raíces culturales." },
  { num: "03", icon: "✨", bg: "rgba(34,197,94,0.12)",  title: "5 perspectivas listas", desc: "El lector navega entre ángulos, compara argumentos y forma su propia opinión informada." },
];

const DIFF = [
  { icon: "🔀", bg: "rgba(234,179,8,0.12)",    title: "Más allá de izquierda vs. derecha", desc: "Perspectivas económica, social, cultural, internacional — dimensiones reales, no espectro político binario." },
  { icon: "🌎", bg: "rgba(14,165,233,0.12)",   title: "Hecho para LATAM, en español",      desc: "Contexto regional real. No es una traducción de un producto gringo — es nativo." },
  { icon: "⚡", bg: "rgba(168,85,247,0.12)",   title: "Perspectivas en segundos",           desc: "IA generativa crea las perspectivas al instante. No hay equipo editorial de 50 personas — hay tecnología." },
  { icon: "🤝", bg: "rgba(34,197,94,0.12)",    title: "Para periodistas, no contra ellos",  desc: "MIDIA amplifica el trabajo del periodista mostrando ángulos que el tiempo no permite cubrir." },
];

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Small reveal wrapper ──────────────────────────────────────────────────────
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={className}>{children}</div>;
}

// ─── Landing page ──────────────────────────────────────────────────────────────
export default function Landing() {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const active = PERSPECTIVES[activeTab];

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist" as any).insert({ email });
      if (error && !error.message.includes("duplicate")) throw error;
      setSubmitted(true);
      setEmail("");
      toast.success("¡Te anotamos! Te avisamos cuando esté tu lugar.");
    } catch {
      toast.error("Hubo un error. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0A0E17", color: "#E2E8F0", lineHeight: 1.6, overflowX: "hidden", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 100, padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,14,23,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg viewBox="0 0 28 28" fill="none" width={28} height={28}><circle cx="14" cy="14" r="13" stroke="#2563EB" strokeWidth="2"/><path d="M8 14h12M14 8v12M9 9l10 10M19 9L9 19" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/><circle cx="14" cy="14" r="4" fill="#2563EB"/></svg>
          MIDIA
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <a href="#demo"  style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Demo en vivo</a>
          <a href="#como"  style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Cómo funciona</a>
          <Link to="/auth" style={{ background: "linear-gradient(135deg,#2563EB,#0EA5E9)", color: "#fff", padding: "0.6rem 1.4rem", borderRadius: 8, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            Acceso anticipado
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
        {/* Newspaper collage background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <img src={newspapersCollage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(10,14,23,0.75) 0%, rgba(10,14,23,0.3) 70%)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(14,165,233,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,99,235,0.25)", border: "1px solid rgba(37,99,235,0.4)", borderRadius: 100, padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: 600, color: "#fff", marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "0.08em", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite", display: "inline-block" }} />
          Acceso anticipado abierto
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 800, lineHeight: 1.1, maxWidth: 800, marginBottom: "1.5rem", color: "#fff", textShadow: "0 4px 24px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.6)" }}>
          Cada noticia tiene más de{" "}
          <span style={{ color: "#3B82F6" }}>
            una verdad.
          </span>
        </h1>

        <p style={{ fontSize: "1.25rem", color: "#fff", maxWidth: 560, marginBottom: "2.5rem", lineHeight: 1.7, fontWeight: 500, textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)" }}>
          MIDIA genera 5 perspectivas automáticas sobre cada noticia — económica, política, social, internacional y cultural — para que formes tu propia opinión.
        </p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "3.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#cta" style={{ background: "linear-gradient(135deg,#2563EB,#0EA5E9)", color: "#fff", padding: "0.8rem 2rem", borderRadius: 8, fontWeight: 600, fontSize: "1rem", textDecoration: "none" }}>
            Quiero acceso anticipado →
          </a>
          <a href="#demo" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "0.8rem 2rem", borderRadius: 8, fontWeight: 600, fontSize: "1rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" }}>
            ▶ Ver cómo funciona
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", justifyContent: "center", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
          <span style={{ fontSize: "0.8rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Construido con tecnología de</span>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {["CLAUDE AI", "SUPABASE", "REACT"].map((t) => (
              <div key={t} style={{ width: 100, height: 28, background: "rgba(255,255,255,0.06)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#475569", fontWeight: 600, letterSpacing: "0.05em" }}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <div style={{ padding: "4rem 2rem", background: "linear-gradient(135deg,rgba(37,99,235,0.06),rgba(14,165,233,0.04))", borderTop: "1px solid rgba(37,99,235,0.1)", borderBottom: "1px solid rgba(37,99,235,0.1)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem", textAlign: "center" }}>
          {STATS.map((s) => (
            <Reveal key={s.value}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 800, lineHeight: 1, background: "linear-gradient(135deg,#60A5FA,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
              <div style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "0.5rem", maxWidth: 180, margin: "0.5rem auto 0" }}>{s.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Live Demo ── */}
      <section id="demo" style={{ padding: "6rem 2rem", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,0.3),transparent)" }} />
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#60A5FA", marginBottom: "1rem" }}>
            <span style={{ width: 24, height: 2, background: "#2563EB", borderRadius: 1, display: "inline-block" }} />
            Demo en vivo
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#fff", marginBottom: "0.8rem" }}>Probalo vos mismo</h2>
          <p style={{ color: "#94A3B8", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto" }}>Hacé click en cada perspectiva y mirá cómo cambia la lectura de la misma noticia.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.8),rgba(15,23,42,0.4))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}>
            {/* Header */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>Argentina anuncia nuevo paquete de ajuste fiscal</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>Buenos Aires · Hace 2 horas</div>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
              {PERSPECTIVES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  style={{ padding: "0.9rem 1.4rem", fontSize: "0.85rem", fontWeight: 600, color: activeTab === p.id ? "#fff" : "#64748B", cursor: "pointer", border: "none", background: activeTab === p.id ? "rgba(37,99,235,0.08)" : "none", borderBottom: activeTab === p.id ? "2px solid #2563EB" : "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.3s" }}
                >
                  {p.tab}
                </button>
              ))}
            </div>
            {/* Content */}
            <div style={{ padding: "2rem", minHeight: 280 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.8rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "1rem" }} className={active.labelClass}>
                {active.label}
              </div>
              <div
                style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#CBD5E1" }}
                dangerouslySetInnerHTML={{ __html: active.html.replace(/<span class="highlight">/g, '<span style="background:linear-gradient(135deg,rgba(37,99,235,0.15),rgba(14,165,233,0.1));padding:0.1rem 0.4rem;border-radius:4px;color:#93C5FD">') }}
              />
            </div>
            <div style={{ padding: "1rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748B" }}>
              Hacé click en las pestañas para ver cómo cambia la narrativa <span style={{ color: "#2563EB" }}>↑</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="como" style={{ padding: "6rem 2rem", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "#60A5FA", marginBottom: "1rem" }}>
            <span style={{ width: 24, height: 2, background: "#2563EB", borderRadius: 1, display: "inline-block" }} />
            Cómo funciona
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#fff", marginBottom: "0.8rem" }}>De una noticia a 5 verdades</h2>
          <p style={{ color: "#94A3B8", fontSize: "1.1rem" }}>En segundos, sin editar nada manualmente.</p>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem" }}>
          {HOW.map((c) => (
            <Reveal key={c.num}>
              <div style={{ background: "linear-gradient(145deg,rgba(15,23,42,0.6),rgba(15,23,42,0.2))", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "2rem", position: "relative", transition: "all 0.3s" }}>
                <div style={{ fontSize: "3rem", fontWeight: 900, color: "#1E3A5F", position: "absolute", top: "1.2rem", right: "1.5rem", lineHeight: 1 }}>{c.num}</div>
                <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1.2rem", background: c.bg }}>{c.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "0.6rem" }}>{c.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#94A3B8", lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Diferenciadores ── */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "#60A5FA", marginBottom: "1rem" }}>
            <span style={{ width: 24, height: 2, background: "#2563EB", borderRadius: 1, display: "inline-block" }} />
            Por qué MIDIA
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#fff", marginBottom: "0.8rem" }}>No es otro agregador de noticias</h2>
          <p style={{ color: "#94A3B8", fontSize: "1.1rem" }}>MIDIA no te dice qué pensar. Te muestra desde dónde se puede pensar.</p>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1.5rem" }}>
          {DIFF.map((d) => (
            <Reveal key={d.title}>
              <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.8rem", display: "flex", gap: "1.2rem", transition: "all 0.3s" }}>
                <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", background: d.bg }}>{d.icon}</div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.3rem" }}>{d.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#94A3B8", lineHeight: 1.5 }}>{d.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA / Waitlist ── */}
      <section id="cta" style={{ padding: "6rem 2rem", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: "#60A5FA", marginBottom: "1rem" }}>
            <span style={{ width: 24, height: 2, background: "#2563EB", borderRadius: 1, display: "inline-block" }} />
            Acceso anticipado
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Sé de los primeros en ver todas las caras de la noticia</h2>
          <p style={{ color: "#94A3B8", fontSize: "1.05rem", marginBottom: "2rem" }}>Estamos abriendo acceso gradualmente. Dejá tu email y te avisamos cuando esté tu lugar.</p>

          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "3rem" }}>✅</div>
              <p style={{ fontWeight: 600, color: "#fff", fontSize: "1.1rem" }}>¡Listo! Te avisamos cuando abramos.</p>
              <Link to="/auth" style={{ color: "#60A5FA", fontSize: "0.9rem", textDecoration: "none" }}>O creá tu cuenta ahora →</Link>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: "flex", gap: "0.75rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{ flex: 1, padding: "0.85rem 1.2rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,23,42,0.8)", color: "#fff", fontSize: "0.95rem", outline: "none" }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: "0.85rem 1.8rem", background: submitting ? "#334155" : "linear-gradient(135deg,#2563EB,#0EA5E9)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: "0.95rem", cursor: submitting ? "not-allowed" : "pointer", whiteSpace: "nowrap" as const }}
              >
                {submitting ? "..." : "Anotarme"}
              </button>
            </form>
          )}
          <p style={{ fontSize: "0.8rem", color: "#475569" }}>Sin spam. Solo actualizaciones importantes sobre MIDIA.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "3rem 2rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontWeight: 700, color: "#94A3B8" }}>MIDIA</div>
        <div style={{ fontSize: "0.8rem", color: "#475569" }}>Periodismo sin filtros · América Latina · 2026</div>
      </footer>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 768px) {
          nav a:not(:last-child) { display: none; }
        }
      `}</style>
    </div>
  );
}
