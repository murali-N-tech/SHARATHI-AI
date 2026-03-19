import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Star, Trophy, Zap } from "lucide-react";

const IntroAnimation = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const [particles] = useState(() => {
    return [...Array(15)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 4 + Math.random() * 2,
        delay: Math.random() * 2,
    }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 500);
      }, 200);
    }
  }, [progress, onComplete]);

  const gamifiedIcons = [
    { Icon: Star, color: "text-yellow-500", delay: 0 },
    { Icon: Trophy, color: "text-primary", delay: 0.2 },
    { Icon: Sparkles, color: "text-secondary", delay: 0.4 },
    { Icon: Zap, color: "text-green-500", delay: 0.6 },
  ];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated Gradient Overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          {/* Animated Background Pattern */}
          <div className="absolute inset-0 neural-grid opacity-20" />
          
          {/* Floating Particles with More Visibility */}
          <div className="absolute inset-0">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary"
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: "4px",
                  height: "4px",
                }}
                animate={{
                  y: [-80, 80],
                  opacity: [0, 1, 0],
                  scale: [0.5, 2, 0.5],
                  boxShadow: [
                    "0 0 10px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.8)",
                    "0 0 10px rgba(59, 130, 246, 0.5)",
                  ],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: particle.delay,
                }}
              />
            ))}
          </div>

          {/* Primary Glowing Orbs with More Effect */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-primary/25 to-transparent blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.7, 0.4],
              x: [0, 50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
          
          {/* Secondary Glowing Orbs */}
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-primary/25 to-transparent blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -50, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "mirror",
              delay: 1,
            }}
          />

          {/* Tertiary Accent Orb */}
          <motion.div
            className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-transparent blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />

          {/* Main Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* SARATHI Text - Positioned Higher */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="-mt-20"
            >
              <h1 className="font-display text-7xl md:text-8xl font-bold tracking-tight text-brand-700">
                SARATHI
              </h1>
            </motion.div>

            {/* Logo Image with Grow Animation (Small to Big) */}
            <motion.div
              initial={{ scale: 0, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="pt-4"
            >
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  scale: [0.98, 1.02, 0.98],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              >
                <img 
                  src="/SARATHI-Picsart-BackgroundRemover.jpg" 
                  alt="SARATHI Logo" 
                  className="h-48 md:h-56 mx-auto object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>

            {/* Platform Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground font-light pt-4"
            >
              AI-Powered Adaptive Assessments
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
