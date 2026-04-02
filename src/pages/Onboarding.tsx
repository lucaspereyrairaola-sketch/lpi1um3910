import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ArrowRight, ArrowLeft, Users, BookOpen, Clock, Layers } from "lucide-react";

const TOPICS = [
  { id: "politica", label: "Política", icon: "🏛️" },
  { id: "economia", label: "Economía", icon: "📊" },
  { id: "deportes", label: "Deportes", icon: "⚽" },
  { id: "cultura", label: "Cultura", icon: "🎭" },
  { id: "tech", label: "Tecnología", icon: "💻" },
  { id: "ciencia", label: "Ciencia", icon: "🔬" },
  { id: "salud", label: "Salud", icon: "🏥" },
  { id: "internacional", label: "Internacional", icon: "🌍" },
  { id: "medio-ambiente", label: "Medio Ambiente", icon: "🌱" },
  { id: "educacion", label: "Educación", icon: "📚" },
];

const FREQUENCIES = [
  { id: "morning", label: "Mañana", desc: "Resumen matutino", icon: "☀️" },
  { id: "night", label: "Noche", desc: "Recap del día", icon: "🌙" },
  { id: "realtime", label: "Tiempo Real", desc: "Notificaciones al instante", icon: "⚡" },
  { id: "weekly", label: "Semanal", desc: "Digest dominical", icon: "📅" },
];

const DEPTHS = [
  { id: "headlines", label: "Titulares", desc: "~30 seg", icon: "📰" },
  { id: "summary", label: "Resumen", desc: "~2 min", icon: "📋" },
  { id: "full", label: "Artículo Completo", desc: "~5 min", icon: "📖" },
  { id: "deep", label: "Análisis Profundo", desc: "~10 min", icon: "🔍" },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("morning");
  const [depth, setDepth] = useState("summary");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: "¿QUÉ te interesa?", subtitle: "Elegí tus temáticas favoritas", icon: <BookOpen className="w-5 h-5" /> },
    { title: "¿CUÁNDO querés leer?", subtitle: "Definí tu momento ideal", icon: <Clock className="w-5 h-5" /> },
    { title: "¿CUÁNTO querés leer?", subtitle: "Elegí tu profundidad de lectura", icon: <Layers className="w-5 h-5" /> },
  ];

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const canNext = () => {
    if (step === 0) return selectedTopics.length > 0;
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("reader_profiles")
        .update({
          topics: selectedTopics,
          frequency,
          depth,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("¡Tu perfil de lectura está listo!");
      navigate("/feed");
    } catch (err: any) {
      toast.error(err.message || "Error guardando preferencias");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2 text-primary">
              {steps[step].icon}
              <span className="text-xs uppercase tracking-widest font-medium">
                Paso {step + 1} de {steps.length}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{steps[step].title}</h1>
            <p className="text-sm text-muted-foreground mb-6">{steps[step].subtitle}</p>

            {/* Step 0: Topics */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTopic(t.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedTopics.includes(t.id)
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                    {selectedTopics.includes(t.id) && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Frequency */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    className={`p-5 rounded-xl border text-center transition-all ${
                      frequency === f.id
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{f.icon}</span>
                    <span className="text-sm font-medium text-foreground block">{f.label}</span>
                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Depth */}
            {step === 2 && (
              <div className="space-y-3">
                {DEPTHS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDepth(d.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      depth === d.id
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-xl">{d.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-foreground block">{d.label}</span>
                      <span className="text-xs text-muted-foreground">{d.desc}</span>
                    </div>
                    {depth === d.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando..." : "Finalizar"}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
