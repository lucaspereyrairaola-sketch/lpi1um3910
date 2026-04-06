import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Send, Trash2, Sparkles, ChevronDown, ChevronUp,
  Eye, EyeOff, Clock, BarChart2, AlertCircle, CheckCircle2, Tag,
  DollarSign, Layers, FileText, Image, LayoutTemplate, StickyNote,
  Upload, X, Plus, GripVertical, AlignLeft, AlignRight, AlignCenter,
} from "lucide-react";

const AVAILABLE_TAGS = [
  "política", "economía", "deportes", "cultura", "tech",
  "ciencia", "salud", "internacional", "medio-ambiente", "educación",
];
const WORD_GOAL = 800;

export interface Perspective {
  id: string;
  label: string;
  icon: string;
  tone: string;
  content: string[];
  keyArguments: string[];
}

interface AdHocNote {
  id: string;
  text: string;
  createdAt: string;
}

type ArticleLayout = "top" | "left" | "right" | "behind";

// ── Helpers ───────────────────────────────────────────────
function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadTime(words: number) {
  return Math.max(1, Math.round(words / 200));
}

function titleStrength(title: string): { label: string; color: string; pct: number } {
  const len = title.trim().length;
  if (len === 0) return { label: "Escribí un título", color: "text-muted-foreground", pct: 0 };
  if (len < 20) return { label: "Muy corto", color: "text-destructive", pct: 20 };
  if (len < 40) return { label: "Mejorable", color: "text-[hsl(var(--warning))]", pct: 50 };
  if (len <= 70) return { label: "Ideal", color: "text-[hsl(var(--success))]", pct: 100 };
  return { label: "Muy largo", color: "text-[hsl(var(--warning))]", pct: 70 };
}

function avgWordsPerSentence(text: string): { label: string; color: string } {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return { label: "—", color: "text-muted-foreground" };
  const total = sentences.reduce((acc, s) => acc + countWords(s), 0);
  const avg = total / sentences.length;
  if (avg <= 15) return { label: "Fácil", color: "text-[hsl(var(--success))]" };
  if (avg <= 22) return { label: "Moderado", color: "text-[hsl(var(--warning))]" };
  return { label: "Complejo", color: "text-destructive" };
}

const LAYOUT_OPTIONS: { id: ArticleLayout; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "top", label: "Arriba", desc: "Imagen encima del texto", icon: <AlignCenter className="w-4 h-4" /> },
  { id: "left", label: "Izquierda", desc: "Imagen a la izquierda", icon: <AlignLeft className="w-4 h-4" /> },
  { id: "right", label: "Derecha", desc: "Imagen a la derecha", icon: <AlignRight className="w-4 h-4" /> },
  { id: "behind", label: "Fondo", desc: "Imagen de fondo con overlay", icon: <LayoutTemplate className="w-4 h-4" /> },
];

// ── Main component ─────────────────────────────────────────
const ArticleEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<"free" | "micropay" | "premium">("free");
  const [price, setPrice] = useState("0");
  const [perspectives, setPerspectives] = useState<Perspective[] | null>(null);
  const [showPerspectives, setShowPerspectives] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState<ArticleLayout>("top");
  const [notes, setNotes] = useState<AdHocNote[]>([]);
  const [newNote, setNewNote] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeSection, setActiveSection] = useState<"ai" | "tags" | "access" | "image" | "notes">("image");

  // Auto-save state
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load existing article
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
          setSubtitle((data as any).subtitle || "");
          setBody(data.body || "");
          setTags(data.tags || []);
          setAccessLevel(data.access_level as "free" | "micropay" | "premium");
          setPrice(String(data.price || 0));
          setImageUrl((data as any).image_url || null);
          setLayout(((data as any).layout as ArticleLayout) || "top");
          setNotes(((data as any).notes as AdHocNote[]) || []);
          if (data.perspectives) {
            setPerspectives(data.perspectives as unknown as Perspective[]);
            setShowPerspectives(true);
          }
        }
      });
  }, [id, user]);

  // Auto-save draft
  const performAutoSave = useCallback(async () => {
    if (!user || !title.trim() || !isEditing) return;
    setAutoSaving(true);
    try {
      await supabase
        .from("articles")
        .update({
          title: title.trim(),
          body,
          tags,
          perspectives: perspectives as any,
          subtitle,
          image_url: imageUrl,
          layout,
          notes: notes as any,
        } as any)
        .eq("id", id);
      setLastSaved(new Date());
    } catch {
      // silent
    } finally {
      setAutoSaving(false);
    }
  }, [user, title, body, tags, perspectives, id, isEditing, subtitle, imageUrl, layout, notes]);

  useEffect(() => {
    if (!isEditing) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(performAutoSave, 3000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [title, body, isEditing, performAutoSave]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // ── Image upload ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("La imagen no puede superar 5 MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("article-images")
        .getPublicUrl(path);

      setImageUrl(publicData.publicUrl);
      toast.success("Imagen subida correctamente");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al subir imagen";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => setImageUrl(null);

  // ── Notes ──
  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: newNote.trim(), createdAt: new Date().toISOString() },
    ]);
    setNewNote("");
  };

  const removeNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // ── Perspectives ──
  const handleGeneratePerspectives = async () => {
    if (!title.trim() || body.trim().length < 100) {
      toast.error("Necesitás título y al menos 100 caracteres para generar perspectivas.");
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error generando perspectivas";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Save ──
  const handleSave = async (publish: boolean) => {
    if (!user || !title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const articleData = {
        title: title.trim(),
        subtitle,
        body,
        tags,
        access_level: accessLevel as any,
        price: parseFloat(price) || 0,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
        journalist_id: user.id,
        perspectives: (perspectives as unknown as any) ?? null,
        image_url: imageUrl,
        layout,
        notes: notes as any,
      };
      if (isEditing) {
        const { error } = await supabase.from("articles").update(articleData as any).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(articleData as any);
        if (error) throw error;
      }
      toast.success(publish ? "¡Artículo publicado!" : "Borrador guardado");
      navigate("/journalist/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      toast.error(message);
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

  // Derived
  const wordCount = countWords(body);
  const wordGoalPct = Math.min(100, (wordCount / WORD_GOAL) * 100);
  const readTime = estimateReadTime(wordCount);
  const titleInfo = titleStrength(title);
  const readability = avgWordsPerSentence(body);
  const canGenerate = title.trim().length > 0 && body.trim().length >= 100;

  // ── Layout preview renderer ──
  const renderLayoutPreview = () => {
    const imgEl = imageUrl ? (
      <img src={imageUrl} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
    ) : (
      <div className="w-full h-48 bg-secondary/50 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center">
        <Image className="w-8 h-8 text-muted-foreground/40" />
      </div>
    );

    const textEl = (
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground leading-tight">
          {title || <span className="text-muted-foreground">Título del artículo</span>}
        </h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <p className="text-xs text-muted-foreground line-clamp-3">
          {body || "El contenido del artículo aparecerá aquí…"}
        </p>
      </div>
    );

    switch (layout) {
      case "left":
        return <div className="grid grid-cols-2 gap-4">{imgEl}{textEl}</div>;
      case "right":
        return <div className="grid grid-cols-2 gap-4">{textEl}{imgEl}</div>;
      case "behind":
        return (
          <div className="relative rounded-lg overflow-hidden h-56">
            {imageUrl ? (
              <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {title || "Título del artículo"}
                </h2>
                {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
              </div>
            </div>
          </div>
        );
      default: // top
        return <div className="space-y-4">{imgEl}{textEl}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Toolbar */}
      <div className="sticky top-16 z-40 glass border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/journalist/dashboard")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Panel</span>
            </button>
            <div className="h-4 w-px bg-border/50" />
            {isEditing && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {autoSaving ? (
                  <><Save className="w-3 h-3 animate-pulse text-primary" /> Guardando…</>
                ) : lastSaved ? (
                  <><CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))]" /> Guardado</>
                ) : (
                  <><FileText className="w-3 h-3" /> Borrador</>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                previewMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{previewMode ? "Editar" : "Preview"}</span>
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Borrador</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !title.trim()}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Publicar
            </button>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ── PREVIEW MODE ── */}
          {previewMode ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-4 bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[hsl(var(--warning))]" />
                <p className="text-xs text-[hsl(var(--warning))]">Vista previa — así verán tu artículo los lectores</p>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Layout-aware preview */}
              {renderLayoutPreview()}

              {/* Notes */}
              {notes.length > 0 && (
                <div className="mt-8 border-t border-border/50 pt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" /> Notas editoriales
                  </h3>
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-[hsl(var(--warning))]/5 border border-[hsl(var(--warning))]/20 rounded-lg px-4 py-3">
                        <p className="text-sm text-foreground">{note.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(note.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-6 mb-8 pb-6 border-b border-border/50">
                <span>{new Date().toLocaleDateString("es-ES", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min de lectura</span>
                <span>{wordCount} palabras</span>
              </div>

              <div className="space-y-4">
                {body ? (
                  body.split("\n").filter(Boolean).map((p, i) => (
                    <p key={i} className="text-base text-secondary-foreground leading-relaxed">{p}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">El contenido del artículo aparecerá aquí…</p>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── EDIT MODE ── */
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* ── LEFT: Editor ── */}
              <div className="lg:col-span-2 space-y-5">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Título</label>
                    <span className={`text-xs font-medium ${titleInfo.color}`}>
                      {titleInfo.label} · {title.length} caracteres
                    </span>
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3.5 text-foreground text-xl font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="El título define si te leen o no…"
                  />
                  <div className="mt-1.5 h-1 bg-border/40 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-all ${
                        titleInfo.pct === 100 ? "bg-[hsl(var(--success))]" : titleInfo.pct >= 50 ? "bg-[hsl(var(--warning))]" : "bg-destructive"
                      }`}
                      animate={{ width: `${titleInfo.pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bajada / Subtítulo</label>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="Una línea que complementa el título y engancha al lector…"
                  />
                </div>

                {/* Image upload zone */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Imagen de portada</label>
                  {imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-border/50">
                      <img src={imageUrl} alt="Cover" className="w-full h-56 object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/90 text-foreground px-3 py-2 rounded-lg text-xs font-medium hover:bg-white transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 inline mr-1" /> Cambiar
                        </button>
                        <button
                          onClick={removeImage}
                          className="bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-lg text-xs font-medium hover:bg-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5 inline mr-1" /> Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-40 border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary/80 transition-colors"
                    >
                      {uploading ? (
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs font-medium">Subir imagen (máx 5 MB)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Layout preview mini */}
                {imageUrl && (
                  <div className="bg-card border border-border/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <LayoutTemplate className="w-3.5 h-3.5" /> Vista previa del layout
                      </h3>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border/30">
                      {renderLayoutPreview()}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Contenido</label>
                    <span className="text-xs text-muted-foreground">{wordCount} palabras · {readTime} min</span>
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={22}
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed transition-all"
                    placeholder="Contá la historia. Sé claro, específico y original.&#10;&#10;Los mejores artículos en MIDIA tienen entre 600 y 1200 palabras."
                  />
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progreso hacia {WORD_GOAL} palabras</span>
                      <span className={wordCount >= WORD_GOAL ? "text-[hsl(var(--success))] font-medium" : ""}>
                        {wordCount >= WORD_GOAL ? "✓ Meta alcanzada" : `${WORD_GOAL - wordCount} restantes`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          wordGoalPct >= 100 ? "bg-[hsl(var(--success))]" : wordGoalPct >= 60 ? "bg-primary" : "bg-muted-foreground/50"
                        }`}
                        animate={{ width: `${wordGoalPct}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Tools sidebar ── */}
              <div className="space-y-4">
                {/* Metrics card */}
                <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Métricas del artículo</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Palabras", value: wordCount, icon: <FileText className="w-3.5 h-3.5" />, highlight: wordCount >= WORD_GOAL },
                      { label: "Lectura", value: `${readTime} min`, icon: <Clock className="w-3.5 h-3.5" />, highlight: false },
                      { label: "Legibilidad", value: readability.label, icon: <BarChart2 className="w-3.5 h-3.5" />, highlight: false, customColor: readability.color },
                      { label: "Perspectivas", value: perspectives ? perspectives.length : "—", icon: <Layers className="w-3.5 h-3.5" />, highlight: !!perspectives },
                    ].map((m) => (
                      <div key={m.label} className="bg-secondary/40 rounded-lg p-2.5">
                        <div className={`flex items-center gap-1 mb-1 ${m.customColor ?? (m.highlight ? "text-[hsl(var(--success))]" : "text-muted-foreground")}`}>
                          {m.icon}
                          <span className="text-[10px] font-medium uppercase tracking-wider">{m.label}</span>
                        </div>
                        <p className={`text-base font-semibold ${m.customColor ?? (m.highlight ? "text-[hsl(var(--success))]" : "text-foreground")}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section tabs */}
                <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 flex-wrap">
                  {([
                    { id: "image" as const, label: "Layout", icon: <Image className="w-3.5 h-3.5" /> },
                    { id: "notes" as const, label: "Notas", icon: <StickyNote className="w-3.5 h-3.5" /> },
                    { id: "ai" as const, label: "IA", icon: <Sparkles className="w-3.5 h-3.5" /> },
                    { id: "tags" as const, label: "Tags", icon: <Tag className="w-3.5 h-3.5" /> },
                    { id: "access" as const, label: "Acceso", icon: <DollarSign className="w-3.5 h-3.5" /> },
                  ]).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors min-w-0 ${
                        activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.icon}
                      <span className="hidden xl:inline">{s.label}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Layout picker ── */}
                  {activeSection === "image" && (
                    <motion.div key="image" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-card border border-border/50 rounded-xl p-4 space-y-3"
                    >
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Disposición de imagen
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {LAYOUT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setLayout(opt.id)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                              layout === opt.id ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                            }`}
                          >
                            {opt.icon}
                            <span className="text-xs font-medium text-foreground">{opt.label}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                      {!imageUrl && (
                        <p className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          Subí una imagen arriba para ver el layout en acción.
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* ── Ad-hoc Notes ── */}
                  {activeSection === "notes" && (
                    <motion.div key="notes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-card border border-border/50 rounded-xl p-4 space-y-3"
                    >
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Notas ad-hoc ({notes.length})
                      </h3>
                      <div className="flex gap-2">
                        <input
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addNote()}
                          className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          placeholder="Agregar nota…"
                        />
                        <button
                          onClick={addNote}
                          disabled={!newNote.trim()}
                          className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {notes.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notes.map((note) => (
                            <div key={note.id} className="bg-secondary/40 rounded-lg p-3 group relative">
                              <p className="text-xs text-foreground pr-6">{note.text}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(note.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                              <button
                                onClick={() => removeNote(note.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-opacity"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Las notas te ayudan a registrar ideas, fuentes o recordatorios sobre el artículo.</p>
                      )}
                    </motion.div>
                  )}

                  {/* ── AI Perspectives ── */}
                  {activeSection === "ai" && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-card border border-border/50 rounded-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-border/30 bg-primary/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-semibold text-foreground">Perspectivas con IA</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {perspectives ? `${perspectives.length} perspectivas generadas` : "Generá perspectivas automáticas desde tu artículo"}
                        </p>
                      </div>
                      <div className="p-4 space-y-3">
                        {!canGenerate && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Necesitás al menos un título y 100 caracteres de contenido</span>
                          </div>
                        )}
                        <button
                          onClick={handleGeneratePerspectives}
                          disabled={generating || !canGenerate}
                          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          {generating ? "Generando…" : perspectives ? "Regenerar" : "Generar perspectivas"}
                        </button>
                        {perspectives && (
                          <>
                            <button
                              onClick={() => setShowPerspectives(!showPerspectives)}
                              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                            >
                              Ver resultado
                              {showPerspectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <AnimatePresence>
                              {showPerspectives && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                                  {perspectives.map((p) => (
                                    <div key={p.id} className="bg-secondary/40 rounded-lg p-3 border border-border/50">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-base">{p.icon}</span>
                                        <span className="text-xs font-semibold text-foreground">{p.label}</span>
                                        <span className="text-[10px] text-muted-foreground ml-auto">{p.tone}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.content[0]}</p>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {p.keyArguments.slice(0, 2).map((arg, i) => (
                                          <span key={i} className="text-[10px] bg-background px-1.5 py-0.5 rounded text-muted-foreground">{arg}</span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ── Tags ── */}
                  {activeSection === "tags" && (
                    <motion.div key="tags" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-card border border-border/50 rounded-xl p-4"
                    >
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tags ({tags.length} seleccionados)</h3>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_TAGS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                              tags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      {tags.length === 0 && <p className="text-xs text-muted-foreground mt-3">Al menos 1 tag ayuda a que te encuentren lectores.</p>}
                    </motion.div>
                  )}

                  {/* ── Access level ── */}
                  {activeSection === "access" && (
                    <motion.div key="access" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-card border border-border/50 rounded-xl p-4 space-y-3"
                    >
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modelo de acceso</h3>
                      <div className="space-y-2">
                        {[
                          { id: "free" as const, label: "Gratuito", desc: "Acceso libre para todos", icon: "🌐" },
                          { id: "micropay" as const, label: "Micropago", desc: "Pago único por artículo", icon: "💳" },
                          { id: "premium" as const, label: "Premium", desc: "Solo suscriptores", icon: "⭐" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setAccessLevel(opt.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                              accessLevel === opt.id ? "border-primary bg-primary/10" : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                            }`}
                          >
                            <span className="text-lg">{opt.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {accessLevel === "micropay" && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Precio (USD)</label>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            step="0.5"
                            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                      )}
                      {accessLevel !== "free" && (
                        <div className="bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 rounded-lg p-3">
                          <p className="text-xs text-[hsl(var(--success))] font-medium mb-0.5">Ingreso estimado por 100 lecturas</p>
                          <p className="text-sm font-bold text-[hsl(var(--success))]">
                            {accessLevel === "micropay" ? `$${(parseFloat(price || "0") * 100 * 0.7).toFixed(2)}` : "Según tu plan de suscripción"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">70% para vos · 30% para MIDIA</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ArticleEditor;
