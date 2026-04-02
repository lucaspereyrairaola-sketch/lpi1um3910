import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Users,
  Zap,
  Globe,
  Check,
  PenTool,
  Sparkles,
  BarChart3,
} from "lucide-react";

const SPECIALIZATIONS = [
  { id: "politica", label: "Política", icon: "🏛️" },
  { id: "economia", label: "Economía", icon: "📊" },
  { id: "deportes", label: "Deportes", icon: "⚽" },
  { id: "cultura", label: "Cultura", icon: "🎭" },
  { id: "tecnologia", label: "Tecnología", icon: "💻" },
  { id: "ciencia", label: "Ciencia", icon: "🔬" },
  { id: "salud", label: "Salud", icon: "🏥" },
  { id: "internacional", label: "Internacional", icon: "🌍" },
  { id: "medio-ambiente", label: "Medio Ambiente", icon: "🌱" },
  { id: "educacion", label: "Educación", icon: "📚" },
  { id: "investigacion", label: "Investigación", icon: "🔎" },
  { id: "opinion", label: "Opinión", icon: "💬" },
];

const BENEFITS = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    color: "text-[hsl(var(--success))]",
    bg: "bg-[hsl(var(--success))]/10",
    title: "Monetizá tu trabajo",
    desc: "Cada lectura genera ingresos. Definís el precio de tu contenido premium.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Tu audiencia, tuya",
    desc: "Los lectores te siguen a vos, no a un medio. Construís comunidad propia.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    color: "text-[hsl(var(--warning))]",
    bg: "bg-[hsl(var(--warning))]/10",
    title: "IA como asistente",
    desc: "Generá 3 perspectivas automáticas desde tu artículo con un solo clic.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Métricas reales",
    desc: "Sabés exactamente cuánto tiempo leen tu contenido, no solo clics.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    color: "text-[hsl(var(--success))]",
    bg: "bg-[hsl(var(--success))]/10",
    title: "Distribución en LATAM",
    desc: "Tu contenido llega a lectores en toda la región desde el día uno.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "text-[hsl(var(--warning))]",
    bg: "bg-[hsl(var(--warning))]/10",
    title: "Sin intermediarios",
    desc: "Publicás directo. Sin filtros editoriales. Sin esperar aprobación.",
  },
];

const JournalistOnboarding = () => {
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, refreshRoles, switchMode } = useAuth();
  const navigate = useNavigate();

  const bioValid = bio.trim().length >= 20;
  const canFinish = bioValid && specialization !== "";

  const handleFinish = async () => {
    if (!user || !canFinish) return;
    setSaving(true);
    try {
      // 1. Add journalist role (ignore conflict if already exists)
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: "journalist" }, { onConflict: "user_id,role" });

      if (roleError && !roleError.message.includes("duplicate")) {
        throw roleError;
      }

      // 2. Upsert journalist profile
      const { error: profileError } = await supabase
        .from("journalist_profiles")
        .upsert(
          { user_id: user.id, bio: bio.trim(), specialization },
          { onConflict: "user_id" }
        );

      if (profileError) throw profileError;

      // 3. Refresh roles in context and switch to journalist mode
      await refreshRoles();
      switchMode("journalist");

      setStep(3); // success screen
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error activando modo autor";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar — only for steps 0-2 */}
        {step < 3 && (
          <div className="flex gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 0: Benefits ── */}
          {step === 0 && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2 text-primary">
                <PenTool className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest font-medium">
                  Modo Autor · Paso 1 de 3
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Tu voz.<br />Tu audiencia.<br />Tus ingresos.
              </h1>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                Activar el modo autor en MIDIA es gratis. Podés seguir leyendo como siempre
                y además publicar, monetizar y construir tu marca personal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {BENEFITS.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4 p-4 bg-card border border-border/50 rounded-xl"
                  >
                    <div className={`p-2 rounded-lg ${b.bg} ${b.color} shrink-0 h-fit`}>
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("/feed")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ahora no
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Quiero ser autor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Profile ── */}
          {step === 1 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2 text-primary">
                <PenTool className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest font-medium">
                  Modo Autor · Paso 2 de 3
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Contanos quién sos</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Esto es lo primero que ven tus lectores. Sé honesto, sé vos.
              </p>

              {/* Bio */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tu bio
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    (mínimo 20 caracteres)
                  </span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ej: Periodista especializada en economía regional con 8 años cubriendo política monetaria en LATAM..."
                  rows={4}
                  className={`w-full bg-secondary/40 border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 transition-colors ${
                    bio.length > 0 && !bioValid
                      ? "border-destructive focus:ring-destructive"
                      : "border-border/50 focus:ring-primary"
                  }`}
                />
                <div className="flex items-center justify-between mt-1.5">
                  {bio.length > 0 && !bioValid ? (
                    <p className="text-xs text-destructive">
                      Faltan {20 - bio.trim().length} caracteres
                    </p>
                  ) : bioValid ? (
                    <p className="text-xs text-[hsl(var(--success))] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Perfecto
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">{bio.length} caracteres</p>
                </div>
              </div>

              {/* Specialization */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tu especialidad principal
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {SPECIALIZATIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSpecialization(s.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        specialization === s.id
                          ? "border-primary bg-primary/10 glow-border"
                          : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-xs font-medium text-foreground leading-tight">
                        {s.label}
                      </span>
                      {specialization === s.id && (
                        <Check className="w-3 h-3 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canFinish}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  Revisar y activar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === 2 && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2 text-primary">
                <PenTool className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest font-medium">
                  Modo Autor · Paso 3 de 3
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Confirmá tu perfil</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Así te van a ver tus lectores. Podés editarlo cuando quieras.
              </p>

              <div className="bg-card border border-border/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {user?.user_metadata?.display_name ?? "Tu nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {SPECIALIZATIONS.find((s) => s.id === specialization)?.icon}{" "}
                      {SPECIALIZATIONS.find((s) => s.id === specialization)?.label}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                  {bio}
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ✅ Seguís teniendo acceso a todo el contenido como lector<br />
                  ✅ Podés cambiar entre modo lector y modo autor desde la barra de navegación<br />
                  ✅ Tu primer artículo puede ser gratuito o de pago, vos decidís
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Editar perfil
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Activando..." : "Activar modo autor"}
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-[hsl(var(--success))]/15 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-[hsl(var(--success))]" />
              </motion.div>

              <h1 className="text-3xl font-bold text-foreground mb-3">
                ¡Bienvenido a MIDIA!
              </h1>
              <p className="text-muted-foreground mb-2 text-sm leading-relaxed max-w-md mx-auto">
                Tu modo autor está activo. Desde ahora podés cambiar entre
                <strong className="text-foreground"> lector</strong> y{" "}
                <strong className="text-foreground">autor</strong> cuando quieras
                desde la barra de navegación.
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                Tu primer artículo está a un clic de distancia.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/journalist/dashboard")}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <PenTool className="w-4 h-4" />
                  Ir a mi panel
                </button>
                <button
                  onClick={() => navigate("/feed")}
                  className="flex items-center justify-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-secondary/70 transition-colors"
                >
                  Volver al feed
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JournalistOnboarding;
