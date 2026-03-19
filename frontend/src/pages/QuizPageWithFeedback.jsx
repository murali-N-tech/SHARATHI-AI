import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Code2, Trophy, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import QuizModal from "../components/QuizModal";
import QuizProgressSidebar from "../components/QuizProgressSidebar";

// Import the new feedback modals
import {
  MotivationBoostModal,
  ConfidenceBuilderModal,
  StreakCelebrationModal,
  GentleEncouragementModal,
  LearningFocusModal,
  ReassuranceModal,
  HintPromptModal,
  selectFeedbackModal,
} from "../components/QuizFeedbackModals";

// Static Questions Data (same as original)
const QUIZ_DATA = [
  {
    id: 1,
    question:
      "A 62-year-old man presents with nocturia, hesitancy and terminal dribbling. Prostate examination reveals a moderately enlarged prostate with no irregular features and a well defined median sulcus. Blood tests show PSA 1.3 ng/ml. What is the most appropriate management?",
    options: [
      "Alpha-1 antagonist",
      "5 alpha-reductase inhibitor",
      "Non-urgent referral for transurethral resection of prostate",
      "Empirical treatment with ciprofloxacin for 2 weeks",
      "Urgent referral to urology",
    ],
    correctIndex: 2,
  },
  {
    id: 2,
    question:
      "A 45-year-old woman presents with chest pain radiating to the left arm and jaw. ECG shows ST elevation in leads II, III, and aVF. What is the most likely diagnosis?",
    options: [
      "Anterior myocardial infarction",
      "Inferior myocardial infarction",
      "Lateral myocardial infarction",
      "Pulmonary embolism",
      "Pericarditis",
    ],
    correctIndex: 1,
  },
  // Add all other questions from original QuizPage.jsx
];

const QuizPageWithFeedback = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(QUIZ_DATA.length).fill(null));
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // New state for feedback modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedbackModal, setCurrentFeedbackModal] = useState(null);
  const [streak, setStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Timer
  useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults]);

  const handleAnswerSelect = (index) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);

    // Check if answer is correct
    const isCorrect = index === QUIZ_DATA[currentQuestion].correctIndex;

    // Update streak
    if (isCorrect) {
      setStreak(streak + 1);
      setWrongAttempts(0);
    } else {
      setStreak(0);
      setWrongAttempts(wrongAttempts + 1);
    }

    // Determine which modal to show
    const modalType = selectFeedbackModal(
      isCorrect,
      isCorrect ? streak + 1 : 0,
      wrongAttempts + 1,
      wrongAttempts >= 2 ? 'struggling' : 'normal'
    );

    setCurrentFeedbackModal(modalType);
    setShowFeedbackModal(true);
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_DATA.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
      setIsAnswered(answers[currentQuestion + 1] !== null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setIsAnswered(answers[currentQuestion - 1] !== null);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
    setSelectedAnswer(answers[index]);
    setIsAnswered(answers[index] !== null);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === QUIZ_DATA[index].correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  // Feedback modal handlers
  const handleModalNext = () => {
    setShowFeedbackModal(false);
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < QUIZ_DATA.length - 1) {
        handleNext();
      }
    }, 300);
  };

  const handleReviewConcept = () => {
    setShowFeedbackModal(false);
    // Implement your review logic here
    alert("Review concept feature - integrate with your learning materials!");
  };

  const handleGetHint = () => {
    setShowFeedbackModal(false);
    // Implement your hint logic here
    alert("Hint feature - show hints for the current question!");
  };

  const handleTryAgain = () => {
    setShowFeedbackModal(false);
    // Reset the current question to allow retry
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = null;
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = ((score / QUIZ_DATA.length) * 100).toFixed(1);

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
            <p className="text-slate-600 animate-in slide-in-from-bottom duration-500 delay-300">
              Great job finishing the quiz
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-brand-50 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 animate-in slide-in-from-left duration-500 delay-400">
              <Target className="text-brand-600 mx-auto mb-2" size={24} />
              <p className="text-sm text-brand-600 font-semibold mb-1">Score</p>
              <p className="text-3xl font-bold text-brand-900">
                {score}/{QUIZ_DATA.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 animate-in slide-in-from-bottom duration-500 delay-500">
              <Trophy className="text-green-600 mx-auto mb-2" size={24} />
              <p className="text-sm text-green-600 font-semibold mb-1">Percentage</p>
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
      {/* Header with SkillForge Logo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-600 rounded-lg text-white transition-all duration-300 group-hover:rotate-12 group-hover:shadow-lg group-hover:scale-110">
              <Code2 size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight transition-all duration-300 group-hover:text-brand-600">
              Skill<span className="text-brand-600">Forge</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="pt-6 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Question Component */}
            <div className="lg:col-span-2">
              <QuizModal
                question={QUIZ_DATA[currentQuestion]}
                currentIndex={currentQuestion}
                totalQuestions={QUIZ_DATA.length}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
              />

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

                {currentQuestion === QUIZ_DATA.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-x-0.5"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Progress Sidebar Component */}
            <div className="lg:col-span-1">
              <QuizProgressSidebar
                questions={QUIZ_DATA}
                answers={answers}
                currentQuestion={currentQuestion}
                onQuestionClick={handleQuestionClick}
                timeElapsed={timeElapsed}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modals - Rendered based on answer correctness */}
      <MotivationBoostModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'motivation'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
      />

      <ConfidenceBuilderModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'confidence'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
      />

      <StreakCelebrationModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'streak'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        streak={streak}
      />

      <GentleEncouragementModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'encouragement'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
      />

      <LearningFocusModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'learning'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
        onReview={handleReviewConcept}
      />

      <ReassuranceModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'reassurance'}
        onClose={() => setShowFeedbackModal(false)}
        onNext={handleModalNext}
      />

      <HintPromptModal
        isOpen={showFeedbackModal && currentFeedbackModal === 'hint'}
        onClose={() => setShowFeedbackModal(false)}
        onGetHint={handleGetHint}
        onTryAgain={handleTryAgain}
      />
    </div>
  );
};

export default QuizPageWithFeedback;
