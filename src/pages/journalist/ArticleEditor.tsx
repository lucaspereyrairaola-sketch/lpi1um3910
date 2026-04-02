import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Send, Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const AVAILABLE_TAGS = ["política", "economía", "deportes", "cultura", "tech", "ciencia", "salud", "internacional", "medio-ambiente", "educación"];

export interface Perspective {
  id: string;
  label: string;
  icon: string;
  tone: string;
  content: string[];
  keyArguments: string[];
}

const ArticleEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<"free" | "micropay" | "premium">("free");
  const [price, setPrice] = useState("0");
  const [saving, setSaving] = useState(false);
  const [perspectives, setPerspectives] = useState<Perspective[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPerspectives, setShowPerspectives] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .eq("journalist_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setBody(data.body || "");
          setTags(data.tags || []);
          setAccessLevel(data.access_level as any);
          setPrice(String(data.price || 0));
          if (data.perspectives) {
            setPerspectives(data.perspectives as unknown as Perspective[]);
            setShowPerspectives(true);
          }
        }
      });
  }, [id, user]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleGeneratePerspectives = async () => {
    if (!title.trim() || body.trim().length < 100) {
      toast.error("El artículo necesita título y al menos 100 caracteres para generar perspectivas.");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-perspectives", {
        body: { title: title.trim(), body: body.trim() },
      });

      if (error) throw error;
      if (!data?.perspectives) throw new Error("Respuesta inválida del servidor");

      setPerspectives(data.perspectives);
      setShowPerspectives(true);
      toast.success("¡Perspectivas generadas!");
    } catch (err: any) {
      toast.error(err.message || "Error generando perspectivas");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!user || !title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const articleData = {
        title: title.trim(),
        body,
        tags,
        access_level: accessLevel as any,
        price: parseFloat(price) || 0,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
        journalist_id: user.id,
        perspectives: perspectives ?? null,
      };

      if (isEditing) {
        const { error } = await supabase.from("articles").update(articleData).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(articleData);
        if (error) throw error;
      }

      toast.success(publish ? "¡Artículo publicado!" : "Borrador guardado");
      navigate("/journalist/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("¿Estás seguro de eliminar este artículo?");
    if (!confirmed) return;
    await supabase.from("articles").delete().eq("id", id);
    toast.success("Artículo eliminado");
    navigate("/journalist/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate("/journalist/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-6">
            {isEditing ? "Editar Artículo" : "Nuevo Artículo"}
          </h1>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-foreground text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Título del artículo"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contenido</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={15}
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Escribe tu artículo aquí..."
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {body.trim().split(/\s+/).filter(Boolean).length} palabras
              </p>
            </div>

            {/* Generate perspectives */}
            <div className="border border-dashed border-primary/40 rounded-xl p-5 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Perspectivas con IA
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {perspectives
                      ? `${perspectives.length} perspectivas generadas`
                      : "Generá 3 perspectivas automáticamente con Claude"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {perspectives && (
                    <button
                      onClick={() => setShowPerspectives(!showPerspectives)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {showPerspectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showPerspectives ? "Ocultar" : "Ver"}
                    </button>
                  )}
                  <button
                    onClick={handleGeneratePerspectives}
                    disabled={generating || body.trim().length < 100}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generating ? "Generando..." : perspectives ? "Regenerar" : "Generar"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showPerspectives && perspectives && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    {perspectives.map((p) => (
                      <div key={p.id} className="bg-background/60 rounded-lg p-4 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{p.icon}</span>
                          <span className="text-sm font-medium text-foreground">{p.label}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{p.tone}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {p.content[0]}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.keyArguments.map((arg, i) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
                              {arg}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      tags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Access level */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Modelo de Acceso</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "free" as const, label: "Gratuito", desc: "Acceso libre" },
                  { id: "micropay" as const, label: "Micropago", desc: "Pago por artículo" },
                  { id: "premium" as const, label: "Premium", desc: "Solo suscriptores" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setAccessLevel(opt.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      accessLevel === opt.id
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

            {accessLevel === "micropay" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Precio (USD)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.5"
                  className="w-full max-w-[200px] bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar Borrador
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Publicar
              </button>
              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-destructive hover:text-destructive/80 px-4 py-2.5 text-sm ml-auto transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArticleEditor;
