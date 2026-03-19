import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Timer, Zap, Lock, ChevronLeft, ChevronRight, Award, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MotivationBoostModal,
  ConfidenceBuilderModal,
  StreakCelebrationModal,
  GentleEncouragementModal,
  ReassuranceModal,
} from '../../components/QuizFeedbackModals';

import { MODEL_API } from '../../lib/apiConfig';

// Use the same quiz backend as the main QuizPage
const QUIZ_API_URL = `${MODEL_API}/quiz`;

const GuestAssessment = () => {
  const { programId } = useParams(); // Using domainId as programId
  const navigate = useNavigate();

  // Quiz state (backend-driven, similar to QuizPage)
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [history, setHistory] = useState([]);

  // Feedback state (similar to QuizPage)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedbackModal, setCurrentFeedbackModal] = useState(null);
  const [streak, setStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const TOTAL_QUESTIONS = 5; // Short calibration assessment

  // Current question derived from questions list
  const currentQuestion = questions[currentQuestionIndex] || null;

  const hasAnsweredCurrent =
    answers[currentQuestionIndex] !== undefined &&
    answers[currentQuestionIndex] !== null;
  const canGoPrevious = currentQuestionIndex > 0;
  // Allow Next even on the last question so user can view results
  const canGoNext = hasAnsweredCurrent;

  // Fetch a question from the backend quiz engine
  const fetchQuestion = async (currentSessionId, currentHistory, targetIndex) => {
    if (!programId) return;

    setIsLoading(true);
    try {
      const payload = {
        domain_name: programId,           // treat route param as domain
        program_name: programId, // label for backend
        level: 5,                         // simple default level
        session_id: currentSessionId,
        history: currentHistory,
      };

      console.log('[GuestAssessment] 📤 API REQUEST PAYLOAD:', payload);

      const response = await fetch(QUIZ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log('[GuestAssessment] 📥 API RESPONSE:', result);

      if (result.status === 'success') {
        setSessionId(result.session_id);

        const newQuestion = {
          id: result.data.id,
          question: result.data.question,
          options: result.data.options || [],
          correctIndex: result.data.correctIndex,
          hint: result.data.hint,
          code_context: result.data.code_context,
          explanation: result.data.explanation,
        };

        setQuestions((prev) => {
          const updated = [...prev];
          updated[targetIndex] = newQuestion;
          return updated;
        });

        setAnswers((prev) => {
          const next = [...prev];
          if (next.length <= targetIndex) {
            next.length = targetIndex + 1;
          }
          return next;
        });
      } else {
        console.error('[GuestAssessment] Quiz API error:', result);
      }
    } catch (err) {
      console.error('[GuestAssessment] Quiz API fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial question load
  useEffect(() => {
    setQuestions([]);
    setAnswers([]);
    setHistory([]);
    setCurrentQuestionIndex(0);
    setSessionId(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
    fetchQuestion(null, [], 0);
  }, [programId]);

  // Timer: reset when question or modal changes
  useEffect(() => {
    if (!currentQuestion || showModal) return;

    setTimer(0);
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, showModal]);

  // Keep selected state in sync when navigating between questions
  useEffect(() => {
    const answerIndex = answers[currentQuestionIndex];
    if (answerIndex === undefined || answerIndex === null) {
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setSelectedAnswer(answerIndex);
      setIsAnswered(true);
    }
  }, [currentQuestionIndex, answers]);

  const handleAnswer = (selectedIndex) => {
    if (!currentQuestion || isLoading || isAnswered) return;

    const option = currentQuestion.options[selectedIndex];
    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    console.log('[GuestAssessment] 🎯 ANSWER SELECTED:');
    console.log('  Question:', currentQuestion.question);
    console.log('  Selected Option Index:', selectedIndex);
    console.log('  Selected Answer:', option);
    console.log('  Correct Answer Index:', currentQuestion.correctIndex);
    console.log('  Correct Answer:', currentQuestion.options[currentQuestion.correctIndex]);

    // Track answer
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = selectedIndex;
      return updated;
    });

    setSelectedAnswer(selectedIndex);
    setIsAnswered(true);

    // Build simple history entry for backend adaptivity
    const newHistoryEntry = {
      question_text: currentQuestion.question,
      user_answer: option,
      was_correct: isCorrect,
    };
    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);

    // Update streak / counters for feedback
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setWrongAttempts(0);
      setCorrectCount((prev) => prev + 1);
    } else {
      setStreak(0);
      setWrongAttempts((prev) => prev + 1);
      setWrongCount((prev) => prev + 1);
    }

    console.log('[GuestAssessment]  ✅ Is Correct?', isCorrect ? 'YES' : 'NO');

    const nextIndex = currentQuestionIndex + 1;

    // Decide which feedback modal to show (similar rules to QuizPage)
    let modalType;
    if (isCorrect) {
      if (streak + 1 >= 3) {
        modalType = 'streak';
      } else {
        modalType = 'motivation';
      }
    } else {
      modalType = (wrongAttempts + 1) % 2 === 1 ? 'encouragement' : 'reassurance';
    }

    setCurrentFeedbackModal(modalType);
    setCurrentExplanation(currentQuestion.explanation || '');
    setShowFeedbackModal(true);
  };

  const handleFeedbackNext = () => {
    setShowFeedbackModal(false);
  };

  const handleNextQuestion = async () => {
    if (!hasAnsweredCurrent || isLoading) return;

    // End of calibration -> show results first
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      setShowResultModal(true);
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    // Always fetch a fresh question for the next index when moving forward
    await fetchQuestion(sessionId, history, nextIndex);
    setCurrentQuestionIndex(nextIndex);
  };

  const score = correctCount * 20; // simple XP-style score based on correct answers

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-3xl mx-auto pt-32 px-6">
        
        {/* Progress & Difficulty Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{programId?.replace('-', ' ')} Assessment</h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-blue-100 text-blue-700 border-blue-200">
                 Adaptive Quiz
               </span>
               <span className="text-slate-400 text-sm font-bold">• Question {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-mono font-bold text-slate-700">
            <Timer size={18} className="text-brand-600" />
            00:{timer < 10 ? `0${timer}` : timer}
          </div>
        </div>

        {/* Question Tiles */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
            const isAvailable = Boolean(questions[idx]);
            const disabled = !isAvailable;

            let tileClasses =
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-200 ';

            if (isCurrent) {
              tileClasses += 'bg-brand-600 text-white border-brand-600 shadow-md scale-105';
            } else if (isAnswered) {
              tileClasses += 'bg-green-50 text-green-700 border-green-400';
            } else if (isAvailable) {
              tileClasses += 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer';
            } else {
              tileClasses += 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    setCurrentQuestionIndex(idx);
                  }
                }}
                className={tileClasses}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <motion.div 
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 relative overflow-hidden"
        >
           {/* Top colored bar */}
           <div className="absolute top-0 left-0 right-0 h-2 bg-brand-500" />

          <h3 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={(function () {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  let base = 'w-full text-left p-5 rounded-2xl border-2 transition-all font-medium flex items-center justify-between group ';

                  if (isAnswered) {
                    if (isCorrect) {
                      return (
                        base +
                        'border-green-500 bg-green-50 text-green-900 shadow-sm'
                      );
                    }
                    if (isSelected && !isCorrect) {
                      return (
                        base +
                        'border-red-500 bg-red-50 text-red-900 shadow-sm'
                      );
                    }
                    return base + 'border-slate-200 bg-slate-50 text-slate-500';
                  }

                  if (isSelected) {
                    return (
                      base +
                      'border-brand-600 bg-brand-50 text-brand-900 shadow-md transform scale-[1.02]'
                    );
                  }

                  return (
                    base +
                    'border-slate-100 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:shadow-md'
                  );
                })()}
              >
                <span>{option}</span>
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-brand-500" />
              </button>
            ))}
          </div>

          {isAnswered && (
            <div
              className={`mt-6 p-4 rounded-xl border-2 text-sm ${
                selectedAnswer === currentQuestion.correctIndex
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <p className="font-semibold mb-1">
                {selectedAnswer === currentQuestion.correctIndex
                  ? '✓ Correct!'
                  : '✗ Incorrect'}
              </p>
              <p className="text-slate-700 text-xs">
                The correct answer is:{' '}
                <span className="font-semibold">
                  {currentQuestion.options[currentQuestion.correctIndex]}
                </span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => canGoPrevious && setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={!canGoPrevious}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-brand-600 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md transform hover:-translate-x-0.5"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!canGoNext || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-x-0.5"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {currentQuestionIndex === TOTAL_QUESTIONS - 1 ? 'View Results' : 'Next'}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Modal shown after finishing all questions, before signup */}
      {showResultModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 text-center overflow-hidden border border-slate-100"
          >
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
              <Award size={32} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete!</h2>
            <p className="text-slate-500 mb-6">Here’s a quick snapshot of your starting level.</p>

            <div className="mb-6">
              <div className="text-4xl font-black text-brand-600 tracking-tight mb-1">
                {score >= 140 ? 'Advanced' : score >= 100 ? 'Intermediate' : 'Beginner'}
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <TrendingUp size={16} />
                <span>Score: {score} XP</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-left">
              <h4 className="font-bold text-slate-800 text-sm mb-2">What’s next?</h4>
              <p className="text-sm text-slate-600">
               Sign up to unlock the full capabilities of the platform and continue with a personalized, data-driven learning experience.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/auth/signup')}
                className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
              >
                Sign Up to Unlock
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full py-3.5 bg-white text-slate-700 font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Already have an account? Login
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* --- SIGNUP MODAL --- */}
      {/**
       * Unlock Your Results modal temporarily disabled.
       * The Sign Up / Login buttons now live directly on the result snapshot above.
       */}
      {/**
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-50 to-white -z-10"></div>
              
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Lock size={32} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Your Results</h2>
              <p className="text-slate-500 mb-8">
                Great job! You've completed the calibration assessment. To view your 
                <span className="font-bold text-slate-900"> Skill Snapshot</span>, 
                <span className="font-bold text-slate-900"> Predicted Salary</span>, and 
                <span className="font-bold text-slate-900"> Personalized Roadmap</span>, 
                please create a free account.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/auth/signup')}
                  className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                >
                  <Zap size={18} fill="currentColor" />
                  Sign Up to Unlock
                </button>
                <button 
                  onClick={() => navigate('/auth/login')}
                  className="w-full py-3.5 bg-white text-slate-700 font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Already have an account? Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      */}

      {/* Answer Feedback Modals (same components as QuizPage) */}
      <MotivationBoostModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'motivation'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleFeedbackNext}
        count={correctCount}
        explanation={currentExplanation}
      />

      <ConfidenceBuilderModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'confidence'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleFeedbackNext}
        count={correctCount}
        explanation={currentExplanation}
      />

      <StreakCelebrationModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'streak'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleFeedbackNext}
        streak={streak}
        explanation={currentExplanation}
      />

      <GentleEncouragementModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'encouragement'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleFeedbackNext}
        count={wrongCount}
        explanation={currentExplanation}
      />

      <ReassuranceModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'reassurance'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleFeedbackNext}
        count={wrongCount}
        explanation={currentExplanation}
      />

    </div>
  );
};

export default GuestAssessment;