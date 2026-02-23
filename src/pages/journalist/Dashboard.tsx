import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, Eye, DollarSign, TrendingUp, Clock, BarChart3, PenTool, Send, Archive } from "lucide-react";

interface Article {
  id: string;
  title: string;
  published: boolean;
  access_level: string;
  created_at: string;
  tags: string[];
}

interface Stats {
  totalArticles: number;
  totalReads: number;
  totalEarnings: number;
  published: number;
  drafts: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats>({ totalArticles: 0, totalReads: 0, totalEarnings: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [articlesRes, profileRes] = await Promise.all([
        supabase
          .from("articles")
          .select("id, title, published, access_level, created_at, tags")
          .eq("journalist_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("journalist_profiles")
          .select("total_earnings, total_reads")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const arts = articlesRes.data ?? [];
      setArticles(arts);
      setStats({
        totalArticles: arts.length,
        totalReads: profileRes.data?.total_reads ?? 0,
        totalEarnings: Number(profileRes.data?.total_earnings ?? 0),
        published: arts.filter((a) => a.published).length,
        drafts: arts.filter((a) => !a.published).length,
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const filteredArticles = articles.filter((a) => {
    if (filter === "published") return a.published;
    if (filter === "draft") return !a.published;
    return true;
  });

  const statCards = [
    { label: "Artículos", value: stats.totalArticles, icon: <FileText className="w-5 h-5" />, color: "text-primary" },
    { label: "Publicados", value: stats.published, icon: <Send className="w-5 h-5" />, color: "text-[hsl(var(--success))]" },
    { label: "Borradores", value: stats.drafts, icon: <Archive className="w-5 h-5" />, color: "text-muted-foreground" },
    { label: "Lecturas", value: stats.totalReads, icon: <Eye className="w-5 h-5" />, color: "text-[hsl(var(--warning))]" },
    { label: "Ingresos", value: `$${stats.totalEarnings.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: "text-[hsl(var(--success))]" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Periodista</h1>
              <p className="text-sm text-muted-foreground">Gestiona tu contenido y métricas</p>
            </div>
            <Link
              to="/journalist/editor"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Artículo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {statCards.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-xl p-5"
              >
                <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Link
              to="/journalist/editor"
              className="bg-card border border-border/50 rounded-xl p-5 hover:bg-card/80 transition-colors group"
            >
              <PenTool className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-medium text-foreground">Crear Artículo</h3>
              <p className="text-xs text-muted-foreground mt-1">Escribe y publica nuevo contenido</p>
            </Link>
            <div className="bg-card border border-border/50 rounded-xl p-5 opacity-60">
              <BarChart3 className="w-5 h-5 text-[hsl(var(--warning))] mb-3" />
              <h3 className="text-sm font-medium text-foreground">Analíticas</h3>
              <p className="text-xs text-muted-foreground mt-1">Rendimiento detallado (próximamente)</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5 opacity-60">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--success))] mb-3" />
              <h3 className="text-sm font-medium text-foreground">Monetización</h3>
              <p className="text-xs text-muted-foreground mt-1">Ingresos y pagos (próximamente)</p>
            </div>
          </div>

          {/* Articles list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Tus Artículos
              </h2>
              <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                {(["all", "published", "draft"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "all" ? "Todos" : f === "published" ? "Publicados" : "Borradores"}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Cargando...</div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border/50 rounded-xl">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {filter === "all" ? "Todavía no tenés artículos." : `No hay artículos ${filter === "published" ? "publicados" : "en borrador"}.`}
                </p>
                <Link to="/journalist/editor" className="text-primary text-sm mt-2 inline-block hover:underline">
                  Crear tu primer artículo →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/journalist/editor/${article.id}`}
                      className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${article.published ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" : "bg-secondary text-muted-foreground"}`}>
                            {article.published ? "Publicado" : "Borrador"}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">{article.access_level}</span>
                          {article.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(article.created_at).toLocaleDateString("es-ES")}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
