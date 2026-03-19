import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  Send, Sparkles, Zap, BookOpen, Brain, Code2,
  Award, Clock, Layers, Star, Check,
  FileUp, X
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
    { id: 1, name: "Basics", difficulty: 1, description: "Intro concepts", modules: 6 },
    { id: 2, name: "Intermediate", difficulty: 2, description: "Core topics", modules: 8 },
    { id: 3, name: "Advanced", difficulty: 3, description: "Deep dive", modules: 10 }
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

        const transformed = data.data.programs.map((p, i) => ({
          id: p.program_order || i + 1,
          name: p.title,
          difficulty: difficultyMap[p.difficulty] || 2,
          description: p.description,
          duration: `${8 + i * 2} weeks`,
          modules: p.key_topics?.length || 5,
          rating: (3.5 + Math.random()).toFixed(1),
          reviews: Math.floor(2000 + Math.random() * 3000),
          keyTopics: p.key_topics || []
        }));

        setGeneratedCourses(transformed);
        setMainTopic(data.data.main_topic || userPrompt || selectedFile?.name);
        setDomainCreated(true);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error(err);
      setGeneratedCourses(mockCourses);
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

      // Serialize courses to remove React components
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

      console.log("Saving domain with payload:", JSON.stringify(payload, null, 2));

      const res = await fetch("http://localhost:9000/api/custom-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const result = await res.json();
      console.log("Save result:", result);

      if (result.status === "success") {
        const savedDomain = {
          ...result.data,
          id: result.data._id || 'custom-' + Date.now(),
        };
        const updated = [...customDomains, savedDomain];
        setCustomDomains(updated);
        localStorage.setItem("customDomains", JSON.stringify(updated));
        setDomainSaved(true);
        
        // Navigate to home after short delay
        setTimeout(() => {
          navigate('/student/home');
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to save domain");
      }
    } catch (error) {
      console.error("Save domain error:", error);
      alert("Failed to save domain: " + error.message);
    }
  };

  // ------------------------------------
  // JSX
  // ------------------------------------
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between mb-8">
            <h1 className="text-4xl font-bold">Craft Your Own Domain</h1>
            <button
              onClick={handleCreateDomain}
              className="bg-brand-600 text-white px-6 py-3 rounded-xl flex gap-2"
            >
              <Sparkles /> Create a Domain
            </button>
          </div>

          {/* AI Modal */}
          <AnimatePresence>
            {showAIInterface && (
              <motion.div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                <motion.div className="bg-white rounded-2xl w-full max-w-2xl">
                  <div className="bg-brand-600 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold">AI Domain Assistant</h2>
                  </div>

                  <div className="p-8 space-y-6">
                    {/* PDF Upload */}
                    <div>
                      <label className="font-bold text-sm mb-2 block">
                        Optional: Upload PDF
                      </label>

                      <div
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${
                          selectedFile ? "border-brand-500 bg-brand-50" : "border-gray-300"
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
                          <div className="flex justify-center items-center gap-2">
                            <Check className="text-green-600" />
                            {selectedFile.name}
                            <X
                              className="cursor-pointer text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            <FileUp className="mx-auto mb-2 text-gray-400" />
                            <p className="text-gray-500 text-sm">
                              Click to upload PDF
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="What should the AI focus on?"
                      className="w-full border rounded-lg p-4 h-32"
                    />
                  </div>

                  <div className="border-t p-6 flex gap-4">
                    <button
                      onClick={() => setShowAIInterface(false)}
                      className="flex-1 border rounded-lg py-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendPrompt}
                      className="flex-1 bg-brand-600 text-white rounded-lg py-3 flex justify-center gap-2"
                    >
                      <Send /> Generate
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generated Courses */}
          {domainCreated && generatedCourses.length > 0 && (
            <div className="mt-10 space-y-4">
              {generatedCourses.map((c) => (
                <div key={c.id} className="border rounded-xl p-6">
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <p className="text-gray-600">{c.description}</p>
                  <div className="flex gap-4 text-sm mt-2">
                    <span><Clock className="inline w-4" /> {c.duration}</span>
                    <span><Layers className="inline w-4" /> {c.modules} modules</span>
                    <span><Star className="inline w-4 text-yellow-400" /> {c.rating}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveDomain}
                disabled={domainSaved}
                className={`mt-6 px-8 py-4 rounded-xl flex items-center gap-2 ${
                  domainSaved 
                    ? 'bg-green-600 text-white cursor-not-allowed' 
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {domainSaved ? (
                  <>
                    <Check className="w-5 h-5" />
                    Domain Saved!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Save Domain
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success Modal */}
          <AnimatePresence>
            {domainSaved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Domain Created! 🎉
                  </h2>
                  <p className="text-gray-600 text-lg mb-2">
                    "{mainTopic}"
                  </p>
                  <p className="text-gray-500 text-sm mb-8">
                    Your custom domain has been saved. Redirecting to home...
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/student/home')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
                  >
                    Go to Home Now
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CustomDomainBuilder;
