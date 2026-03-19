import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  Send, Sparkles, Zap, BookOpen, Brain, Code2,
  Award, Clock, Layers, Star, Check, Plus,
  FileUp, X, Wand2, GraduationCap, Target,
  TrendingUp, Users, ChevronRight, Rocket
} from "lucide-react";

const CustomDomainBuilder = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [showAIInterface, setShowAIInterface] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [domainCreated, setDomainCreated] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);
  const [customDomains, setCustomDomains] = useState([]);
  const [mainTopic, setMainTopic] = useState("");

  // Example prompts for inspiration
  const examplePrompts = [
    { icon: Code2, text: "Full-stack web development with React and Node.js", color: "from-blue-500 to-cyan-500" },
    { icon: Brain, text: "Machine Learning fundamentals to advanced", color: "from-purple-500 to-pink-500" },
    { icon: Zap, text: "Python programming from scratch", color: "from-yellow-500 to-orange-500" },
    { icon: Award, text: "Data structures and algorithms mastery", color: "from-green-500 to-emerald-500" },
  ];

  // ------------------------------------
  // Load saved domains
  // ------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem("customDomains");
      if (stored) setCustomDomains(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ------------------------------------
  // Mock fallback
  // ------------------------------------
  const mockCourses = [
    { id: 1, name: "Fundamentals", difficulty: 1, description: "Core concepts and basics to build your foundation", modules: 6, color: "hsl(142, 76%, 36%)" },
    { id: 2, name: "Intermediate", difficulty: 2, description: "Deepen your understanding with practical applications", modules: 8, color: "hsl(221, 83%, 53%)" },
    { id: 3, name: "Advanced", difficulty: 3, description: "Master complex topics and real-world projects", modules: 10, color: "hsl(25, 95%, 53%)" }
  ];

  // ------------------------------------
  // File Handling
  // ------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  // ------------------------------------
  // Create Domain
  // ------------------------------------
  const handleCreateDomain = () => {
    setShowAIInterface(true);
    setUserPrompt("");
    setSelectedFile(null);
    setGeneratedCourses([]);
    setDomainCreated(false);
    setDomainSaved(false);
  };

  // ------------------------------------
  // Send Prompt + PDF
  // ------------------------------------
  const handleSendPrompt = async () => {
    if (!userPrompt.trim() && !selectedFile) return;

    setIsLoading(true);
    setShowAIInterface(false);

    try {
      const formData = new FormData();
      formData.append("prompt", userPrompt || "Generate curriculum from document");
      if (selectedFile) formData.append("pdf_file", selectedFile);

      const response = await fetch(
        "http://localhost:8000/curriculum/generate_curriculum",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();

      if (data.status === "success" && data.data.programs) {
        const difficultyMap = {
          beginner: 1, intermediate: 2, advanced: 3, expert: 4,
          Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4
        };

        const colorMap = {
          1: "hsl(142, 76%, 36%)",
          2: "hsl(221, 83%, 53%)",
          3: "hsl(25, 95%, 53%)",
          4: "hsl(346, 87%, 43%)"
        };

        const transformed = data.data.programs.map((p, i) => {
          const diff = difficultyMap[p.difficulty] || 2;
          return {
            id: p.program_order || i + 1,
            name: p.title,
            difficulty: diff,
            description: p.description,
            duration: `${8 + i * 2} weeks`,
            modules: p.key_topics?.length || 5,
            rating: (4.0 + Math.random() * 0.9).toFixed(1),
            reviews: Math.floor(500 + Math.random() * 2000),
            keyTopics: p.key_topics || [],
            color: colorMap[diff]
          };
        });

        setGeneratedCourses(transformed);
        setMainTopic(data.data.main_topic || userPrompt || selectedFile?.name);
        setDomainCreated(true);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error(err);
      setGeneratedCourses(mockCourses);
      setMainTopic(userPrompt || "Custom Domain");
      setDomainCreated(true);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  // ------------------------------------
  // Save Domain
  // ------------------------------------
  const handleSaveDomain = async () => {
    if (!generatedCourses.length) {
      alert("No courses to save");
      return;
    }

    const raw = localStorage.getItem("userData");
    if (!raw) {
      alert("Login required");
      return;
    }

    try {
      const user = JSON.parse(raw);
      const userId = user.id || user._id;
      
      if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
      }

      const serializedCourses = generatedCourses.map(course => ({
        id: course.id,
        name: course.name,
        icon: typeof course.icon === 'string' ? course.icon : course.icon?.name || 'BookOpen',
        difficulty: course.difficulty,
        progress: course.progress || 0,
        color: course.color || 'hsl(221, 83%, 53%)',
        description: course.description,
        duration: course.duration,
        modules: course.modules,
        rating: course.rating,
        reviews: course.reviews,
        keyTopics: course.keyTopics || [],
      }));

      const payload = {
        userId,
        name: mainTopic || "Custom Domain",
        mainTopic: mainTopic || "Custom Domain",
        userPrompt: userPrompt || mainTopic || "AI-generated custom domain",
        description: `Custom domain with ${serializedCourses.length} courses`,
        courses: serializedCourses,
        isCustom: true
      };

      const res = await fetch("http://localhost:9000/api/custom-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const result = await res.json();

      if (result.status === "success") {
        const savedDomain = {
          ...result.data,
          id: result.data._id || 'custom-' + Date.now(),
        };
        const updated = [...customDomains, savedDomain];
        setCustomDomains(updated);
        localStorage.setItem("customDomains", JSON.stringify(updated));
        setDomainSaved(true);
        
        setTimeout(() => {
          navigate('/student/home');
        }, 2500);
      } else {
        throw new Error(result.message || "Failed to save domain");
      }
    } catch (error) {
      console.error("Save domain error:", error);
      alert("Failed to save domain: " + error.message);
    }
  };

  const difficultyLabels = {
    1: { label: "BEGINNER", color: "bg-green-100 text-green-800" },
    2: { label: "INTERMEDIATE", color: "bg-blue-100 text-blue-800" },
    3: { label: "ADVANCED", color: "bg-orange-100 text-orange-800" },
    4: { label: "EXPERT", color: "bg-red-100 text-red-800" }
  };

  // ------------------------------------
  // JSX
  // ------------------------------------
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 p-8 lg:p-12 mb-10"
            >
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-4"
                  >
                    <Wand2 className="w-4 h-4" />
                    AI-Powered Learning
                  </motion.div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    Craft Your Own <span className="text-yellow-300">Learning Path</span>
                  </h1>
                  <p className="text-white/80 text-lg max-w-xl">
                    Let AI design a personalized curriculum tailored to your goals. 
                    Upload documents or describe what you want to learn.
                  </p>
                </div>
                
                <motion.button
                  onClick={handleCreateDomain}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-white text-brand-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  Create New Domain
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            {!domainCreated && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
              >
                {[
                  { icon: GraduationCap, label: "Custom Domains", value: customDomains.length, color: "from-blue-500 to-cyan-500" },
                  { icon: Target, label: "AI Generated", value: "100%", color: "from-purple-500 to-pink-500" },
                  { icon: TrendingUp, label: "Learning Progress", value: "Track All", color: "from-green-500 to-emerald-500" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Example Prompts Section */}
            {!domainCreated && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started with Popular Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examplePrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setUserPrompt(prompt.text);
                        setShowAIInterface(true);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-300 hover:shadow-lg transition-all text-left group"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center flex-shrink-0`}>
                        <prompt.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                          {prompt.text}
                        </p>
                        <p className="text-sm text-gray-500">Click to use this prompt</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Saved Domains List */}
            {!domainCreated && !isLoading && customDomains.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Custom Domains</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customDomains.map((domain, index) => (
                    <motion.div
                      key={domain.id || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-brand-200 transition-all cursor-pointer group"
                      onClick={() => navigate(`/student/custom-domain/${domain.id || domain._id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">
                          CUSTOM
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                        {domain.name || domain.mainTopic}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {domain.description || `${domain.courses?.length || 0} courses available`}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          {domain.courses?.length || 0} courses
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Custom
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loading Animation */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative w-40 h-40 mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <div className="w-full h-full rounded-full border-4 border-brand-200 border-t-brand-600" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4"
                    >
                      <div className="w-full h-full rounded-full border-4 border-purple-200 border-b-purple-600" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-8 flex items-center justify-center"
                    >
                      <Wand2 className="w-12 h-12 text-brand-600" />
                    </motion.div>
                  </div>
                  <motion.h2
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-bold text-gray-900 text-center mb-3"
                  >
                    AI is Crafting Your Domain...
                  </motion.h2>
                  <p className="text-gray-600 text-center max-w-md">
                    Analyzing your requirements and generating a personalized learning curriculum
                  </p>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center gap-8 mt-10">
                    {["Analyzing", "Generating", "Organizing"].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-3 h-3 rounded-full bg-brand-600" />
                        <span className="text-sm font-medium text-gray-600">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Courses Display */}
            <AnimatePresence>
              {domainCreated && generatedCourses.length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Generated Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4"
                    >
                      <Check className="w-4 h-4" />
                      Domain Generated Successfully!
                    </motion.div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                      {mainTopic}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {generatedCourses.length} courses designed for your learning journey
                    </p>
                  </div>

                  {/* Course Cards */}
                  <div className="space-y-6">
                    {generatedCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-200 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                      >
                        <div className="flex flex-col lg:flex-row">
                          {/* Level Indicator */}
                          <div 
                            className="lg:w-32 p-6 flex flex-row lg:flex-col items-center justify-center gap-4"
                            style={{ backgroundColor: course.color + '15' }}
                          >
                            <div 
                              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                              style={{ backgroundColor: course.color }}
                            >
                              {course.id}
                            </div>
                            <span 
                              className="text-sm font-bold"
                              style={{ color: course.color }}
                            >
                              Level {course.id}
                            </span>
                          </div>

                          {/* Course Content */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                  {course.name}
                                </h3>
                                <p className="text-gray-600">
                                  {course.description}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${difficultyLabels[course.difficulty]?.color || 'bg-gray-100 text-gray-800'}`}>
                                {difficultyLabels[course.difficulty]?.label || 'INTERMEDIATE'}
                              </span>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-6 mb-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Layers className="w-5 h-5" />
                                <span className="font-medium">{course.modules} modules</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-gray-900">{course.rating}</span>
                                <span className="text-gray-500">({course.reviews} reviews)</span>
                              </div>
                            </div>

                            {/* Key Topics */}
                            {course.keyTopics && course.keyTopics.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Key Topics:</p>
                                <div className="flex flex-wrap gap-2">
                                  {course.keyTopics.slice(0, 6).map((topic, idx) => (
                                    <span 
                                      key={idx} 
                                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                  {course.keyTopics.length > 6 && (
                                    <span className="px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-lg font-medium">
                                      +{course.keyTopics.length - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
                  >
                    <motion.button
                      onClick={handleSaveDomain}
                      disabled={domainSaved}
                      whileHover={{ scale: domainSaved ? 1 : 1.02 }}
                      whileTap={{ scale: domainSaved ? 1 : 0.98 }}
                      className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                        domainSaved 
                          ? 'bg-green-600 text-white cursor-not-allowed' 
                          : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white hover:shadow-xl'
                      }`}
                    >
                      {domainSaved ? (
                        <>
                          <Check className="w-6 h-6" />
                          Domain Saved Successfully!
                        </>
                      ) : (
                        <>
                          <Rocket className="w-6 h-6" />
                          Save & Start Learning
                        </>
                      )}
                    </motion.button>
                    
                    {!domainSaved && (
                      <motion.button
                        onClick={handleCreateDomain}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 hover:border-brand-400 text-gray-700 hover:text-brand-700 rounded-2xl font-semibold transition-all"
                      >
                        <Wand2 className="w-5 h-5" />
                        Generate Again
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Interface Modal */}
            <AnimatePresence>
              {showAIInterface && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowAIInterface(false)}
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                  >
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-8 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Wand2 className="w-5 h-5 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-white">AI Domain Assistant</h2>
                        </div>
                        <p className="text-white/80">Describe your learning goals or upload a document</p>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8 space-y-6">
                      {/* PDF Upload */}
                      <div>
                        <label className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                          <FileUp className="w-5 h-5 text-brand-600" />
                          Upload Document (Optional)
                        </label>
                        <div
                          onClick={() => fileInputRef.current.click()}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            selectedFile 
                              ? "border-green-500 bg-green-50" 
                              : "border-gray-300 hover:border-brand-400 hover:bg-brand-50"
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                          />

                          {selectedFile ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="font-semibold text-green-700">{selectedFile.name}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile(null);
                                }}
                                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileUp className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="font-medium text-gray-700">Click to upload PDF</p>
                              <p className="text-sm text-gray-500">Upload lecture notes, textbooks, or study materials</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prompt Input */}
                      <div>
                        <label className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                          <Brain className="w-5 h-5 text-brand-600" />
                          What do you want to learn?
                        </label>
                        <textarea
                          value={userPrompt}
                          onChange={(e) => setUserPrompt(e.target.value)}
                          placeholder="e.g., Full-stack web development with React and Node.js, starting from basics to building real projects..."
                          className="w-full border-2 border-gray-200 focus:border-brand-500 rounded-2xl p-4 h-36 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t border-gray-100 p-6 flex gap-4">
                      <button
                        onClick={() => setShowAIInterface(false)}
                        className="flex-1 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <motion.button
                        onClick={handleSendPrompt}
                        disabled={!userPrompt.trim() && !selectedFile}
                        whileHover={{ scale: (!userPrompt.trim() && !selectedFile) ? 1 : 1.02 }}
                        whileTap={{ scale: (!userPrompt.trim() && !selectedFile) ? 1 : 0.98 }}
                        className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                          (!userPrompt.trim() && !selectedFile)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:shadow-lg'
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                        Generate Curriculum
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
              {domainSaved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 30 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
                  >
                    {/* Confetti Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            y: -20, 
                            x: Math.random() * 400 - 200,
                            rotate: 0,
                            opacity: 1
                          }}
                          animate={{ 
                            y: 400, 
                            rotate: Math.random() * 360,
                            opacity: 0
                          }}
                          transition={{ 
                            duration: 2 + Math.random(), 
                            delay: Math.random() * 0.5,
                            ease: "easeOut"
                          }}
                          className={`absolute w-3 h-3 rounded-sm ${
                            ['bg-brand-500', 'bg-purple-500', 'bg-yellow-400', 'bg-green-500', 'bg-pink-500'][i % 5]
                          }`}
                          style={{ left: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <Check className="w-12 h-12 text-white" strokeWidth={3} />
                    </motion.div>

                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-bold text-gray-900 mb-3"
                    >
                      Awesome! 🎉
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl text-brand-600 font-semibold mb-2"
                    >
                      "{mainTopic}"
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-500 mb-8"
                    >
                      Your custom domain is ready! Redirecting to your dashboard...
                    </motion.p>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/student/home')}
                      className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
                    >
                      Go to Dashboard Now
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomDomainBuilder;
