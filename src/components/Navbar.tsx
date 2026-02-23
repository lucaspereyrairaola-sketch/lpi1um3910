import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";

const Navbar = () => {
  const { user, role, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 glass"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gradient-brand">
            MIDIA
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            Lee el panorama completo.
          </span>

          {user ? (
            <>
              {role === "journalist" && (
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
                Preferencias
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/auth"
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
