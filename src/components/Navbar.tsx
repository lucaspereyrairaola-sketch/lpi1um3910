import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
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

        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground hidden sm:block">
            Read the full picture.
          </span>
          <Link
            to="/preferences"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Preferences
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
