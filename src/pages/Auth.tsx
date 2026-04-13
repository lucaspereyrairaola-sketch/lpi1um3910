import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import newspapersCollage from "@/assets/newspapers-collage.jpg";
import { lovable } from "@/integrations/lovable/index";

const FEATURES = [
  { icon: "📈", text: "5 perspectivas por noticia — económica, política, social, internacional y cultural" },
  { icon: "⚡", text: "Elegí cuánto tiempo tenés: 2, 5 o 10 minutos de lectura" },
  { icon: "🔀", text: "Comparar enfoques para descubrir qué argumentos se contradicen" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"reader" | "journalist">("reader");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("¡Bienvenido de vuelta!");
        navigate("/feed");
      } else {
        await signUp(email, password, displayName, selectedRole);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("user_roles").insert({ user_id: session.user.id, role: selectedRole });
          if (selectedRole === "reader") {
            await supabase.from("reader_profiles").insert({ user_id: session.user.id });
          } else {
            await supabase.from("journalist_profiles").insert({ user_id: session.user.id });
          }
        }
        toast.success("¡Cuenta creada! Revisá tu email para verificar.");
        navigate(selectedRole === "reader" ? "/onboarding" : "/journalist/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background newspaper collage */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src={newspapersCollage}
          alt=""
          className="w-full h-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
      </div>

      {/* Radial glow — same as Landing */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(37,99,235,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(14,165,233,0.04) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Left panel: brand + features (hidden on mobile) ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-center w-[480px] shrink-0 px-12 py-14 relative z-10 border-r border-border/30"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <svg viewBox="0 0 28 28" fill="none" width={28} height={28}><circle cx="14" cy="14" r="13" stroke="#2563EB" strokeWidth="2"/><path d="M8 14h12M14 8v12M9 9l10 10M19 9L9 19" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/><circle cx="14" cy="14" r="4" fill="#2563EB"/></svg>
          <span className="text-xl font-bold text-gradient-brand tracking-tight">MIDIA</span>
        </Link>

        {/* Headline */}
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.15, color: "#fff", marginBottom: "1.2rem" }}>
            Empezá a ver el panorama{" "}
            <span style={{ background: "linear-gradient(135deg,#60A5FA,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              completo.
            </span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            La misma noticia desde 5 ángulos distintos. Leé más inteligente, no más tiempo.
          </p>

          <div className="space-y-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: "rgba(37,99,235,0.1)" }}>
                  {f.icon}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground/50">Periodismo sin filtros · América Latina · 2026</p>
      </motion.div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden no-underline">
          <svg viewBox="0 0 28 28" fill="none" width={24} height={24}><circle cx="14" cy="14" r="13" stroke="#2563EB" strokeWidth="2"/><path d="M8 14h12M14 8v12M9 9l10 10M19 9L9 19" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/><circle cx="14" cy="14" r="4" fill="#2563EB"/></svg>
          <span className="text-lg font-bold text-gradient-brand">MIDIA</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="glass rounded-2xl p-8">
            <div className="mb-7">
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 100, padding: "0.3rem 0.8rem", fontSize: "0.72rem", fontWeight: 600, color: "#60A5FA", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                Acceso abierto
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {isLogin ? "Bienvenido de vuelta" : "Creá tu cuenta gratis"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? "Ingresá para ver todas las perspectivas" : "Empezá a leer el panorama completo"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">¿Cómo usarás MIDIA?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { role: "reader",     emoji: "📖", title: "Lector",     desc: "Leer y descubrir" },
                          { role: "journalist", emoji: "✍️", title: "Periodista", desc: "Crear y publicar" },
                        ].map((r) => (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => setSelectedRole(r.role as "reader" | "journalist")}
                            className={`p-4 rounded-xl border text-center transition-all ${
                              selectedRole === r.role
                                ? "border-primary bg-primary/10 glow-border"
                                : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                            }`}
                          >
                            <span className="text-lg block mb-1">{r.emoji}</span>
                            <span className="text-sm font-semibold text-foreground block">{r.title}</span>
                            <span className="text-xs text-muted-foreground">{r.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#2563EB,#0EA5E9)", color: "#fff" }}
              >
                {submitting ? "Procesando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">o continuá con</span></div>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                  if (result.error) toast.error("Error al iniciar sesión con Google");
                  if (result.redirected) return;
                  navigate("/feed");
                }}
                className="flex items-center justify-center gap-2 bg-secondary/40 border border-border/40 rounded-xl py-3 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button
                type="button"
                onClick={async () => {
                  const result = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
                  if (result.error) toast.error("Error al iniciar sesión con Apple");
                  if (result.redirected) return;
                  navigate("/feed");
                }}
                className="flex items-center justify-center gap-2 bg-secondary/40 border border-border/40 rounded-xl py-3 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.28-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>

            <div className="mt-5 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {isLogin ? "¿No tenés cuenta? Crear una gratis" : "¿Ya tenés cuenta? Iniciar sesión"}
              </button>
            </div>
          </div>

          {/* Back to landing */}
          <p className="text-center mt-4 text-xs text-muted-foreground/50">
            <Link to="/" className="hover:text-muted-foreground transition-colors">← Volver a inicio</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
