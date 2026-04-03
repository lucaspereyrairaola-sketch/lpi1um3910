import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Layers, Eye, EyeOff, ArrowRight, Newspaper, Globe, Users } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import newspapersHero from "@/assets/newspapers-hero.jpg";
import newspapersDetail from "@/assets/newspapers-detail.jpg";

const features = [
  { icon: <Newspaper className="w-5 h-5" />, title: "Multi-Perspectiva", desc: "Cada historia contada desde todos los ángulos posibles." },
  { icon: <Globe className="w-5 h-5" />, title: "Fuentes Globales", desc: "Diarios de EE.UU., Europa, Latam y Asia en un solo lugar." },
  { icon: <Users className="w-5 h-5" />, title: "Comunidad Crítica", desc: "Debates constructivos entre lectores y periodistas." },
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
        toast.success("¡Cuenta creada! Revisa tu email para verificar tu cuenta.");
        if (selectedRole === "reader") {
          navigate("/onboarding");
        } else {
          navigate("/journalist/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={newspapersHero}
            alt="Diarios internacionales"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-20">
          {/* Nav */}
          <div className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-gradient-brand">MIDIA</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs text-primary uppercase tracking-[0.2em] font-medium mb-3 block">
                Periodismo sin filtros
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                Todas las voces.
                <br />
                <span className="text-gradient-brand">Una plataforma.</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                Lee y compará perspectivas de los principales diarios del mundo. 
                Desde The New York Times hasta El País, desde Le Monde hasta Folha de São Paulo, 
                desde Clarín hasta El Universal.
              </p>

              {/* Feature pills */}
              <div className="space-y-4 mb-10">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{f.title}</span>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Newspaper strip */}
              <div className="relative rounded-2xl overflow-hidden h-32 lg:h-40">
                <img
                  src={newspapersDetail}
                  alt="Editoriales internacionales"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
              </div>
            </motion.div>

            {/* Right: Auth form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {isLogin ? "Bienvenido de vuelta" : "Creá tu cuenta"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {isLogin ? "Ingresá a tu cuenta para continuar" : "Empezá a leer el panorama completo"}
                </p>

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
                            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Tu nombre"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">¿Cómo usarás MIDIA?</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedRole("reader")}
                              className={`p-4 rounded-xl border text-center transition-all ${
                                selectedRole === "reader"
                                  ? "border-primary bg-primary/10 glow-border"
                                  : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                              }`}
                            >
                              <span className="text-lg block mb-1">📖</span>
                              <span className="text-sm font-medium text-foreground block">Lector</span>
                              <span className="text-xs text-muted-foreground">Leer y descubrir</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRole("journalist")}
                              className={`p-4 rounded-xl border text-center transition-all ${
                                selectedRole === "journalist"
                                  ? "border-primary bg-primary/10 glow-border"
                                  : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                              }`}
                            >
                              <span className="text-lg block mb-1">✍️</span>
                              <span className="text-sm font-medium text-foreground block">Periodista</span>
                              <span className="text-xs text-muted-foreground">Crear y publicar</span>
                            </button>
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
                      className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card/80 px-3 text-muted-foreground">o continuá con</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (result.error) {
                        toast.error("Error al iniciar sesión con Google");
                      }
                      if (result.redirected) return;
                      navigate("/feed");
                    }}
                    className="flex items-center justify-center gap-2 bg-secondary/50 border border-border/50 rounded-xl py-3 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const result = await lovable.auth.signInWithOAuth("apple", {
                        redirect_uri: window.location.origin,
                      });
                      if (result.error) {
                        toast.error("Error al iniciar sesión con Apple");
                      }
                      if (result.redirected) return;
                      navigate("/feed");
                    }}
                    className="flex items-center justify-center gap-2 bg-secondary/50 border border-border/50 rounded-xl py-3 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.28-3.74 4.25z"/></svg>
                    Apple
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isLogin ? "¿No tenés cuenta? Crear una" : "¿Ya tenés cuenta? Iniciar sesión"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
