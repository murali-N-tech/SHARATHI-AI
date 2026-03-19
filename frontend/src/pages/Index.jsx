import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import IntroAnimation from "../components/IntroAnimation";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import DomainCards from "../components/DomainCards";
import GamifiedSection from "../components/GamifiedSection";
import Footer from "../components/Footer";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // If nav set a flag to scroll to domains after mounting, wait for intro then scroll
    if (location.state?.scrollToDomains) {
      const tryScroll = () => {
        const el = document.getElementById('domains');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          // clear history state to avoid repeated scrolls
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
        return false;
      };

      const id = setInterval(() => {
        if (tryScroll()) clearInterval(id);
      }, 150);
      // stop retry after 5s
      setTimeout(() => clearInterval(id), 5000);
    }
  }, [location]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>
      {!showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background"
        >
          <Navbar />
          <main>
            <HeroSection />
            <DomainCards />
            <GamifiedSection />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  );
};

export default Index;
