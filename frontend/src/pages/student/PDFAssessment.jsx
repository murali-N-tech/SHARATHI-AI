import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { MODEL_API, BACKEND_API } from '../../lib/apiConfig';
import { 
  Upload, FileText, Sparkles, Check, X, 
  BookOpen, Clock, Layers, Star, Zap 
} from 'lucide-react';

/**
 * PDFAssessment Component
 * 
 * Allows users to upload a PDF document for automatic topic extraction
 * and difficulty categorization to create adaptive assessments.
 */
const PDFAssessment = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [domainName, setDomainName] = useState('');
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [domainCreated, setDomainCreated] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);
  const [customDomains, setCustomDomains] = useState([]);

  // Load custom domains from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('customDomains');
      if (stored) {
        setCustomDomains(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading custom domains:', e);
    }
  }, []);

  /**
   * Handle file selection
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setDomainCreated(false);
      
      // Set default domain name from file name
      const fileName = selectedFile.name.replace('.pdf', '');
      setDomainName(fileName);
    }
  };

  /**
   * Upload and process PDF
   */
  const handleProcessPDF = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Processing PDF:', file.name);
      
      const response = await fetch(`${MODEL_API}/pdf/process_document_difficulty`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process PDF');
      }

      const data = await response.json();
      console.log('PDF processing result:', data);
      
      // Convert topics to courses format
      const courses = convertTopicsToCourses(data.data.topics_json);
      setGeneratedCourses(courses);
      setDomainCreated(true);
      setError(null);
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err.message);
      setDomainCreated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Convert PDF topics to courses format (matching CustomDomainBuilder pattern)
   */
  const convertTopicsToCourses = (topicsJson) => {
    const courses = [];
    const difficultyMap = {
      easy: { level: 1, color: 'hsl(142, 76%, 36%)', label: 'BEGINNER' },
      medium: { level: 2, color: 'hsl(221, 83%, 53%)', label: 'INTERMEDIATE' },
      hard: { level: 3, color: 'hsl(25, 95%, 53%)', label: 'ADVANCED' },
      advanced: { level: 4, color: 'hsl(346, 87%, 43%)', label: 'EXPERT' }
    };

    const icons = [BookOpen, FileText, Layers, Sparkles];
    let courseId = 1;

    Object.keys(difficultyMap).forEach((level, index) => {
      const topics = topicsJson[level] || [];
      if (topics.length > 0) {
        courses.push({
          id: courseId++,
          name: `${level.charAt(0).toUpperCase() + level.slice(1)} Topics`,
          icon: icons[index % icons.length],
          difficulty: difficultyMap[level].level,
          progress: 0,
          color: difficultyMap[level].color,
          description: `${topics.length} topics covering ${level} difficulty concepts`,
          duration: `${Math.ceil(topics.length / 2)} weeks`,
          modules: topics.length,
          rating: (4 + Math.random()).toFixed(1),
          reviews: Math.floor(100 + Math.random() * 500),
          keyTopics: topics
        });
      }
    });

    return courses;
  };

  /**
   * Save domain to backend (matching CustomDomainBuilder pattern)
   */
  const handleSaveDomain = async () => {
    if (generatedCourses.length === 0) {
      setError('No topics to save');
      return;
    }

    if (!domainName.trim()) {
      setError('Please enter a domain name');
      return;
    }

    try {
      console.log('=== SAVING DOMAIN ===');
      
      // Get userId from localStorage
      const raw = localStorage.getItem('userData');
      if (!raw) {
        throw new Error('Please log in to save domains');
      }

      const userData = JSON.parse(raw);
      const userId = userData.id || userData._id;

      if (!userId) {
        throw new Error('Unable to save domain. Please log in again.');
      }

      console.log('User ID:', userId);

      // Convert courses - remove React component objects
      const serializedCourses = generatedCourses.map(course => ({
        id: course.id,
        name: course.name,
        icon: typeof course.icon === 'string' ? course.icon : course.icon?.name || 'BookOpen',
        difficulty: course.difficulty,
        progress: course.progress || 0,
        color: course.color,
        description: course.description,
        duration: course.duration,
        modules: course.modules,
        rating: course.rating,
        reviews: course.reviews,
        keyTopics: course.keyTopics || [],
      }));

      console.log('Serialized courses:', serializedCourses);

      // Prepare the custom domain data
      const customDomainData = {
        userId,
        name: domainName,
        userPrompt: `PDF-generated domain from ${file.name}`,
        mainTopic: domainName,
        description: `Assessment created from PDF with ${serializedCourses.length} difficulty levels`,
        courses: serializedCourses,
        icon: 'Sparkles',
        color: 'hsl(48, 96%, 53%)',
        difficulty: 3,
        progress: 0,
        isCustom: true,
      };

      console.log('Payload:', customDomainData);
      console.log('Backend URL:', `${BACKEND_API}/api/custom-domains`);

      // Save to MongoDB via API
      const response = await fetch(`${BACKEND_API}/api/custom-domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customDomainData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const apiResult = await response.json();
      console.log('Save result:', apiResult);

      if (apiResult.status === 'success') {
        // Save to localStorage
        let localCustomDomains = [];
        try {
          const stored = localStorage.getItem('customDomains');
          if (stored) {
            localCustomDomains = JSON.parse(stored);
          }
        } catch (storageError) {
          console.error('Error reading localStorage:', storageError);
          localCustomDomains = [];
        }
        
        const savedDomainData = {
          id: apiResult.data._id || 'custom-' + Date.now(),
          name: domainName,
          userPrompt: `PDF-generated domain from ${file.name}`,
          mainTopic: domainName,
          description: `Assessment created from PDF with ${serializedCourses.length} difficulty levels`,
          courses: serializedCourses,
          icon: 'Sparkles',
          color: 'hsl(48, 96%, 53%)',
          difficulty: 3,
          progress: 0,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        
        localCustomDomains.push(savedDomainData);
        localStorage.setItem('customDomains', JSON.stringify(localCustomDomains));

        // Update local state
        setCustomDomains([...customDomains, savedDomainData]);

        // Show success modal
        setDomainSaved(true);
        console.log('=== DOMAIN SAVED SUCCESSFULLY ===');
      } else {
        throw new Error(apiResult.message || 'Failed to save domain');
      }
    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error:', error);
      setError(error.message);
      alert('Failed to save domain: ' + error.message);
    }
  };

  /**
   * Reset the form
   */
  const handleReset = () => {
    setFile(null);
    setError(null);
    setDomainName('');
    setGeneratedCourses([]);
    setDomainCreated(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  PDF Document Assessment
                </h1>
                <p className="text-gray-600 mt-2">
                  Upload a PDF to automatically extract topics and create an adaptive assessment
                </p>
              </div>
            </div>

            {/* PDF Upload Section */}
            {!domainCreated && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white border-2 border-dashed border-brand-300 rounded-2xl p-12 hover:border-brand-500 transition-all duration-300">
                  <div className="text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      {file ? (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <Check className="w-10 h-10 text-green-600" strokeWidth={2} />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">
                            {file.name}
                          </p>
                          <p className="text-gray-500 mb-4">
                            Click to change file
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFile(null);
                              setDomainName('');
                            }}
                            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-16 h-16 mx-auto mb-4 text-brand-500" strokeWidth={1.5} />
                          <p className="text-xl font-semibold text-gray-900 mb-2">
                            Upload your PDF document
                          </p>
                          <p className="text-gray-500">
                            Click to browse or drag and drop
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-8 space-y-4"
                    >
                      <div>
                        <label htmlFor="domain-name" className="block text-sm font-semibold text-gray-900 mb-2">
                          Domain Name *
                        </label>
                        <input
                          id="domain-name"
                          type="text"
                          value={domainName}
                          onChange={(e) => setDomainName(e.target.value)}
                          placeholder="e.g., Python Fundamentals"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base"
                        />
                      </div>

                      <motion.button
                        onClick={handleProcessPDF}
                        disabled={!domainName.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <Sparkles className="w-5 h-5" strokeWidth={2} />
                        Process PDF & Generate Topics
                      </motion.button>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-red-800 text-sm font-medium">{error}</p>
                    </motion.div>
                  )}
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
                  <div className="relative w-32 h-32 mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <div className="w-full h-full rounded-full border-4 border-brand-200 border-t-brand-600" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-4 flex items-center justify-center"
                    >
                      <FileText className="w-12 h-12 text-brand-600" strokeWidth={1.5} />
                    </motion.div>
                  </div>
                  <motion.h2
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl font-bold text-gray-900 text-center"
                  >
                    Processing Your PDF...
                  </motion.h2>
                  <p className="text-gray-600 text-center mt-3 max-w-md">
                    AI is analyzing the document and extracting topics categorized by difficulty.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Courses */}
            <AnimatePresence>
              {!isLoading && domainCreated && generatedCourses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <div className="mb-8">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      ✨ Extracted Topics by Difficulty
                    </h2>
                    <p className="text-gray-600">
                      Based on your PDF, we've categorized these learning topics for you.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {generatedCourses.map((course, index) => {
                      const difficultyColors = {
                        1: 'bg-green-100 text-green-800',
                        2: 'bg-blue-100 text-blue-800',
                        3: 'bg-orange-100 text-orange-800',
                        4: 'bg-red-100 text-red-800',
                      };
                      
                      const difficultyLabels = {
                        1: 'BEGINNER',
                        2: 'INTERMEDIATE',
                        3: 'ADVANCED',
                        4: 'EXPERT',
                      };

                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-6">
                            {/* Level Circle */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: course.color }}>
                                {course.id}
                              </div>
                            </div>

                            {/* Course Content */}
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {course.name}
                              </h3>
                              <p className="text-gray-600 text-base mb-4">
                                {course.description}
                              </p>

                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-4 mb-4">
                                <span className={`px-3 py-1 rounded-md text-xs font-bold ${difficultyColors[course.difficulty]}`}>
                                  {difficultyLabels[course.difficulty]}
                                </span>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" strokeWidth={2} />
                                  <span className="text-sm">{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Layers className="w-4 h-4" strokeWidth={2} />
                                  <span className="text-sm">{course.modules} topics</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" strokeWidth={2} />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {course.rating}
                                  </span>
                                </div>
                              </div>

                              {/* Topics Preview */}
                              {course.keyTopics && course.keyTopics.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Topics covered:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {course.keyTopics.slice(0, 5).map((topic, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                        {topic}
                                      </span>
                                    ))}
                                    {course.keyTopics.length > 5 && (
                                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md">
                                        +{course.keyTopics.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-4 mt-10"
                  >
                    <button 
                      onClick={handleSaveDomain}
                      className="group relative px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                    >
                      <span>Save This Domain</span>
                      <Sparkles className="w-5 h-5" strokeWidth={2} />
                      <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                    >
                      Upload Another PDF
                    </button>
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
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => {
                    setDomainSaved(false);
                    navigate('/student/home');
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
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
                      Custom Domain Created! 🎉
                    </h2>
                    <p className="text-gray-600 text-lg mb-2">
                      "{domainName}"
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                      Your PDF-based domain has been saved successfully. You can now access it from your home page.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setDomainSaved(false);
                        navigate('/student/home');
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
                    >
                      Go to Home
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

export default PDFAssessment;
