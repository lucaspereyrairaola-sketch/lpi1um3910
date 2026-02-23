import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Layers, Eye, EyeOff } from "lucide-react";

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
        navigate("/");
      } else {
        await signUp(email, password, displayName, selectedRole);
        
        // After signup, we need to wait for auth state to update, then assign role
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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Layers className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold text-gradient-brand">MIDIA</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta en MIDIA"}
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Role selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    ¿Cómo usarás MIDIA?
                  </label>
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
              </>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Email
              </label>
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
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Contraseña
              </label>
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
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
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
  );
};

export default Auth;
