import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Code2, Trophy, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import QuizModal from "../components/QuizModal";
import QuizProgressSidebar from "../components/QuizProgressSidebar";
import {
  MotivationBoostModal,
  ConfidenceBuilderModal,
  StreakCelebrationModal,
  GentleEncouragementModal,
  ReassuranceModal,
  selectFeedbackModal,
} from "../components/QuizFeedbackModals";
import { MODEL_API, BACKEND_API } from "../lib/apiConfig";
import { encryptPayload, decryptPayload, isEncryptedEnvelope } from "../lib/quizCrypto";

// API Configuration
const QUIZ_API_URL = `${MODEL_API}/quiz`;
const CUSTOM_DOMAIN_API_URL = `${BACKEND_API}/api/custom-domains`;
const QUIZ_SESSION_API_URL = `${BACKEND_API}/api/quiz-sessions`;

const QuizPage = () => {
  const { domainId, programId, level } = useParams();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [domainName, setDomainName] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]); // Store all fetched questions
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); // Store user answers
  const [skippedQuestions, setSkippedQuestions] = useState([]); // Track skipped questions
  const [history, setHistory] = useState([]); // Quiz history for API
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedbackModal, setCurrentFeedbackModal] = useState(null);
  const [streak, setStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimings, setQuestionTimings] = useState([]);

  // Load current user email from localStorage (if logged in)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const parsed = JSON.parse(raw);
        const email =
          parsed?.mail ||
          parsed?.email ||
          parsed?.user?.email ||
          parsed?.profile?.email ||
          null;
        if (email) setUserEmail(email);
      }
    } catch (err) {
      console.error('[QuizPage] Error reading user email from localStorage:', err);
    }
  }, []);

  // Resolve domain name from backend (for custom domains) or fall back to id
  useEffect(() => {
    let isMounted = true;

    const fetchDomainName = async () => {
      try {
        const response = await fetch(`${CUSTOM_DOMAIN_API_URL}/${domainId}`);
        if (response.ok) {
          const result = await response.json();
          const name = result?.data?.name;
          if (isMounted && name) {
            setDomainName(name);
            return;
          }
        }
      } catch (error) {
        console.error("🚨 Failed to fetch custom domain name:", error);
      }

      // Fallback: use the id itself as the name
      if (isMounted) {
        setDomainName(domainId);
      }
    };

    if (domainId) {
      fetchDomainName();
    }

    return () => {
      isMounted = false;
    };
  }, [domainId]);

  // Initialize with 15 empty questions and fetch the first one (after domain name is known)
  useEffect(() => {
    if (!domainName) return;

    // Create 15 placeholder questions
    const placeholders = Array(15)
      .fill(null)
      .map(() => ({
        id: null,
        question: null,
        options: [],
        correctIndex: null,
        hint: null,
        code_context: null,
        explanation: null,
        isPlaceholder: true,
      }));
    setQuestions(placeholders);
    setAnswers(Array(15).fill(null));

    // Fetch the first question into index 0
    fetchQuestion(null, [], 0);
  }, [domainName, programId, level]);

  // Timer
  useEffect(() => {
    if (!showResults && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, questions]);

  // Fetch question from API and place it at a specific index
  const fetchQuestion = async (currentSessionId, currentHistory, targetIndex) => {
    setIsLoading(true);
    try {
      const payload = {
        domain_name: domainName || domainId,
        program_name: programId,
        level: parseInt(level),
        session_id: currentSessionId,
        history: currentHistory
      };

      console.log("📤 API REQUEST PAYLOAD (before encryption):", payload);

      const encryptedBody = await encryptPayload(payload);

      const response = await fetch(QUIZ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encryptedBody),
      });

      const result = await response.json();

      console.log("📥 API RAW RESPONSE:", result);

      let data = result.data;
      if (isEncryptedEnvelope(data)) {
        try {
          data = await decryptPayload(data);
        } catch (e) {
          console.error("🚨 Failed to decrypt quiz data:", e);
          throw e;
        }
      }

      if (result.status === "success" && data) {
        setSessionId(result.session_id);

        const newQuestion = {
          id: data.id,
          question: data.question,
          options: data.options || [],
          correctIndex: data.correctIndex,
          hint: data.hint,
          code_context: data.code_context,
          explanation: data.explanation,
          isPlaceholder: false,
        };

        console.log("✅ FORMATTED QUESTION:", newQuestion);
        console.log("📊 Correct Answer Index:", newQuestion.correctIndex, "=>", newQuestion.options[newQuestion.correctIndex]);

        // Replace the placeholder at the target index with the real question
        setQuestions((prev) => {
          const updated = [...prev];
          updated[targetIndex] = newQuestion;
          return updated;
        });
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        console.error("❌ API ERROR:", result);
      }
    } catch (error) {
      console.error('🚨 FETCH ERROR:', error);
    } finally {
      setIsLoading(false);
      // Start timer for new question
      setQuestionStartTime(Date.now());
    }
  };

  // Build analytics payload for strong/weak area analysis
  const buildTimingPayload = (timings) => {
    // Map question timings by index for quick lookup
    const timingMap = timings.reduce((acc, t) => {
      acc[t.questionIndex] = t;
      return acc;
    }, {});

    return {
      domain_name: domainId,
      program_name: programId,
      level: {
        level_id: `L${level}`,
        level_name: `Level ${level}`,
        difficulty_score: Number(level),
        questions: questions
          .map((q, index) => {
            if (!q || q.isPlaceholder || !q.id) return null;
            const timing = timingMap[index];
            return {
              question_id: q.id,
              question_text: q.question,
              options: q.options || [],
              correct_option_index: q.correctIndex,
              user_answer_index: answers[index],
              is_correct: answers[index] === q.correctIndex,
              time_taken_seconds: timing ? timing.timeTaken : null,
            };
          })
          .filter(Boolean),
      },
    };
  };

  const handleAnswerSelect = (optionIndex) => {
    // Prevent answering if question is skipped
    if (skippedQuestions.includes(currentQuestion)) {
      console.log("⚠️ Cannot answer a skipped question");
      return;
    }
    
    if (isAnswered || questions.length === 0) return;

    const currentQ = questions[currentQuestion];
    const selectedOption = currentQ.options[optionIndex];
    
    console.log("🎯 ANSWER SELECTED:");
    console.log("  Question:", currentQ.question);
    console.log("  Selected Option Index:", optionIndex);
    console.log("  Selected Answer:", selectedOption);
    console.log("  Correct Answer Index:", currentQ.correctIndex);
    console.log("  Correct Answer:", currentQ.options[currentQ.correctIndex]);
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    // Record time taken to answer this question
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000); // in seconds
    const newTiming = {
      questionIndex: currentQuestion,
      questionId: currentQ.id,
      timeTaken: timeTaken,
      isCorrect: optionIndex === currentQ.correctIndex
    };
    const updatedTimings = [...questionTimings, newTiming];
    setQuestionTimings(updatedTimings);

    // Store structured analytics JSON in localStorage
    const timingPayload = buildTimingPayload(updatedTimings);
    if (sessionId) {
      localStorage.setItem(`quiz_timings_${sessionId}`, JSON.stringify(timingPayload));
    }
    
    console.log("⏱️ QUESTION TIMING:", newTiming);

    // Check if answer is correct
    const isCorrect = optionIndex === currentQ.correctIndex;
    console.log("  Is Correct?", isCorrect ? "✅ YES" : "❌ NO");

    // Update streak
    if (isCorrect) {
      setStreak(streak + 1);
      setWrongAttempts(0);
      setCorrectCount(correctCount + 1);
    } else {
      setStreak(0);
      setWrongAttempts(wrongAttempts + 1);
      setWrongCount(wrongCount + 1);
    }

    // Determine which modal to show
    let modalType;
    if (isCorrect) {
      // Correct answer logic
      if (streak + 1 >= 3) {
        modalType = 'streak';
      } else {
        modalType = 'motivation';
      }
    } else {
      // Wrong answer logic - alternate between encouragement and reassurance
      modalType = (wrongAttempts + 1) % 2 === 1 ? 'encouragement' : 'reassurance';
    }

    setCurrentFeedbackModal(modalType);
    setShowFeedbackModal(true);
    setCurrentExplanation(currentQ.explanation || "");
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return;

    // Build history entry for the current question
    const selectedOption = currentQ.options[answers[currentQuestion]];
    const isCorrect = answers[currentQuestion] === currentQ.correctIndex;

    const newHistoryEntry = {
      question_text: currentQ.question,
      user_answer: selectedOption,
      was_correct: isCorrect,
    };

    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);

    const nextIndex = currentQuestion + 1;

    // Safety guard: should not happen because we cap at 15
    if (nextIndex >= questions.length) return;

    const nextQuestion = questions[nextIndex];

    // If we already have a real question at nextIndex, just navigate
    if (nextQuestion && !nextQuestion.isPlaceholder) {
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(answers[nextIndex]);
      setIsAnswered(answers[nextIndex] !== null || skippedQuestions.includes(nextIndex));
      setQuestionStartTime(Date.now());
      return;
    }

    // Otherwise, move to the placeholder and fetch a new question for that slot
    setCurrentQuestion(nextIndex);
    setSelectedAnswer(null);
    setIsAnswered(false);
    fetchQuestion(sessionId, updatedHistory, nextIndex);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setIsAnswered(answers[currentQuestion - 1] !== null || skippedQuestions.includes(currentQuestion - 1));
      // Reset timer for navigating to previous question
      setQuestionStartTime(Date.now());
    }
  };

  const handleSkip = () => {
    const nextIndex = currentQuestion + 1;

    // Safety guard: don't skip beyond the last question
    if (nextIndex >= questions.length) return;

    // Mark this question as skipped
    if (!skippedQuestions.includes(currentQuestion)) {
      setSkippedQuestions([...skippedQuestions, currentQuestion]);
    }

    // Record that this question was skipped (answer remains null)
    console.log("⏭️ SKIPPED QUESTION:", currentQuestion + 1);

    // Persist quiz session to backend when skipping
    if (userEmail) {
      const payloadSessionId = sessionId || `local_${Date.now()}`;
      const questionPayload = {
        sessionId: payloadSessionId,
        domainId,
        programId,
        level,
        questions: questions.map((q, index) => ({
          question_id: q?.id,
          question_text: q?.question,
          options: q?.options || [],
          correct_option_index: q?.correctIndex,
          user_answer_index: answers[index],
          is_correct: answers[index] === q?.correctIndex,
        })),
        timings: questionTimings,
        attemptedAt: new Date().toISOString(),
      };

      fetch(QUIZ_SESSION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          domainId,
          sessionId: payloadSessionId,
          payload: questionPayload,
          attemptedAt: questionPayload.attemptedAt,
        }),
      })
        .then((res) => res.json().catch(() => null))
        .then((data) => {
          console.log('[QuizPage] Quiz session persisted on skip:', data);
        })
        .catch((err) => {
          console.error('[QuizPage] Error persisting quiz session on skip:', err);
        });
    }

    // Build history entry for the skipped question
    const currentQ = questions[currentQuestion];
    if (currentQ && currentQ.question) {
      const newHistoryEntry = {
        question_text: currentQ.question,
        user_answer: null,
        was_correct: false,
      };
      setHistory([...history, newHistoryEntry]);
    }

    const nextQuestion = questions[nextIndex];

    // If we already have a real question at nextIndex, just navigate
    if (nextQuestion && !nextQuestion.isPlaceholder) {
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(answers[nextIndex]);
      setIsAnswered(answers[nextIndex] !== null || skippedQuestions.includes(nextIndex));
      setQuestionStartTime(Date.now());
      return;
    }

    // Otherwise, move to the placeholder and fetch a new question for that slot
    setCurrentQuestion(nextIndex);
    setSelectedAnswer(null);
    setIsAnswered(false);
    fetchQuestion(sessionId, history.length > 0 ? history : [], nextIndex);
  };

  const handleQuestionClick = (index) => {
    // Prevent jumping into completely unfetched placeholder questions
    if (questions[index]?.isPlaceholder) return;

    setCurrentQuestion(index);
    setSelectedAnswer(answers[index]);
    setIsAnswered(answers[index] !== null || skippedQuestions.includes(index));
    // Reset timer when clicking on a specific question
    setQuestionStartTime(Date.now());
  };

  const handleSubmit = () => {
    // Build final payload and store in localStorage, then navigate to insights
    const timingPayload = buildTimingPayload(questionTimings);

    const payloadSessionId = sessionId || `local_${Date.now()}`;
    const questionPayload = {
      sessionId: payloadSessionId,
      domainId,
      programId,
      level,
      questions: questions.map((q, index) => ({
        question_id: q?.id,
        question_text: q?.question,
        options: q?.options || [],
        correct_option_index: q?.correctIndex,
        user_answer_index: answers[index],
        is_correct: answers[index] === q?.correctIndex,
      })),
      timings: questionTimings,
      analytics: timingPayload,
      attemptedAt: new Date().toISOString(),
    };

    // Derive final scoring metrics from the stored questions
    const totalQuestionsCount = questionPayload.questions.length;
    const correctAnswersCount = questionPayload.questions.filter((q) => q.is_correct).length;
    const scorePercent = totalQuestionsCount
      ? (correctAnswersCount / totalQuestionsCount) * 100
      : 0;

    questionPayload.totalQuestions = totalQuestionsCount;
    questionPayload.correctAnswers = correctAnswersCount;
    questionPayload.scorePercent = scorePercent;

    const storageKey = `quiz_payload_${payloadSessionId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(questionPayload));
      console.log('📥 QUIZ PAYLOAD STORED:', storageKey, questionPayload);
    } catch (err) {
      console.error('❌ Failed to store quiz payload in localStorage:', err);
    }

    // Also persist timing analytics to the legacy key for backwards compatibility
    if (payloadSessionId) {
      try {
        localStorage.setItem(`quiz_timings_${payloadSessionId}`, JSON.stringify(timingPayload));
      } catch (err) {
        console.error('❌ Failed to store timing payload:', err);
      }
    }

    // If user is logged in, persist session to backend (non-blocking)
    if (userEmail) {
      fetch(QUIZ_SESSION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          domainId,
          sessionId: payloadSessionId,
          payload: questionPayload,
          attemptedAt: questionPayload.attemptedAt,
        }),
      })
        .then((res) => res.json().catch(() => null))
        .then((data) => {
          console.log('[QuizPage] Quiz session persisted:', data);
        })
        .catch((err) => {
          console.error('[QuizPage] Error persisting quiz session:', err);
        });
    }

    // Navigate to insights page (page should read from localStorage by session key)
    // Include session id in URL and pass scoring summary in state for accurate display
    navigate(`/quiz-insights/${payloadSessionId}`, {
      state: {
        storageKey,
        totalQuestions: totalQuestionsCount,
        correctAnswers: correctAnswersCount,
        score: Math.round(scorePercent),
      },
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  // Feedback modal handlers
  const handleModalNext = () => {
    setShowFeedbackModal(false);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = ((score / questions.length) * 100).toFixed(1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-600 to-brand-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-in zoom-in duration-700 delay-100">
              <Trophy className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 animate-in slide-in-from-bottom duration-500 delay-200">
              Quiz Complete!
            </h1>
            <p className="text-slate-600 animate-in slide-in-from-bottom duration-500 delay-300">Great job finishing the quiz</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-brand-50 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 animate-in slide-in-from-left duration-500 delay-400">
              <Target className="text-brand-600 mx-auto mb-2" size={24} />
              <p className="text-sm text-brand-600 font-semibold mb-1">Score</p>
              <p className="text-3xl font-bold text-brand-900">
                {score}/{questions.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 animate-in slide-in-from-bottom duration-500 delay-500">
              <Trophy className="text-green-600 mx-auto mb-2" size={24} />
              <p className="text-sm text-green-600 font-semibold mb-1">
                Percentage
              </p>
              <p className="text-3xl font-bold text-green-900">{percentage}%</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 animate-in slide-in-from-right duration-500 delay-600">
              <Clock className="text-blue-600 mx-auto mb-2" size={24} />
              <p className="text-sm text-blue-600 font-semibold mb-1">Time</p>
              <p className="text-3xl font-bold text-blue-900 tabular-nums">
                {Math.floor(timeElapsed / 60)}:
                {(timeElapsed % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-brand-600 text-white rounded-lg font-bold text-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 animate-in slide-in-from-bottom duration-500 delay-700"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-6 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-6">
            <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">
              {domainId} • Program {programId} • Level {level}
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Question Component */}
            <div className="lg:col-span-2">
              {questions[currentQuestion]?.isPlaceholder ? (
                <div className="bg-white rounded-xl p-8 shadow-md flex items-center justify-center min-h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mx-auto mb-3"></div>
                    <p className="text-slate-600 font-medium">Loading question...</p>
                  </div>
                </div>
              ) : questions.length > currentQuestion && questions[currentQuestion]?.question ? (
                <QuizModal
                  question={questions[currentQuestion]}
                  currentIndex={currentQuestion}
                  totalQuestions={questions.length}
                  onAnswerSelect={handleAnswerSelect}
                  selectedAnswer={selectedAnswer}
                  isAnswered={isAnswered}
                  isSkipped={skippedQuestions.includes(currentQuestion)}
                />
              ) : null}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-brand-600 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md transform hover:-translate-x-0.5"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <div className="flex gap-3">
                  {currentQuestion < 14 && (
                    <button
                      onClick={handleSkip}
                      disabled={isAnswered}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-400 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                    >
                      Skip
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {currentQuestion >= 14 ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Submit Quiz
                  </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!isAnswered || isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-x-0.5"
                    >
                      {isLoading ? 'Loading...' : 'Next'}
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Progress Sidebar Component */}
            <div className="lg:col-span-1">
              <QuizProgressSidebar
                questions={questions}
                answers={answers}
                currentQuestion={currentQuestion}
                onQuestionClick={handleQuestionClick}
                timeElapsed={timeElapsed}
                totalQuestions={15}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modals */}
      <MotivationBoostModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'motivation'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        count={correctCount}
        explanation={currentExplanation}
      />

      <ConfidenceBuilderModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'confidence'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        count={correctCount}
        explanation={currentExplanation}
      />

      <StreakCelebrationModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'streak'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        streak={streak}
        explanation={currentExplanation}
      />

      <GentleEncouragementModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'encouragement'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        count={wrongCount}
        explanation={currentExplanation}
      />

      <ReassuranceModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'reassurance'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        count={wrongCount}
        explanation={currentExplanation}
      />
    </div>
  );
};

export default QuizPage;