import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Code2, Trophy, Target, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import QuizModal from "../components/QuizModal";
import { MODEL_API, BACKEND_API } from "../lib/apiConfig";
import QuizProgressSidebar from "../components/QuizProgressSidebar";
import { encryptPayload, decryptPayload, isEncryptedEnvelope } from "../lib/quizCrypto";
import {
  MotivationBoostModal,
  ConfidenceBuilderModal,
  StreakCelebrationModal,
  GentleEncouragementModal,
  ReassuranceModal,
  selectFeedbackModal,
} from "../components/QuizFeedbackModals";

// Dummy Questions Data (15 Questions)
const DUMMY_QUESTIONS = Array.from({ length: 15 }, (_, i) => ({
  id: `q${i + 1}`,
  question: `Question ${i + 1}: What is the correct answer for this programming concept?`,
  options: [
    `Option A: This is the first choice for question ${i + 1}`,
    `Option B: This is the second choice for question ${i + 1}`,
    `Option C: This is the correct answer for question ${i + 1}`,
    `Option D: This is the fourth choice for question ${i + 1}`
  ],
  correctIndex: 2,
  hint: `Think about the fundamental concepts related to question ${i + 1}`,
  code_context: i % 3 === 0 ? `// Sample code for question ${i + 1}\nfunction example() {\n  return true;\n}` : null,
  explanation: `The correct answer is Option C because it demonstrates the proper understanding of the concept in question ${i + 1}.`,
  isPlaceholder: false
}));

const FinalQuizPage = () => {
  const { domainId, programId, level, id } = useParams();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [questions, setQuestions] = useState([]); // Store all fetched questions
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); // Store user answers
  const [skippedQuestions, setSkippedQuestions] = useState([]); // Track skipped questions
  const [history, setHistory] = useState([]); // Quiz history for API
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [showResults, setShowResults] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [topics, setTopics] = useState([]);
  const [adaptiveLevel, setAdaptiveLevel] = useState(Number(level) || 3);
  const [assignmentLabel, setAssignmentLabel] = useState("");

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

  const TOTAL_QUESTIONS = 15;
  const QUIZ_DURATION = 3600; // 60 minutes in seconds
  const QUIZ_SESSION_API_URL = `${BACKEND_API}/api/quiz-sessions`;

  // Model API
  import.meta && null; // keep bundler happy if unused

  // Load current user email from localStorage (if logged in)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const parsed = JSON.parse(raw);
        const email =
          parsed?.email ||
          parsed?.email ||
          parsed?.user?.email ||
          parsed?.profile?.email ||
          null;
        if (email) setUserEmail(email);
      }
    } catch (err) {
      console.error('[FinalQuizPage] Error reading user email from localStorage:', err);
    }
  }, []);

  // Log `id` from URL params
  useEffect(() => {
    if (typeof id !== 'undefined' && id !== null) {
      console.log('[FinalQuizPage] id from URL params:', id);
    } else {
      console.log('[FinalQuizPage] no id param in URL');
    }
  }, [id]);

  // Helper to build history payload for assignment-quiz API based on completed questions
  const buildApiHistory = (uptoIndex, isSkipForCurrent = false) => {
    const historyItems = [];

    for (let i = 0; i <= uptoIndex; i++) {
      const q = questions[i];
      if (!q) continue;

      const answerIndex = answers[i];
      let user_answer = null;
      let was_correct = false;

      if (i === uptoIndex && isSkipForCurrent) {
        // Explicit skip for the current question - encode as the string "skip"
        user_answer = "skip";
        was_correct = false;
      } else if (answerIndex == null) {
        // Unanswered questions are treated as skipped as well
        user_answer = "skip";
        was_correct = false;
      } else {
        user_answer = q.options[answerIndex];
        was_correct = answerIndex === q.correctIndex;
      }

      historyItems.push({
        question_text: q.question,
        user_answer,
        was_correct,
      });
    }

    return historyItems;
  };

  // Helper to request the next question from the assignment-quiz model API
  // Optionally accepts an explicit topics array (used on first load before state updates)
  const requestNextQuestion = async (historyForApi, topicsOverride) => {
    const effectiveTopics = Array.isArray(topicsOverride) && topicsOverride.length > 0
      ? topicsOverride
      : topics;

    if (!Array.isArray(effectiveTopics) || effectiveTopics.length === 0) {
      console.warn('[FinalQuizPage] Cannot request next question - no topics loaded');
      return null;
    }

    const reqBody = {
      topics: effectiveTopics,
      level: adaptiveLevel,
      session_id: sessionId,
      history: historyForApi || [],
    };

    console.log('[FinalQuizPage] Requesting assignment-quiz question with body (before encryption):', reqBody);

    const encryptedBody = await encryptPayload(reqBody);

    const qRes = await fetch(`${MODEL_API}/assignment-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encryptedBody),
    });

    if (!qRes.ok) {
      const text = await qRes.text().catch(() => '<no body>');
      console.warn('[FinalQuizPage] assignment-quiz responded with non-OK status', qRes.status, qRes.statusText, text);
      throw new Error('Model assignment-quiz error');
    }

    const qJson = await qRes.json();
    if (!qJson || qJson.status !== 'success' || !qJson.data) {
      console.warn('[FinalQuizPage] assignment-quiz returned unexpected payload', qJson);
      throw new Error('Invalid assignment-quiz response');
    }

    let q = qJson.data;
    if (isEncryptedEnvelope(q)) {
      try {
        q = await decryptPayload(q);
      } catch (e) {
        console.error('[FinalQuizPage] Failed to decrypt assignment-quiz data:', e);
        throw e;
      }
    }

    // Update adaptive level and session id based on response
    if (qJson.level) {
      setAdaptiveLevel(qJson.level);
    }
    if (qJson.session_id) {
      setSessionId(qJson.session_id);
    }

    // Map backend shape to QuizModal shape
    const mappedQuestion = {
      id: q.id,
      question: q.question,
      options: q.options || [],
      correctIndex: q.correctIndex,
      hint: q.hint || '',
      code_context: q.code_context || null,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
    };

    return mappedQuestion;
  };

  // Fetch topics for this assignment (by test key from URL), then lazily fetch questions from assignment-quiz model API
  useEffect(() => {
    let mounted = true;
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        // 1) Fetch topics for this assignment using the public test key from URL (:id)
        const topicsRes = await fetch(`${BACKEND_API}/api/assignments/topics/${id}`);
        if (!topicsRes.ok) {
          const text = await topicsRes.text().catch(() => '<no body>');
          console.warn('[FinalQuizPage] Failed to fetch assignment topics:', topicsRes.status, topicsRes.statusText, text);
          throw new Error('Failed to fetch assignment topics');
        }

        const topicsJson = await topicsRes.json();
        const topics = topicsJson?.data?.topics || [];
        const assignmentName = topicsJson?.data?.assignment_name || 'Assignment';

        console.log('[FinalQuizPage] Loaded assignment topics:', topics);

        if (!Array.isArray(topics) || topics.length === 0) {
          throw new Error('No topics found for this assignment');
        }
        // Save topics for subsequent questions
        if (mounted) {
          setTopics(topics);

          // Build a human-friendly label from assignment name and topic titles
          try {
            const topicTitles = topics
              .map((t) => (t && typeof t === 'object' ? t.title : t))
              .filter(Boolean);

            const label = topicTitles.length
              ? `${assignmentName}: ${topicTitles.join(', ')}`
              : assignmentName;

            setAssignmentLabel(label);
          } catch (e) {
            console.warn('[FinalQuizPage] Failed to build assignment label from topics:', e);
            setAssignmentLabel(assignmentName);
          }
        }

        // 2) Fetch the first question lazily using assignment-quiz endpoint
        const firstQuestion = await requestNextQuestion([], topics);

        if (mounted && firstQuestion) {
          setQuestions([firstQuestion]);
          setAnswers([null]);
          setQuestionStartTime(Date.now());
          console.log('✅ Loaded first assignment question from model backend');
        } else if (mounted && !firstQuestion) {
          console.warn('[FinalQuizPage] Model did not return a first question, falling back to dummy questions');
          setQuestions(DUMMY_QUESTIONS);
          setAnswers(Array(TOTAL_QUESTIONS).fill(null));
          setQuestionStartTime(Date.now());
        }
      } catch (err) {
        console.error('[FinalQuizPage] Failed to fetch quiz from model backend:', err);
        setQuestions(DUMMY_QUESTIONS);
        setAnswers(Array(TOTAL_QUESTIONS).fill(null));
        setQuestionStartTime(Date.now());
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchQuiz();
    return () => {
      mounted = false;
    };
  }, [domainId, programId, level]);

  // Countdown Timer - stops when time runs out
  useEffect(() => {
    if (!showResults && questions.length > 0 && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, questions, timeRemaining]);

  // Handle time up scenario
  const handleTimeUp = () => {
    setShowTimeUpModal(true);
    // Auto-submit after 3 seconds
    setTimeout(() => {
      handleSubmit();
    }, 3000);
  };

  // Format time remaining for display
  const formatTime = (seconds) => {
    // Guard against NaN or undefined values
    if (!Number.isFinite(seconds) || seconds < 0) {
      seconds = 0;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeRemaining <= 600) return 'text-orange-600'; // Last 10 minutes
    return 'text-slate-700';
  };

  // Build analytics payload for strong/weak area analysis
  const buildTimingPayload = (timings) => {
    // Map question timings by index for quick lookup
    const timingMap = timings.reduce((acc, t) => {
      acc[t.questionIndex] = t;
      return acc;
    }, {});

    // For assignment final quizzes, route params may not include domainId/programId/level.
    // Use sensible fallbacks so the statistics API always receives valid identifiers.
    const numericLevel = Number(level);
    const effectiveLevel = Number.isFinite(numericLevel) && numericLevel > 0 ? numericLevel : adaptiveLevel || 3;

    // Fallback label when domain/program identifiers are missing:
    // use assignment name + concatenated topic titles so the
    // statistics model gets a meaningful context string.
    const fallbackLabel = (assignmentLabel && assignmentLabel.trim().length > 0)
      ? assignmentLabel
      : 'Assignment Final Quiz';

    const domainNameValue = domainId || fallbackLabel;
    const programNameValue = programId || fallbackLabel;

    return {
      domain_name: domainNameValue,
      program_name: programNameValue,
      level: {
        level_id: Number.isFinite(numericLevel) && numericLevel > 0 ? `L${numericLevel}` : 'LFinal',
        level_name: Number.isFinite(numericLevel) && numericLevel > 0 ? `Level ${numericLevel}` : 'Final Assessment',
        difficulty_score: effectiveLevel,
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

  const handleNext = async () => {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return;

    // If we're already at the last question, submit the quiz
    if (currentQuestion >= TOTAL_QUESTIONS - 1) {
      handleSubmit();
      return;
    }

    const nextIndex = currentQuestion + 1;

    // If the next question is already loaded, just move to it
    if (nextIndex < questions.length) {
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(answers[nextIndex]);
      setIsAnswered(answers[nextIndex] !== null || skippedQuestions.includes(nextIndex));
      setQuestionStartTime(Date.now());
      return;
    }

    // Otherwise, build history (treat current as answered, not skipped) and fetch a new question
    try {
      setIsLoading(true);
      const historyForApi = buildApiHistory(currentQuestion, false);
      const newQuestion = await requestNextQuestion(historyForApi);

      if (!newQuestion) {
        console.warn('[FinalQuizPage] No new question returned from model');
        return;
      }

      setQuestions((prev) => [...prev, newQuestion]);
      setAnswers((prev) => [...prev, null]);

      setCurrentQuestion(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } catch (err) {
      console.error('[FinalQuizPage] Failed to fetch next question:', err);
    } finally {
      setIsLoading(false);
    }
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

  const handleSkip = async () => {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return;

    const nextIndex = currentQuestion + 1;

    // Safety guard: don't skip beyond the total number of questions
    if (nextIndex > TOTAL_QUESTIONS - 1) return;

    // Mark this question as skipped for UI purposes
    if (!skippedQuestions.includes(currentQuestion)) {
      setSkippedQuestions([...skippedQuestions, currentQuestion]);
    }

    // If the next question is already loaded, just move to it
    if (nextIndex < questions.length) {
      console.log('⏭️ SKIPPED QUESTION (already loaded next):', currentQuestion + 1);
      setCurrentQuestion(nextIndex);
      setSelectedAnswer(answers[nextIndex]);
      setIsAnswered(answers[nextIndex] !== null || skippedQuestions.includes(nextIndex));
      setQuestionStartTime(Date.now());
      return;
    }

    // Otherwise, build history treating current question as skipped and fetch a new question
    try {
      setIsLoading(true);
      const historyForApi = buildApiHistory(currentQuestion, true);
      const newQuestion = await requestNextQuestion(historyForApi);

      if (!newQuestion) {
        console.warn('[FinalQuizPage] No new question returned from model on skip');
        return;
      }

      console.log('⏭️ SKIPPED QUESTION (fetched new):', currentQuestion + 1);

      setQuestions((prev) => [...prev, newQuestion]);
      setAnswers((prev) => [...prev, null]);

      setCurrentQuestion(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    } catch (err) {
      console.error('[FinalQuizPage] Failed to fetch next question on skip:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (index) => {
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
      testKey: id || null,
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
      // timeSpent removed from payload per latest requirements
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

    // If user is logged in, persist final assessment session to backend (non-blocking)
    if (userEmail) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const email = userData?.email || userEmail;
      
      fetch(QUIZ_SESSION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          domainId,
          testKey: id || null,
          sessionId: payloadSessionId,
          payload: questionPayload,
          attemptedAt: questionPayload.attemptedAt,
        }),
      })
        .then((res) => res.json().catch(() => null))
        .then((data) => {
          console.log('[FinalQuizPage] Final assessment session persisted:', data);
        })
        .catch((err) => {
          console.error('[FinalQuizPage] Error persisting final assessment session:', err);
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
              Final Quiz Complete!
            </h1>
            <p className="text-slate-600 animate-in slide-in-from-bottom duration-500 delay-300">Excellent work completing all questions</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
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
          {/* Quiz Header with Timer */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">
                {domainId} • Program {programId} • Level {level} • FINAL QUIZ
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border-2 ${
              timeRemaining <= 300 ? 'border-red-300 animate-pulse' : 'border-slate-200'
            }`}>
              <Clock className={getTimeColor()} size={20} />
              <span className={`font-mono text-xl font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Question Component */}
            <div className="lg:col-span-2">
              {questions.length > currentQuestion && questions[currentQuestion] ? (
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
                  {currentQuestion < TOTAL_QUESTIONS - 1 && (
                    <button
                      onClick={handleSkip}
                      disabled={isAnswered}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-400 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                    >
                      Skip
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {currentQuestion >= TOTAL_QUESTIONS - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Submit Final Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!isAnswered || isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-x-0.5"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight size={18} />
                        </>
                      )}
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
                totalQuestions={TOTAL_QUESTIONS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Up Modal */}
      {showTimeUpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Time's Up!</h2>
              <p className="text-slate-600 mb-4">
                The 60-minute time limit has been reached. Your quiz is being submitted automatically.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

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

export default FinalQuizPage;