import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Search, Calculator, FlaskConical, Monitor, Code2, 
  Network, BrainCircuit, BarChart3, Globe, ShieldCheck, Cpu, Puzzle, 
  Languages, Server, Database, Leaf, Briefcase, SearchX, Zap, Lightbulb, 
  TrendingUp, Brain, Target, Sparkles, Flame, Trophy, Award, Star, 
  ArrowRight, Clock, CheckCircle, X, BookOpen, Users, Calendar, Send, Heart
} from "lucide-react";
import Footer from "../../components/Footer";
import { DOMAINS } from "../../utils/domains";

// Utility function for className merging
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Navigation Bar Component


// Animated Search Bar Component
const AnimatedSearchBar = ({ onSearch }) => {
  const domains = [
    "Mathematics", "Science", "Computer Fundamentals", "Programming",
    "Data Structures (DSA)", "Artificial Intelligence", "Data Science",
    "Web Development", "Cyber Security", "Electronics", "Logical Reasoning",
    "Communication", "OS & Networking", "Database & SQL", "Environment", "Career Skills"
  ];

  const [currentDomain, setCurrentDomain] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  const prefix = "I want to assess myself in";

  useEffect(() => {
    if (searchValue) return;

    const domain = domains[currentDomain];
    let timeout;

    if (isTyping) {
      if (displayText.length < domain.length) {
        timeout = setTimeout(() => {
          setDisplayText(domain.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setCurrentDomain((prev) => (prev + 1) % domains.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentDomain, searchValue]);

  useEffect(() => {
    if (searchValue.trim()) {
      const filtered = domains.filter(domain =>
        domain.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredDomains(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setFilteredDomains([]);
      setShowSuggestions(false);
    }
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDomain = (domain) => {
    setSearchValue(domain);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch(domain);
  };

  const handleClear = () => {
    setSearchValue("");
    setShowSuggestions(false);
    onSearch("");
  };

  useEffect(() => {
    onSearch(searchValue);
  }, [searchValue]);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-600 pointer-events-none z-10" strokeWidth={2} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => searchValue && setShowSuggestions(true)}
          className="w-full h-14 pl-16 pr-24 rounded-2xl border-2 border-brand-300 bg-brand-50 text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-600 shadow-md shadow-brand-200/50 hover:shadow-lg hover:shadow-brand-300/60 transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchValue && (
            <button onClick={handleClear} className="p-1.5 hover:bg-white rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <button 
            onClick={() => searchValue && onSearch(searchValue)}
            className="p-2 bg-brand-600 hover:bg-brand-700 rounded-full transition-colors group"
          >
            <Send className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
        {!searchValue && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-base">
            <div className="inline-flex items-center text-gray-600">
              <span className="transition-all duration-75">{prefix}</span>
              <span className="ml-2 text-brand-600 font-semibold text-lg transition-all duration-75">
                {displayText}
              </span>
              <span className="inline-block w-0.5 h-5 bg-brand-600 ml-0.5 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && filteredDomains.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {filteredDomains.map((domain, index) => (
              <button
                key={domain}
                onClick={() => handleSelectDomain(domain)}
                className={`w-full px-5 py-3 text-left hover:bg-brand-50 transition-colors flex items-center gap-3 ${
                  index === selectedIndex ? "bg-brand-50" : ""
                }`}
              >
                <Search className="w-5 h-5 text-brand-600" strokeWidth={1.5} />
                <span className="text-gray-900 flex items-center gap-2">
                  <span>{prefix}</span>
                  <span className="text-brand-600 font-semibold">{domain}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Welcome Banner Component
const WelcomeBanner = ({ studentName, level, xp, totalXP }) => {
  const masteryPercentage = Math.round((xp / totalXP) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2 lg:py-3"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 via-brand-600 to-brand-700 p-8 lg:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
              <span className="text-sm font-medium text-white/90 uppercase tracking-wide">Your Learning Journey</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3">
              Welcome back, {studentName} 👋
            </h1>
            <p className="text-lg lg:text-xl text-white/90">Level up your skills with adaptive challenges</p>
          </div>
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="relative w-24 h-24">
              <svg width="100" height="100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (masteryPercentage / 100) * 283}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{masteryPercentage}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-white/80 mb-1">Level {level}</div>
              <div className="text-4xl font-bold text-white mb-1">{masteryPercentage}%</div>
              <div className="text-sm text-white/80">Overall Mastery</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// Quick Stats Component
const QuickStats = () => {
  const stats = [
    { 
      icon: CheckCircle, 
      label: "Completed", 
      value: "24", 
      subtext: "Assessments", 
      gradient: "from-emerald-400 to-green-500",
      shadowColor: "shadow-emerald-500/20"
    },
    { 
      icon: Clock, 
      label: "In Progress", 
      value: "3", 
      subtext: "Active tests", 
      gradient: "from-amber-400 to-orange-500",
      shadowColor: "shadow-amber-500/20"
    },
    { 
      icon: Target, 
      label: "Accuracy", 
      value: "87%", 
      subtext: "Average score", 
      gradient: "from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-500/20"
    },
    { 
      icon: TrendingUp, 
      label: "Improvement", 
      value: "+12%", 
      subtext: "This month", 
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/20"
    },
  ];

  return (
    <section className="py-6 lg:py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-5 shadow-lg ${stat.shadowColor} hover:shadow-xl transition-all cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-white/90 font-medium">{stat.label}</div>
            <div className="text-xs text-white/70 mt-1">{stat.subtext}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// AI Insights Component
const AIInsights = () => {
  // Read user enrollments to check if they have insights to show
  const [hasEnrollments, setHasEnrollments] = useState(false);
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const parsed = JSON.parse(raw);
        const enrollments = parsed.enrollments || parsed.courses || parsed.enrolled || parsed.enrolledCourses;
        setHasEnrollments(Array.isArray(enrollments) && enrollments.length > 0);
      }
    } catch (e) {
      setHasEnrollments(false);
    }
  }, []);

  const insights = [
    {
      icon: Trophy,
      label: "Strongest Topic",
      title: "Web Development",
      value: "80%",
      description: "Keep up the great work!",
      gradient: "from-amber-400 to-orange-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      icon: Target,
      label: "Focus Area",
      title: "Artificial Intelligence",
      value: "45%",
      description: "Needs practice",
      gradient: "from-rose-400 to-pink-500",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600"
    },
    {
      icon: Lightbulb,
      label: "AI Recommendation",
      title: "Daily AI Practice",
      value: "🚀",
      description: "Boost your level faster",
      gradient: "from-violet-400 to-purple-500",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600"
    }
  ];

  // Empty state for new users (no enrollments)
  if (!hasEnrollments) {
    return (
      <section className="py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            AI-Powered Insights
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 border border-purple-500/20"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-transparent" />
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"
            animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <div className="relative z-10 text-center">
            {/* Icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-2xl mb-6"
            >
              <Brain className="w-10 h-10 text-white" strokeWidth={1.5} />
            </motion.div>

            {/* Heading */}
            <h3 className="text-3xl font-bold text-white mb-3">
              Your AI Insights Await
            </h3>

            {/* Subtitle */}
            <p className="text-lg text-purple-200 mb-2 max-w-lg mx-auto">
              Start your first assessment to unlock personalized learning insights powered by AI.
            </p>

            {/* Secondary text */}
            <p className="text-sm text-purple-300/70 max-w-lg mx-auto mb-8">
              Once you complete your first course, we'll analyze your progress and show you your strongest topics, areas for improvement, and personalized recommendations.
            </p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Explore Domains
              <ArrowRight className="w-4 h-4 inline ml-2" strokeWidth={2} />
            </motion.button>

            {/* Feature list */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <Trophy className="w-5 h-5 text-amber-400 mb-2" />
                <span className="text-xs font-medium text-purple-200">Progress Tracking</span>
              </div>
              <div className="flex flex-col items-center">
                <Target className="w-5 h-5 text-rose-400 mb-2" />
                <span className="text-xs font-medium text-purple-200">Focus Areas</span>
              </div>
              <div className="flex flex-col items-center">
                <Lightbulb className="w-5 h-5 text-yellow-400 mb-2" />
                <span className="text-xs font-medium text-purple-200">AI Tips</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  // Insights for users with enrollments
  return (
    <section className="py-4 lg:py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          AI-Powered Insights
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            className="relative"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${insight.gradient} rounded-l-lg`} />
            <div className="bg-white border border-gray-200 rounded-lg p-4 ml-1 hover:shadow-lg transition-all">
              <div className="mb-3">
                <div className={`w-10 h-10 rounded-lg ${insight.iconBg} flex items-center justify-center mb-2`}>
                  <insight.icon className={`w-5 h-5 ${insight.iconColor}`} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{insight.label}</p>
                <h3 className="text-xl font-bold text-gray-900">{insight.value}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800">{insight.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Quick Actions Component
const QuickActions = ({ navigate }) => {
  const actions = [
    {
      icon: BookOpen,
      title: "Resume Last Assessment",
      description: "Continue where you left off",
      color: "sky",
      badge: "In Progress",
      action: null
    },
    {
      icon: Flame,
      title: "Daily Challenge",
      description: "Complete today's special quiz",
      color: "orange",
      badge: "New",
      action: null
    },
    {
      icon: Sparkles,
      title: "Craft Your Own Domain",
      description: "Create a custom assessment",
      color: "purple",
      badge: "Create",
      action: () => navigate('/student/custom-domain')
    }
  ];

  return (
    <section className="py-6 lg:py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-brand-600" strokeWidth={2} />
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {actions.map((action, index) => {
          const colorMap = {
            sky: { bg: 'bg-brand-600', hover: 'hover:bg-brand-700', text: 'text-brand-700', badge: 'bg-brand-100 text-brand-800' },
            orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
            purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' }
          };
          const colors = colorMap[action.color];
          
          return (
            <motion.button
              key={action.title}
              onClick={action.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group text-left h-full"
            >
              <div className="flex h-full">
                <div className={`${colors.bg} ${colors.hover} w-20 flex-shrink-0 flex items-center justify-center transition-colors`}>
                  <action.icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3 className="font-bold text-base text-gray-900 leading-tight">
                      {action.title}
                    </h3>
                    <span className={`px-2.5 py-1 ${colors.badge} text-xs font-bold rounded-md whitespace-nowrap flex-shrink-0`}>
                      {action.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">{action.description}</p>
                  <div className={`flex items-center gap-2 ${colors.text} font-semibold text-sm`}>
                    <span>Start Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

// Domain Cards Grid Component
const DomainCardsGrid = ({ searchQuery, navigate }) => {
  const [showAll, setShowAll] = useState(false);
  const [customDomain, setCustomDomain] = useState(null);
  const INITIAL_DISPLAY_COUNT = 4;

  // Load custom domain from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('customDomain');
    if (saved) {
      try {
        setCustomDomain(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved custom domain:', e);
      }
    }
  }, []);

  // Create domain ID map from DOMAINS utility
  const domainIdMap = {};
  DOMAINS.forEach(domain => {
    domainIdMap[domain.title] = domain.id;
  });

  // const domains = [
  //   { id: 1, name: 'Mathematics', domainId: domainIdMap['Mathematics'], icon: Calculator, difficulty: 4, progress: 75, color: 'hsl(217, 91%, 60%)' },
  //   { id: 2, name: 'Science', domainId: domainIdMap['Science'], icon: FlaskConical, difficulty: 4, progress: 60, color: 'hsl(142, 71%, 45%)' },
  //   { id: 3, name: 'Computer Fundamentals', domainId: domainIdMap['Computer Fundamentals'], icon: Monitor, difficulty: 2, progress: 85, color: 'hsl(215, 16%, 47%)' },
  //   { id: 4, name: 'Programming', domainId: domainIdMap['Programming'], icon: Code2, difficulty: 5, progress: 70, color: 'hsl(258, 90%, 66%)' },
  //   { id: 5, name: 'Data Structures (DSA)', domainId: domainIdMap['Data Structures (DSA)'], icon: Network, difficulty: 5, progress: 55, color: 'hsl(239, 84%, 67%)' },
  //   { id: 6, name: 'Artificial Intelligence', domainId: domainIdMap['Artificial Intelligence'], icon: BrainCircuit, difficulty: 5, progress: 45, color: 'hsl(347, 77%, 50%)' },
  //   { id: 7, name: 'Data Science', domainId: domainIdMap['Data Science'], icon: BarChart3, difficulty: 4, progress: 65, color: 'hsl(189, 94%, 43%)' },
  //   { id: 8, name: 'Web Development', domainId: domainIdMap['Web Development'], icon: Globe, difficulty: 3, progress: 80, color: 'hsl(24, 95%, 53%)' },
  //   { id: 9, name: 'Cyber Security', domainId: domainIdMap['Cyber Security'], icon: ShieldCheck, difficulty: 5, progress: 50, color: 'hsl(0, 84%, 60%)' },
  //   { id: 10, name: 'Electronics', domainId: domainIdMap['Electronics'], icon: Cpu, difficulty: 4, progress: 60, color: 'hsl(48, 96%, 53%)' },
  //   { id: 11, name: 'Logical Reasoning', domainId: domainIdMap['Logical Reasoning'], icon: Puzzle, difficulty: 3, progress: 70, color: 'hsl(173, 80%, 40%)' },
  //   { id: 12, name: 'Communication', domainId: domainIdMap['Communication'], icon: Languages, difficulty: 3, progress: 75, color: 'hsl(330, 81%, 60%)' },
  //   { id: 13, name: 'OS & Networking', domainId: domainIdMap['OS & Networking'], icon: Server, difficulty: 4, progress: 55, color: 'hsl(220, 9%, 46%)' },
  //   { id: 14, name: 'Database & SQL', domainId: domainIdMap['Database & SQL'], icon: Database, difficulty: 4, progress: 65, color: 'hsl(38, 92%, 50%)' },
  //   { id: 15, name: 'Environment', domainId: domainIdMap['Environment'], icon: Leaf, difficulty: 2, progress: 90, color: 'hsl(142, 76%, 36%)' },
  //   { id: 16, name: 'Career Skills', domainId: domainIdMap['Career Skills'], icon: Briefcase, difficulty: 3, progress: 80, color: 'hsl(271, 91%, 65%)' }
  // ];

  const domains = [];   
  const filteredDomains = searchQuery.trim()
    ? domains.filter(domain => domain.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : domains;

  // Determine how many regular domains to show in first section
  // IMPORTANT: "Your Learning Domains" section ALWAYS shows exactly 4 cards
  // showAll flag only controls visibility of remaining domains section
  let displayedDomains = [];
  if (searchQuery.trim()) {
    // Show all results when searching
    displayedDomains = filteredDomains;
  } else {
    // ALWAYS show first section: 3 regular domains if custom exists, 4 if no custom
    // Never change this based on showAll - that only controls the remaining section
    displayedDomains = filteredDomains.slice(0, customDomain ? 3 : 4);
  }

  // For "Explore all domains" section - show next 4 domains (only if not in search mode)
  const firstSectionCount = customDomain ? 4 : 4; // 1 custom + 3 regular OR 4 regular
  const exploreAllStartIndex = customDomain ? 3 : 4; // Next batch starts after first section
  const exploreAllFirstBatch = filteredDomains.slice(exploreAllStartIndex, exploreAllStartIndex + 4);
  
  // Show "Explore all domains" section only if there are domains after the first section
  const hasExploreAllSection = !searchQuery.trim() && exploreAllFirstBatch.length > 0;
  
  // Show "View All" button only if there are more domains after "Explore all" section
  const hasMoreDomains = !searchQuery.trim() && filteredDomains.length > (exploreAllStartIndex + 4);

  const getDifficultyLabel = (level) => {
    if (level <= 2) return "Beginner";
    if (level <= 3) return "Intermediate";
    if (level <= 4) return "Advanced";
    return "Expert";
  };

  return (
    <section  id="domains" className="py-8 lg:py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Your Learning Domains"}
        </h2>
        {searchQuery && (
          <div className="text-sm text-gray-600">
            {filteredDomains.length} {filteredDomains.length === 1 ? "result" : "results"} found
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {displayedDomains.length > 0 || !searchQuery ? (
          <>
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Custom Domain Card */}
              {!searchQuery && customDomain && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                >
                  <div className="h-full bg-white border-2 border-amber-400 rounded-xl hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden shadow-lg shadow-amber-200/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-50" />
                    <div className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-amber-100">
                          <Heart className="w-7 h-7 text-amber-600 fill-amber-600" strokeWidth={1.5} />
                        </div>
                        <div className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">
                          Custom
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">
                        {customDomain.name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                            Progress
                          </span>
                          <span className="font-semibold text-gray-900">{customDomain.progress}%</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: `${customDomain.progress}%` }} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>{100 - customDomain.progress}% to mastery</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/student/custom-domain/1')}
                        className="w-full mt-4 bg-amber-500 text-white hover:bg-amber-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Regular Domain Cards */}
              {displayedDomains.map((domain, index) => {
                const Icon = domain.icon;
                return (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: (index + 1) * 0.05 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                  >
                    <div className="h-full bg-white border border-brand-200 rounded-xl hover:border-brand-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${domain.color}15` }}>
                            <Icon className="w-7 h-7" style={{ color: domain.color }} strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5"
                                  fill={i < domain.difficulty ? domain.color : "none"}
                                  stroke={i < domain.difficulty ? domain.color : "#e5e7eb"}
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{getDifficultyLabel(domain.difficulty)}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-brand-600 transition-colors">
                          {domain.name}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                              Progress
                            </span>
                            <span className="font-semibold text-gray-900">{domain.progress}%</span>
                          </div>
                          <div className="w-full bg-brand-100 rounded-full h-2.5">
                            <div className="bg-brand-600 h-2.5 rounded-full transition-all" style={{ width: `${domain.progress}%` }} />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                            <span>{100 - domain.progress}% to mastery</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => domain.domainId && navigate(`/student/domains/${domain.domainId}`)}
                          className="w-full mt-4 bg-brand-600 text-white hover:bg-brand-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          Explore
                          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Explore All Domains Section */}
            {!searchQuery && hasExploreAllSection && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 mb-8"
                >
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Explore all the domains
                  </h2>
                </motion.div>

                <motion.div
                  key="explore-all"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {exploreAllFirstBatch.map((domain, index) => {
                    const Icon = domain.icon;
                    return (
                      <motion.div
                        key={domain.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -8 }}
                      >
                        <div className="h-full bg-white border border-brand-200 rounded-xl hover:border-brand-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${domain.color}15` }}>
                                <Icon className="w-7 h-7" style={{ color: domain.color }} strokeWidth={1.5} />
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-3.5 h-3.5"
                                      fill={i < domain.difficulty ? domain.color : "none"}
                                      stroke={i < domain.difficulty ? domain.color : "#e5e7eb"}
                                      strokeWidth={1.5}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">{getDifficultyLabel(domain.difficulty)}</span>
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-brand-600 transition-colors">
                              {domain.name}
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                                  Progress
                                </span>
                                <span className="font-semibold text-gray-900">{domain.progress}%</span>
                              </div>
                              <div className="w-full bg-brand-100 rounded-full h-2.5">
                                <div className="bg-brand-600 h-2.5 rounded-full transition-all" style={{ width: `${domain.progress}%` }} />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                                <span>{100 - domain.progress}% to mastery</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => domain.domainId && navigate(`/student/domains/${domain.domainId}`)}
                              className="w-full mt-4 bg-brand-600 text-white hover:bg-brand-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              Explore
                              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </>
            )}

            {/* View All Button */}
            {hasMoreDomains && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mt-10"
              >
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                >
                  <span className="text-lg">
                    {showAll ? 'View Less' : `View All Domains (${filteredDomains.length - (exploreAllStartIndex + 4)} more)`}
                  </span>
                  <motion.div
                    animate={{ rotate: showAll ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className={`w-5 h-5 ${showAll ? 'rotate-90' : ''}`} strokeWidth={2} />
                  </motion.div>
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </motion.div>
            )}

            {/* Remaining Domains - Only shown when "View All" is clicked */}
            {showAll && filteredDomains.length > (exploreAllStartIndex + 4) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-10"
              >
                <motion.div
                  key="remaining"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredDomains.slice(exploreAllStartIndex + 4).map((domain, index) => {
                    const Icon = domain.icon;
                    return (
                      <motion.div
                        key={domain.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -8 }}
                      >
                        <div className="h-full bg-white border border-brand-200 rounded-xl hover:border-brand-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${domain.color}15` }}>
                                <Icon className="w-7 h-7" style={{ color: domain.color }} strokeWidth={1.5} />
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-3.5 h-3.5"
                                      fill={i < domain.difficulty ? domain.color : "none"}
                                      stroke={i < domain.difficulty ? domain.color : "#e5e7eb"}
                                      strokeWidth={1.5}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">{getDifficultyLabel(domain.difficulty)}</span>
                              </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-brand-600 transition-colors">
                              {domain.name}
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                                  Progress
                                </span>
                                <span className="font-semibold text-gray-900">{domain.progress}%</span>
                              </div>
                              <div className="w-full bg-brand-100 rounded-full h-2.5">
                                <div className="bg-brand-600 h-2.5 rounded-full transition-all" style={{ width: `${domain.progress}%` }} />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                                <span>{100 - domain.progress}% to mastery</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => domain.domainId && navigate(`/student/domains/${domain.domainId}`)}
                              className="w-full mt-4 bg-brand-600 text-white hover:bg-brand-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              Explore
                              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <SearchX className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No domains found</h3>
            <p className="text-gray-600 text-center max-w-md">
              We couldn't find any domains matching "{searchQuery}". Try searching for something else.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Main App Component
export default function AdaptLearnHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem('userData');
        if (!raw) return setUserData(null);
        const parsed = JSON.parse(raw);
        const normalized = {
          name: parsed?.name || parsed?.displayName || parsed?.user?.name || parsed?.profile?.name || (parsed?.email ? parsed.email.split('@')[0] : null),
          email: parsed?.email || parsed?.user?.email || parsed?.profile?.email || null,
          avatar: parsed?.avatar || parsed?.picture || parsed?.user?.avatar || parsed?.profile?.picture || parsed?.profile?.avatar || null,
        };
        setUserData(normalized);
      } catch (err) {
        setUserData(null);
      }
    };

    readUser();

    const onUserDataChanged = () => readUser();
    const onStorage = (e) => {
      if (e.key === 'userData') readUser();
    };

    window.addEventListener('user-data-changed', onUserDataChanged);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('user-data-changed', onUserDataChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const studentName = userData?.name || 'Alex';

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
        {/* Search Bar Section */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-3xl">
            <AnimatedSearchBar onSearch={handleSearch} />
          </div>
        </div>
        
        <WelcomeBanner studentName={studentName} level={5} xp={3250} totalXP={5000} />
        <AIInsights />
        <QuickActions navigate={navigate} />
        <DomainCardsGrid searchQuery={searchQuery} navigate={navigate} />
      </main>
      
      <Footer />
    </div>
  );
}
