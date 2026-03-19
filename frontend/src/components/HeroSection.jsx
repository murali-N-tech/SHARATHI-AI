import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Star, Trophy, Flame, Zap } from "lucide-react";

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = ["/1.png", "/2.png", "/3.png"];

  // Rotate images every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const floatingIcons = [
    { icon: Star, x: "10%", y: "20%", color: "text-primary" },
    { icon: Flame, x: "85%", y: "15%", color: "text-secondary" },
    { icon: Trophy, x: "5%", y: "70%", color: "text-yellow-500" },
    { icon: Zap, x: "90%", y: "65%", color: "text-green-500" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20 bg-background">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
        ))}
      </div>



      {/* Light Whiter Overlay Layer */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      <div className="absolute inset-0 neural-grid opacity-10" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute hidden md:block"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [-10, 10] }}
            transition={{ duration: 3 + index * 0.5, repeat: Infinity, repeatType: "mirror" }}
            className="p-4 bg-card rounded-2xl shadow-lg border border-border card-shadow"
          >
            <item.icon className={`w-8 h-8 ${item.color}`} />
          </motion.div>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10 -mt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Gamified Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-300 shadow-md mb-12"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-black font-medium">Level Up Your Learning</span>
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-primary/10 rounded-full">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-primary">+500 XP</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 drop-shadow-lg -mt-8"
          >
            <motion.span
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="inline-block gradient-text gradient-wave"
              style={{ animationDelay: "0s" }}
            >
              AI-Powered {"  "}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="inline-block gradient-text gradient-wave"
              style={{ animationDelay: "0.5s" }}
            >
              Adaptive
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="inline-block gradient-text gradient-wave"
              style={{ animationDelay: "1s" }}
            >
              Assessments for{" "}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
              className="inline-block gradient-text gradient-wave"
              style={{ animationDelay: "1.5s" }}
            >
              Smarter Learning
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-black max-w-2xl mx-auto mb-10 drop-shadow-md"
          >
            Experience personalized assessments that adapt in real-time to your performance, 
            creating the perfect learning path tailored just for you.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-brand-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:bg-brand-700"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Start Your Quest
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-brand-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:bg-brand-700"
              >
                <Zap className="w-5 h-5 mr-2" />
                Watch Demo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Gamified Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-4 md:gap-8 mt-20 max-w-2xl mx-auto"
          >
            {[
              { value: "50K+", label: "Active Learners", Icon: Star, color: "text-yellow-500" },
              { value: "1M+", label: "Quests Completed", Icon: Trophy, color: "text-primary" },
              { value: "98%", label: "Success Rate", Icon: Flame, color: "text-green-500" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 bg-white rounded-xl border border-gray-300 shadow-md"
              >
                <stat.Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="font-display text-2xl md:text-3xl font-bold text-black">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-black rounded-full flex items-start justify-center p-1"
        >
          <motion.div
            className="w-1.5 h-3 bg-black rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
