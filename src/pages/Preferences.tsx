import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Check, Globe, Zap, BookOpen, Bell, Palette, Crown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const verticals = ["Economía", "Tech", "Global", "Política", "Social", "Ciencia", "Deportes", "Cultura", "Medio Ambiente", "Salud"] as const;

const intensities = [
  { label: "Lectura Rápida", desc: "~2 min · Titulares", value: "quick", icon: <Zap className="w-4 h-4" /> },
  { label: "Estándar", desc: "~5 min · Resumen", value: "standard", icon: <BookOpen className="w-4 h-4" /> },
  { label: "Análisis Profundo", desc: "~10 min · Completo", value: "deep", icon: <Globe className="w-4 h-4" /> },
] as const;

const frequencies = [
  { label: "Mañana", desc: "7–9 AM", value: "morning" },
  { label: "Mediodía", desc: "12–2 PM", value: "noon" },
  { label: "Noche", desc: "7–9 PM", value: "evening" },
  { label: "Tiempo Real", desc: "Push instant", value: "realtime" },
] as const;

const regions = [
  { label: "🇺🇸 EE.UU.", value: "us" },
  { label: "🇪🇸 España", value: "es" },
  { label: "🇦🇷 Argentina", value: "ar" },
  { label: "🇧🇷 Brasil", value: "br" },
  { label: "🇫🇷 Francia", value: "fr" },
  { label: "🇬🇧 UK", value: "uk" },
  { label: "🇩🇪 Alemania", value: "de" },
  { label: "🌍 Global", value: "global" },
] as const;

const tones = [
  { label: "Neutral", desc: "Sin opinión editorial", value: "neutral" },
  { label: "Analítico", desc: "Con contexto y datos", value: "analytical" },
  { label: "Opinión", desc: "Columnas con postura", value: "opinion" },
] as const;

const languages = [
  { label: "Español", value: "es" },
  { label: "English", value: "en" },
  { label: "Português", value: "pt" },
  { label: "Français", value: "fr" },
] as const;

const plans = [
  {
    value: "free",
    label: "Free",
    price: "Gratis",
    features: ["Titulares y resúmenes", "3 temas máximo", "1 región", "Digest diario"],
    limitations: ["Sin análisis profundo", "Sin alertas en tiempo real", "Sin selección de tono"],
  },
  {
    value: "full",
    label: "Full",
    price: "$4.99/mes",
    features: ["Todas las temáticas", "Todas las regiones", "Análisis profundo ilimitado", "Alertas en tiempo real", "Selección de tono y idioma", "Sin publicidad"],
    limitations: [],
  },
] as const;

const Preferences = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>(["Economía", "Tech"]);
  const [intensity, setIntensity] = useState("standard");
  const [frequency, setFrequency] = useState("morning");
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["ar", "global"]);
  const [tone, setTone] = useState("neutral");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["es"]);
  const [notifications, setNotifications] = useState({ breaking: true, digest: true, comments: false });
  const [deleting, setDeleting] = useState(false);

  const isFree = selectedPlan === "free";

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleSave = () => {
    toast.success("¡Preferencias guardadas!", {
      description: `Plan ${selectedPlan === "full" ? "Full" : "Free"} · ${selectedVerticals.length} temas · ${selectedRegions.length} regiones`,
    });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await signOut();
      toast.success("Cuenta eliminada. ¡Hasta pronto!");
      navigate("/");
    } catch {
      toast.error("Error al eliminar la cuenta.");
    } finally {
      setDeleting(false);
    }
  };

  const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-primary">{icon}</div>
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
    </div>
  );

  const ChipGrid = ({ items, selected, onToggle, cols = "grid-cols-5" }: { items: readonly { label: string; value: string }[]; selected: string[]; onToggle: (v: string) => void; cols?: string }) => (
    <div className={`grid ${cols} gap-2`}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onToggle(item.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
            selected.includes(item.value)
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {selected.includes(item.value) && <Check className="w-3 h-3" />}
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground mb-2">Personaliza tu Feed</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Ajustá todos los detalles de cómo consumís noticias.
          </p>

          <div className="space-y-10">
            {/* Plan */}
            <div>
              <SectionTitle icon={<Crown className="w-4 h-4" />} title="Tu Plan" />
              <div className="grid grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.value}
                    onClick={() => setSelectedPlan(plan.value)}
                    className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      selectedPlan === plan.value
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    {plan.value === "full" && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        PRO
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-bold text-foreground">{plan.label}</span>
                      <span className="text-xs text-muted-foreground">{plan.price}</span>
                    </div>
                    <ul className="space-y-1 mb-2">
                      {plan.features.map((f) => (
                        <li key={f} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.limitations.length > 0 && (
                      <ul className="space-y-1">
                        {plan.limitations.map((l) => (
                          <li key={l} className="text-xs text-destructive/70 flex items-start gap-1.5">
                            <span className="shrink-0 mt-0.5">✕</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Verticals */}
            <div>
              <SectionTitle icon={<BookOpen className="w-4 h-4" />} title="Temáticas" />
              <div className="flex flex-wrap gap-2">
                {verticals.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleItem(selectedVerticals, v, setSelectedVerticals)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      selectedVerticals.includes(v)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {selectedVerticals.includes(v) && <Check className="w-3.5 h-3.5" />}
                    {v}
                  </button>
                ))}
              </div>
              {isFree && <p className="text-xs text-muted-foreground mt-2">Plan Free: máximo 3 temáticas.</p>}
            </div>

            {/* Regions */}
            <div>
              <SectionTitle icon={<Globe className="w-4 h-4" />} title="Regiones de Interés" />
              <ChipGrid
                items={regions}
                selected={selectedRegions}
                onToggle={(v) => toggleItem(selectedRegions, v, setSelectedRegions)}
                cols="grid-cols-4"
              />
              {isFree && <p className="text-xs text-muted-foreground mt-2">Plan Free: máximo 1 región.</p>}
            </div>

            {/* Intensity */}
            <div className={isFree ? "opacity-60 pointer-events-none" : ""}>
              <SectionTitle icon={<Zap className="w-4 h-4" />} title="Intensidad de Lectura" />
              {isFree && <p className="text-xs text-muted-foreground mb-2">Disponible en el plan Full.</p>}
              <div className="grid grid-cols-3 gap-3">
                {intensities.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setIntensity(opt.value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      intensity === opt.value
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`mx-auto mb-2 ${intensity === opt.value ? "text-primary" : "text-muted-foreground"}`}>
                      {opt.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground block">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <SectionTitle icon={<Bell className="w-4 h-4" />} title="Frecuencia de Consumo" />
              <div className="grid grid-cols-4 gap-3">
                {frequencies.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => !isFree || opt.value !== "realtime" ? setFrequency(opt.value) : null}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      frequency === opt.value
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    } ${isFree && opt.value === "realtime" ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-sm font-medium text-foreground block">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    {isFree && opt.value === "realtime" && <span className="text-[10px] text-primary block mt-1">Full</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className={isFree ? "opacity-60 pointer-events-none" : ""}>
              <SectionTitle icon={<Palette className="w-4 h-4" />} title="Tono Preferido" />
              {isFree && <p className="text-xs text-muted-foreground mb-2">Disponible en el plan Full.</p>}
              <div className="grid grid-cols-3 gap-3">
                {tones.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      tone === opt.value
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground block">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <SectionTitle icon={<Globe className="w-4 h-4" />} title="Idiomas de Lectura" />
              <ChipGrid
                items={languages}
                selected={selectedLanguages}
                onToggle={(v) => toggleItem(selectedLanguages, v, setSelectedLanguages)}
                cols="grid-cols-4"
              />
            </div>

            {/* Notifications */}
            <div>
              <SectionTitle icon={<Bell className="w-4 h-4" />} title="Notificaciones" />
              <div className="space-y-3">
                {[
                  { key: "breaking" as const, label: "Breaking News", desc: "Alertas de noticias urgentes" },
                  { key: "digest" as const, label: "Resumen Diario", desc: "Compilado de tus temas" },
                  { key: "comments" as const, label: "Comentarios", desc: "Respuestas en foros" },
                ].map((n) => (
                  <button
                    key={n.key}
                    onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      notifications[n.key]
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/50 bg-secondary/30"
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-sm font-medium text-foreground block">{n.label}</span>
                      <span className="text-xs text-muted-foreground">{n.desc}</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${notifications[n.key] ? "bg-primary justify-end" : "bg-secondary justify-start"}`}>
                      <div className="w-5 h-5 bg-foreground rounded-full mx-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Guardar Preferencias
            </button>

            {/* Delete Account */}
            <div className="pt-6 border-t border-border/30">
              <h2 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Zona de Peligro
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Eliminar tu cuenta borra todos tus datos permanentemente. Esta acción no se puede deshacer.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-4 py-2.5 rounded-xl border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                    Eliminar mi cuenta
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará tu cuenta y todos tus datos de forma permanente. No podrás recuperarlos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Preferences;
