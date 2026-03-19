import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Star, Zap, Trophy, Target, Flame, ArrowRight } from "lucide-react";
import { DOMAINS } from "../utils/domains";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom"; // Import Added

// Transform domains data to include gamification stats
const domains = DOMAINS.map((domain, index) => {
  const mockStats = [
    { questions: "500+", level: 8, progress: 72, xp: 15000, streak: 12, badges: 8 },
    { questions: "450+", level: 6, progress: 58, xp: 12000, streak: 8, badges: 6 },
    { questions: "600+", level: 10, progress: 85, xp: 20000, streak: 15, badges: 12 },
    { questions: "400+", level: 5, progress: 45, xp: 10000, streak: 6, badges: 5 },
    { questions: "550+", level: 9, progress: 78, xp: 18000, streak: 14, badges: 10 },
    { questions: "520+", level: 7, progress: 65, xp: 14000, streak: 10, badges: 7 },
    { questions: "480+", level: 6, progress: 55, xp: 11500, streak: 7, badges: 6 },
    { questions: "530+", level: 8, progress: 70, xp: 16000, streak: 11, badges: 9 },
    { questions: "470+", level: 7, progress: 62, xp: 13000, streak: 9, badges: 7 },
    { questions: "510+", level: 8, progress: 68, xp: 15500, streak: 11, badges: 8 },
    { questions: "490+", level: 7, progress: 60, xp: 12500, streak: 8, badges: 7 },
    { questions: "440+", level: 5, progress: 50, xp: 10500, streak: 6, badges: 5 },
    { questions: "540+", level: 8, progress: 73, xp: 16500, streak: 12, badges: 9 },
    { questions: "500+", level: 7, progress: 64, xp: 14500, streak: 10, badges: 8 },
    { questions: "460+", level: 6, progress: 52, xp: 11000, streak: 7, badges: 6 },
    { questions: "480+", level: 6, progress: 56, xp: 12000, streak: 8, badges: 6 },
  ];
  
  const stats = mockStats[index % mockStats.length];
  
  // Convert color classes to gradient format
  const colorMap = {
    'text-blue-500': 'from-blue-500 to-blue-600',
    'text-emerald-500': 'from-emerald-500 to-emerald-600',
    'text-slate-500': 'from-slate-500 to-slate-600',
    'text-violet-500': 'from-violet-500 to-violet-600',
    'text-indigo-500': 'from-indigo-500 to-indigo-600',
    'text-rose-500': 'from-rose-500 to-rose-600',
    'text-cyan-500': 'from-cyan-500 to-cyan-600',
    'text-orange-500': 'from-orange-500 to-orange-600',
    'text-red-500': 'from-red-500 to-red-600',
    'text-yellow-500': 'from-yellow-500 to-yellow-600',
    'text-teal-500': 'from-teal-500 to-teal-600',
    'text-pink-500': 'from-pink-500 to-pink-600',
    'text-gray-600': 'from-gray-500 to-gray-600',
    'text-amber-600': 'from-amber-500 to-amber-600',
    'text-green-600': 'from-green-500 to-green-600',
    'text-purple-600': 'from-purple-500 to-purple-600',
  };
  
  return {
    ...domain,
    ...stats,
    color: colorMap[domain.color] || 'from-blue-500 to-blue-600',
    bgColor: domain.bg,
  };
});

const DomainCards = () => {
  const containerRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Get all domains for the carousel
  const carouselDomains = [...domains, ...domains];
  
  // Show 8 cards (2 rows of 4) initially, or all if expanded
  const displayedCards = showAll ? domains : domains.slice(0, 8);

  const handleStartAssessment = (domainId) => {
    if (!domainId) return;
    navigate(`/assessment/${domainId}`);
  };

  return (
    <section ref={containerRef} className="py-24 relative bg-background">
      {/* Background */}
      <div className="absolute inset-0 gradient-light" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-md mb-4">
            <Target className="w-4 h-4 text-brand-600" />
            <span className="text-sm text-foreground font-medium">Choose Your Path</span>
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-brand-600">Master Any Subject</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose from multiple learning domains and track your progress with gamified assessments
          </p>
        </motion.div>

        {/* Auto-scrolling Domain Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <h3 className="text-center text-3xl font-bold text-foreground mb-10">
            Explore <span className="text-brand-600">All Domains</span>
          </h3>
          
          {/* Row 1 - Scroll Left */}
          <div className="overflow-hidden mb-8 bg-gradient-to-r from-background via-transparent to-background py-6 rounded-2xl border border-border/50">
            <motion.div
              className="flex gap-6 min-w-max"
              animate={{ x: [0, -2500] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {carouselDomains.map((domain, index) => (
                <motion.div
                  key={`row1-${index}`}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="flex-shrink-0 group cursor-pointer"
                  onClick={() => handleStartAssessment(domain.id)}
                >
                  <div className="flex flex-col items-center gap-3 px-8 py-4 bg-gradient-to-br from-card to-card border border-border/50 rounded-2xl shadow-md hover:shadow-lg hover:border-brand-600/50 transition-all duration-300 min-w-fit">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      {domain.icon && <domain.icon className="w-7 h-7 text-white" />}
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm">{domain.title}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Scroll Right */}
          <div className="overflow-hidden bg-gradient-to-r from-background via-transparent to-background py-6 rounded-2xl border border-border/50">
            <motion.div
              className="flex gap-6 min-w-max"
              animate={{ x: [-2500, 0] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {carouselDomains.map((domain, index) => (
                <motion.div
                  key={`row2-${index}`}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="flex-shrink-0 group cursor-pointer"
                  onClick={() => handleStartAssessment(domain.id)}
                >
                  <div className="flex flex-col items-center gap-3 px-8 py-4 bg-gradient-to-br from-card to-card border border-border/50 rounded-2xl shadow-md hover:shadow-lg hover:border-brand-600/50 transition-all duration-300 min-w-fit">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      {domain.icon && <domain.icon className="w-7 h-7 text-white" />}
                    </div>
                    <span className="font-semibold text-foreground text-center text-sm">{domain.title}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Domain Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h3 className="text-center text-3xl font-bold text-foreground mb-12">
            Featured <span className="text-brand-600">Domains</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayedCards.map((domain, index) => (
              <motion.div
                key={domain.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                whileHover={{ y: -15, scale: 1.03 }}
                className="group cursor-pointer h-full"
                onClick={() => handleStartAssessment(domain.id)}
              >
                <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-8 h-full border border-border shadow-lg hover:shadow-2xl hover:border-brand-600/50 transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${domain.color} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`} />
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.15 }}
                      className={`w-20 h-20 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center shadow-lg mb-4 mx-auto`}
                    >
                      {domain.icon && <domain.icon className="w-10 h-10 text-white" />}
                    </motion.div>
                    
                    <h3 className="font-display text-xl font-semibold text-center text-foreground mb-2">
                      {domain.title}
                    </h3>
                    <p className="text-sm text-center text-muted-foreground mb-6">{domain.questions} Questions</p>

                    <div className={`${domain.bgColor} rounded-lg p-3 mb-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Level {domain.level}</span>
                        <span className="text-sm font-bold text-brand-600">{domain.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${domain.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={`h-full bg-gradient-to-r ${domain.color} rounded-full`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-brand-600/10 to-brand-600/5 rounded-lg p-3 text-center border border-brand-600/20"
                      >
                        <div className="flex items-center justify-center gap-1 text-brand-600 mb-1">
                          <Zap className="w-4 h-4" />
                          <span className="font-bold text-sm">{(domain.xp / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="text-xs text-muted-foreground">XP Earned</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-3 text-center border border-secondary/20"
                      >
                        <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                          <Trophy className="w-4 h-4" />
                          <span className="font-bold text-sm">{domain.badges}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Badges</div>
                      </motion.div>
                    </div>

                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.2 }}>
                          <Star className={`w-5 h-5 ${i < Math.ceil(domain.level / 3) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: "0 20px 40px rgba(217, 70, 39, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double triggering from card click
                        handleStartAssessment(domain.id);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 hover:from-brand-700 hover:via-brand-800 hover:to-brand-900 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 group"
                    >
                      Start Assessment
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ... (Existing "View More" logic remains unchanged) ... */}
          {domains.length > 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAll(!showAll)}
                className="px-10 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group"
              >
                {showAll ? (
                  <><span>Show Less</span><Flame className="w-5 h-5" /></>
                ) : (
                  <><span>View All {domains.length} Domains</span><ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* ... (Existing "Begin Your Journey" logic remains unchanged) ... */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-brand-600/10 to-secondary/10 rounded-3xl p-12 border border-brand-600/20 relative overflow-hidden"
        >
           {/* ... existing content ... */}
           <div className="relative z-10">
            {/* ... existing text ... */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => handleStartAssessment('web-dev')} // Default domain for CTA
                className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 hover:from-brand-700 hover:via-brand-800 hover:to-brand-900 text-white font-bold px-12 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all group"
              >
                Begin Your Journey
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default DomainCards;