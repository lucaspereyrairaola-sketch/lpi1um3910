import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LayoutDashboard, Settings, PenTool, BookOpen, ChevronRight } from "lucide-react";

const Navbar = () => {
  const { user, roles, activeMode, switchMode, signOut } = useAuth();
  const navigate = useNavigate();

  const isJournalist = roles.includes("journalist");
  const hasBothRoles = isJournalist; // reader is default; journalist is additive

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 glass"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? "/feed" : "/"} className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gradient-brand">MIDIA</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Mode toggle — only visible when user has journalist role */}
              {hasBothRoles && (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center bg-secondary/60 rounded-full p-1 gap-0.5"
                  >
                    <button
                      onClick={() => { switchMode("reader"); navigate("/feed"); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        activeMode === "reader"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Lector
                    </button>
                    <button
                      onClick={() => switchMode("journalist")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        activeMode === "journalist"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      Autor
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Activate author — only when user does NOT have journalist role yet */}
              {!isJournalist && (
                <button
                  onClick={() => navigate("/journalist/onboarding")}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border/50 hover:border-primary/50 hover:text-primary rounded-full px-3 py-1.5 transition-all"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Ser autor
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}

              {/* Journalist panel — only in journalist mode */}
              {isJournalist && activeMode === "journalist" && (
                <Link
                  to="/journalist/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Panel
                </Link>
              )}

              <Link
                to="/preferences"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preferencias</span>
              </Link>

              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
