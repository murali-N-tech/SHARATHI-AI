import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y-100, opacity}}
      animate={{ y}}
      transition={{ duration.6, delay.2 }}
      className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale.09 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            <span className="gradient-text">SARATHI</span>
          </span>
        </motion.div>

        {/* CTA Button */}
        <motion.div whileHover={{ scale.05 }} whileTap={{ scale.95 }}>
          <Button
            className="gradient-primary text-primary-foreground font-semibold px-6 py-2 rounded-lg shadow-md hover-lg transition-all duration-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
