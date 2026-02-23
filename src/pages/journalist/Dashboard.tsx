import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, Eye, DollarSign, TrendingUp } from "lucide-react";

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
}

const Dashboard = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats>({ totalArticles: 0, totalReads: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

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

      if (articlesRes.data) setArticles(articlesRes.data);
      setStats({
        totalArticles: articlesRes.data?.length ?? 0,
        totalReads: profileRes.data?.total_reads ?? 0,
        totalEarnings: Number(profileRes.data?.total_earnings ?? 0),
      });
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const statCards = [
    { label: "Artículos", value: stats.totalArticles, icon: <FileText className="w-5 h-5" />, color: "text-primary" },
    { label: "Lecturas Totales", value: stats.totalReads, icon: <Eye className="w-5 h-5" />, color: "text-[hsl(var(--success))]" },
    { label: "Ingresos", value: `$${stats.totalEarnings.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: "text-[hsl(var(--warning))]" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Periodista</h1>
              <p className="text-sm text-muted-foreground">Gestiona tus artículos y métricas</p>
            </div>
            <Link
              to="/journalist/editor"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Artículo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className="bg-card border border-border/50 rounded-xl p-5">
                <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Articles list */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Tus Artículos
            </h2>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Cargando...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border/50 rounded-xl">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Todavía no tenés artículos.</p>
                <Link
                  to="/journalist/editor"
                  className="text-primary text-sm mt-2 inline-block hover:underline"
                >
                  Crear tu primer artículo →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/journalist/editor/${article.id}`}
                    className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{article.title}</h3>
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
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </Link>
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
