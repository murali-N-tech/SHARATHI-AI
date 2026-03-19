import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { BACKEND_API } from '../../lib/apiConfig';
import { ArrowLeft, BookOpen, Clock, Zap, Star, Heart, Award, Lock, Target, CheckCircle } from "lucide-react";
import { checkAndGenerateCertificates } from "../../utils/certificateApi";

const CustomDomainDetails = () => {
  const navigate = useNavigate();
  const { domainId } = useParams();
  const [customDomain, setCustomDomain] = useState(null);
  const [courseCompletionStatus, setCourseCompletionStatus] = useState({}); // Track completion per course
  const [finalAssessmentCompleted, setFinalAssessmentCompleted] = useState(false);
  const [showCertificateNotification, setShowCertificateNotification] = useState(false);

  // Load custom domain using URL parameter
  // 1) Try localStorage for fast client-side access
  // 2) Fallback to backend API if not present locally (e.g. different device)
  useEffect(() => {
    const loadCustomDomain = async () => {
      if (!domainId) {
        navigate('/student/home');
        return;
      }

      // First, try to read from localStorage
      let storedDomains = [];
      try {
        const stored = localStorage.getItem('customDomains');
        if (stored) {
          storedDomains = JSON.parse(stored);
          const found = storedDomains.find((d) => d.id === domainId);
          if (found) {
            setCustomDomain(found);
            return; // We are done
          }
        }
      } catch (e) {
        console.error('Failed to load custom domains from localStorage:', e);
      }

      // If not found in localStorage, fetch from backend by id
      try {
        const res = await fetch(`${BACKEND_API}/api/custom-domains/${domainId}`);
        if (!res.ok) {
          console.error('Failed to fetch custom domain from backend:', res.status);
          navigate('/student/home');
          return;
        }

        const body = await res.json();
        const domain = body?.data;
        if (!domain) {
          console.error('Custom domain not found in backend response');
          navigate('/student/home');
          return;
        }

        // Normalize id field and update state
        const normalized = { ...domain, id: domain.id || domain._id || domainId };
        setCustomDomain(normalized);

        // Also cache to localStorage for future fast access
        try {
          const updated = [...storedDomains.filter((d) => d.id !== normalized.id), normalized];
          localStorage.setItem('customDomains', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to cache custom domain in localStorage:', e);
        }
      } catch (e) {
        console.error('Error fetching custom domain from backend:', e);
        navigate('/student/home');
      }
    };

    loadCustomDomain();
  }, [domainId, navigate]);

  // Fetch completion status for each course
  useEffect(() => {
    if (!customDomain) return;

    const fetchCompletionStatus = async () => {
      // Get user email from localStorage
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) return;

      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (e) {
        console.error('Failed to parse userData:', e);
        return;
      }

      const email = userData?.email;
      if (!email) return;

      // For each course, fetch completed levels
      const completionStatus = {};
      let courseIndex = 0;
      
      for (const course of customDomain.courses) {
        try {
          const slug = (course.slug || course.name || `course-${courseIndex+1}`)
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-');
          
          const q = new URLSearchParams({ domainId, programId: slug, email });
          const url = `${BACKEND_API}/api/quiz-sessions/levels/completed?${q.toString()}`;
          
          const res = await fetch(url);
          if (!res.ok) {
            completionStatus[course.id] = { completed: false, completedLevels: 0, totalLevels: course.modules || 5 };
            continue;
          }

          const body = await res.json();
          const completedLevels = body.completedLevels || [];
          const totalLevels = course.modules || 5;
          
          // Mark course as complete if all levels are completed
          const isComplete = completedLevels.length >= totalLevels;
          completionStatus[course.id] = {
            completed: isComplete,
            completedLevels: completedLevels.length,
            totalLevels: totalLevels
          };

          console.log(`Course ${course.name}: ${completedLevels.length}/${totalLevels} levels completed`);
        } catch (e) {
          console.error(`Error fetching completion for course ${course.name}:`, e);
          completionStatus[course.id] = { completed: false, completedLevels: 0, totalLevels: course.modules || 5 };
        }
        courseIndex++;
      }

      // Check if final assessment is completed
      try {
        const finalQ = new URLSearchParams({ domainId, programId: 'final-assessment', email });
        const finalUrl = `${BACKEND_API}/api/quiz-sessions/levels/completed?${finalQ.toString()}`;
        
        const finalRes = await fetch(finalUrl);
        if (finalRes.ok) {
          const finalBody = await finalRes.json();
          const finalCompletedLevels = finalBody.completedLevels || [];
          const isFinalComplete = finalCompletedLevels.length > 0;
          setFinalAssessmentCompleted(isFinalComplete);
          console.log(`Final Assessment: ${isFinalComplete ? 'Completed' : 'Not completed'}`);
        }
      } catch (e) {
        console.error('Error fetching final assessment completion:', e);
      }

      // Calculate domain progress (including final assessment as 1 course)
      const allCourseIds = customDomain.courses.map(c => c.id);
      const allCoursesCompleted = allCourseIds.every(id => completionStatus[id]?.completed);
      
      const completedCourses = Object.values(completionStatus).filter(c => c.completed).length;
      const totalCourses = customDomain.courses.length + 1; // +1 for final assessment
      const progress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

      // Save progress to backend
      try {
        await fetch(`${BACKEND_API}/api/domain-progress/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domainId,
            email,
            progress,
            completedCourses,
            totalCourses
          })
        });
        console.log(`✓ Saved domain progress: ${progress}% (${completedCourses}/${totalCourses})`);
      } catch (e) {
        console.error('Error saving domain progress:', e);
      }

      setCourseCompletionStatus(completionStatus);
    };

    fetchCompletionStatus();
  }, [customDomain, domainId]);

  // When final assessment is completed, generate certificates
  useEffect(() => {
    if (finalAssessmentCompleted && customDomain) {
      const generateCertificates = async () => {
        try {
          console.log('🎓 All programs completed! Generating certificates...');
          console.log('Domain courses:', customDomain.courses);
          // Include all course IDs plus final assessment as the 5th program
          const completedIds = [
            ...customDomain.courses.map(c => c.id),
            'final-assessment'
          ];
          console.log('Completed program IDs (including final assessment):', completedIds);
          
          const result = await checkAndGenerateCertificates(completedIds, domainId);
          
          if (result) {
            console.log('✓ Certificate API response:', result);
            
            if (result?.certificatesCreated) {
              console.log('✓ Certificates generated successfully!', result);
              setShowCertificateNotification(true);
              
              // Auto-hide notification after 5 seconds
              setTimeout(() => {
                setShowCertificateNotification(false);
              }, 5000);
              
              // Redirect to certificates page after 3 seconds
              setTimeout(() => {
                navigate('/student/certificates');
              }, 3000);
            } else {
              console.log('Certificate generation result (not yet created):', result.message);
            }
          } else {
            console.error('❌ Certificate API returned null/falsy response');
          }
        } catch (error) {
          console.error('❌ Error generating certificates:', error);
        }
      };

      generateCertificates();
    }
  }, [finalAssessmentCompleted, customDomain, navigate]);

  if (!customDomain) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return 'bg-green-500 text-white';
    if (difficulty <= 3) return 'bg-yellow-500 text-white';
    if (difficulty <= 4) return 'bg-red-500 text-white';
    return 'bg-purple-500 text-white';
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty <= 2) return 'BEGINNER';
    if (difficulty <= 3) return 'INTERMEDIATE';
    if (difficulty <= 4) return 'ADVANCED';
    return 'EXPERT';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
            {/* Certificate Success Notification */}
            <AnimatePresence>
              {showCertificateNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3"
                >
                  <Award className="w-6 h-6" strokeWidth={2} />
                  <div>
                    <p className="font-bold">🎉 Certificates Generated!</p>
                    <p className="text-sm opacity-90">All your certificates are ready. Redirecting...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Back Button */}
                <button
                  onClick={() => navigate('/student/home')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
                  <span className="font-medium">Back to Home</span>
                </button>

                {/* Domain Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-9 h-9 text-amber-600 fill-amber-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{customDomain.name}</h1>
                      <p className="text-gray-600 mb-3">
                        Explore {customDomain.courses.length} programs to master {customDomain.name}
                      </p>
                      
                      {/* Progress Section */}
                      {(() => {
                        const allCourseIds = customDomain.courses.map(c => c.id);
                        const allCoursesCompleted = allCourseIds.every(id => courseCompletionStatus[id]?.completed);
                        
                        const completedCourses = Object.values(courseCompletionStatus).filter(c => c.completed).length + (finalAssessmentCompleted ? 1 : 0);
                        const totalCourses = customDomain.courses.length + 1; // +1 for final assessment
                        const progressPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
                        
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-gray-700">Domain Progress</span>
                              <span className="font-bold text-amber-600">{completedCourses}/{totalCourses} programs completed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                              />
                            </div>
                            <div className="text-xs text-gray-600 text-right">{progressPercentage}% Complete</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {customDomain.courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 hover:border-brand-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
                        <div className="flex items-center gap-4 p-5">
                          {/* Number Badge */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                          </div>

                          {/* Course Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-1">
                                  {course.name}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                              </div>
                            </div>

                      <div className="flex items-center gap-6 text-sm">
                              <div className={`px-2.5 py-0.5 rounded text-xs font-bold ${getDifficultyColor(course.difficulty)}`}>
                                {getDifficultyLabel(course.difficulty)}
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-4 h-4" strokeWidth={2} />
                                <span className="font-medium">{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <BookOpen className="w-4 h-4" strokeWidth={2} />
                                <span className="font-medium">{course.modules} modules</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" strokeWidth={2} />
                                <span className="font-medium">{course.rating} ({course.reviews.toLocaleString()})</span>
                              </div>
                              
                              {/* Completion Status - Show badge only if not completed */}
                              {courseCompletionStatus[course.id] && !courseCompletionStatus[course.id].completed && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                  {`${courseCompletionStatus[course.id].completedLevels}/${courseCompletionStatus[course.id].totalLevels}`}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <button
                              onClick={() => {
                                const slug = (course.slug || course.name || `course-${index+1}`).toString().toLowerCase().replace(/\s+/g,'-');
                                navigate(`/student/roadmap/${domainId}/${slug}`, { 
                                  state: { 
                                    program: course,
                                    domainTitle: customDomain.name,
                                    domainId: domainId,
                                    isCustomDomain: true
                                  } 
                                })
                              }}
                              className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm ${
                                courseCompletionStatus[course.id]?.completed
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                  : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white'
                              }`}
                            >
                              <Zap className="w-4 h-4" strokeWidth={2} />
                              {courseCompletionStatus[course.id]?.completed ? 'Review Course' : 'Start Learning'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Domain Assessment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: customDomain.courses.length * 0.03 }}
                className="group mt-8"
              >
                {(() => {
                  const allCourseIds = customDomain.courses.map(c => c.id);
                  const allCoursesCompleted = allCourseIds.every(id => courseCompletionStatus[id]?.completed);
                  
                  return (
                    <div className={`bg-white rounded-xl border-2 ${allCoursesCompleted ? 'border-indigo-400' : 'border-dashed border-gray-300'} hover:border-indigo-400 transition-all duration-300 p-6`}>
                      <div className="flex items-center gap-6">
                        {/* Icon Section */}
                        <div className="flex-shrink-0 relative">
                          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                            allCoursesCompleted ? 'bg-indigo-100' : 'bg-indigo-100'
                          }`}>
                            <Award className={`w-10 h-10 ${allCoursesCompleted ? 'text-indigo-600' : 'text-indigo-600'}`} strokeWidth={2} />
                          </div>
                          {!allCoursesCompleted && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {customDomain.name} Final Assessment
                            </h3>
                            <p className="text-sm text-gray-600">
                              {allCoursesCompleted 
                                ? '🎉 All programs completed! Take the final assessment to earn your certificate.'
                                : `Complete all ${customDomain.courses.length} programs to unlock this test`
                              }
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-gray-400" strokeWidth={2} />
                              <span>50 Questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" strokeWidth={2} />
                              <span>60 Minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-gray-400" strokeWidth={2} />
                              <span>Certificate Available</span>
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0">
                          <button
                            disabled={!allCoursesCompleted || finalAssessmentCompleted}
                            onClick={() => {
                              if (allCoursesCompleted && !finalAssessmentCompleted) {
                                // Navigate to final assessment/quiz
                                navigate(`/quiz/${domainId}/final-assessment`, { 
                                  state: { 
                                    domainTitle: customDomain.name,
                                    domainId: domainId,
                                    isFinalAssessment: true
                                  } 
                                })
                              }
                            }}
                            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                              finalAssessmentCompleted
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : allCoursesCompleted
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white cursor-pointer shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {finalAssessmentCompleted ? (
                              <>
                                <CheckCircle className="w-4 h-4" strokeWidth={2} />
                                Completed
                              </>
                            ) : allCoursesCompleted ? (
                              <>
                                <Zap className="w-4 h-4" strokeWidth={2} />
                                Take Assessment
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" strokeWidth={2} />
                                Locked
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomDomainDetails;
