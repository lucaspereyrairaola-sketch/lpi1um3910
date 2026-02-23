import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Layers, Eye, EyeOff, ArrowRight, Newspaper, Globe, Users } from "lucide-react";
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
