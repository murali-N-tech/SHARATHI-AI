import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Flame, Heart, BookOpen, Lightbulb, X } from 'lucide-react';

// ========================================
// 1. MOTIVATION BOOST MODAL (Correct Answer)
// ========================================
export const MotivationBoostModal = ({ isOpen, onClose, onNext, count = 0, explanation = "" }) => {
  if (!isOpen) return null;

  const messages = [
    "Great job! Keep it up!",
    "You're doing amazing!",
    "Perfect! Keep the momentum going!",
    "Well done! You've got this!",
    "Excellent work! Stay focused!",
    "That's right! Keep learning!",
    "Nice work! You're on track!",
    "Awesome! Continue like this!",
  ];

  const message = messages[count % messages.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Simple Header */}
        <div className="bg-green-50 p-8 text-center border-b-4 border-green-500">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Correct!</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-base text-slate-600 mb-6">
            {message}
          </p>

          {explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">EXPLANATION</p>
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="flex-1 bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// 2. CONFIDENCE BUILDER MODAL (Correct - Improvement)
// ========================================
export const ConfidenceBuilderModal = ({ isOpen, onClose, onNext, count = 0, explanation = "" }) => {
  if (!isOpen) return null;

  const messages = [
    "Your understanding is getting stronger!",
    "You're making great progress!",
    "Your skills are improving!",
    "You're getting better with each question!",
    "Your knowledge is growing!",
    "You're mastering this topic!",
    "Your hard work is paying off!",
    "You're learning so fast!",
  ];

  const message = messages[count % messages.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Simple Header */}
        <div className="bg-green-50 p-8 text-center border-b-4 border-green-500">
          <Sparkles className="w-16 h-16 mx-auto text-green-600 mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Excellent!</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-base text-slate-600 mb-6">
            {message}
          </p>

          {explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">EXPLANATION</p>
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="flex-1 bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// 3. STREAK CELEBRATION MODAL (Multiple Correct)
// ========================================
export const StreakCelebrationModal = ({ isOpen, onClose, onNext, streak = 3, explanation = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Simple Header */}
        <div className="bg-green-50 p-8 text-center border-b-4 border-green-500">
          <Flame className="w-16 h-16 mx-auto text-green-600 mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">On Fire!</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-200">
            <p className="text-4xl font-bold text-green-600">{streak}</p>
            <p className="text-sm text-green-700 font-semibold">Correct in a row!</p>
          </div>
          <p className="text-base text-slate-600 mb-6">
            Great streak! Keep going!
          </p>

          {explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">EXPLANATION</p>
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="flex-1 bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// 4. GENTLE ENCOURAGEMENT MODAL (Wrong Answer)
// ========================================
export const GentleEncouragementModal = ({ isOpen, onClose, onNext, count = 0, explanation = "" }) => {
  if (!isOpen) return null;

  const messages = [
    "Mistakes help you learn. Try the next one!",
    "Don't worry, keep practicing!",
    "Learning takes time. You're doing great!",
    "Every mistake is a step forward!",
    "Keep going, you'll get it!",
    "Stay positive and keep learning!",
    "You're learning from each attempt!",
    "No worries, keep trying!",
  ];

  const message = messages[count % messages.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Simple Header */}
        <div className="bg-red-50 p-8 text-center border-b-4 border-red-400">
          <Heart className="w-16 h-16 mx-auto text-red-500 mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Not quite!</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-base text-slate-600 mb-6">
            {message}
          </p>

          {explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">EXPLANATION</p>
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="flex-1 bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// 5. LEARNING FOCUS MODAL (Wrong - Review Needed)
// ========================================
export const LearningFocusModal = ({ isOpen, onClose, onNext, onReview }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <BookOpen className="w-16 h-16 mx-auto text-white mb-3" />
            <h2 className="text-3xl font-bold text-white mb-2">Learning Time</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            Review the concept and come back stronger! 📘
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={onReview}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Review Concept
            </button>
            <button
              onClick={onNext}
              className="flex-1 border-2 border-slate-300 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              Continue Anyway
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// 6. REASSURANCE MODAL (Wrong - Discouraged)
// ========================================
export const ReassuranceModal = ({ isOpen, onClose, onNext, count = 0, explanation = "" }) => {
  if (!isOpen) return null;

  const messages = [
    "Practice makes progress. You're doing great!",
    "Keep trying, you'll improve!",
    "Each attempt makes you better!",
    "Don't give up, keep learning!",
    "Stay focused, you're progressing!",
    "Keep your head up and continue!",
    "Every effort counts. Keep going!",
    "You're building your knowledge!",
  ];

  const message = messages[count % messages.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Simple Header */}
        <div className="bg-red-50 p-8 text-center border-b-4 border-red-400">
          <Heart className="w-16 h-16 mx-auto text-red-500 mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Keep Trying!</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-base text-slate-600 mb-6">
            {message}
          </p>

          {explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">EXPLANATION</p>
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="flex-1 bg-brand-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// 7. HINT PROMPT MODAL (Wrong - Struggling)
// ========================================
export const HintPromptModal = ({ isOpen, onClose, onGetHint, onTryAgain }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <Lightbulb className="w-16 h-16 mx-auto text-white mb-3 animate-pulse-fast" />
            <h2 className="text-3xl font-bold text-white mb-2">Need a Hand?</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            Want a hint? Let's break this down step by step! 🧠
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={onGetHint}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get a Hint
            </button>
            <button
              onClick={onTryAgain}
              className="flex-1 border-2 border-slate-300 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// ========================================
// DEMO COMPONENT (For Testing)
// ========================================
export const QuizModalsDemo = () => {
  const [activeModal, setActiveModal] = useState(null);

  const modals = [
    { name: 'Motivation Boost', type: 'correct', component: 'motivation' },
    { name: 'Confidence Builder', type: 'correct', component: 'confidence' },
    { name: 'Streak Celebration', type: 'correct', component: 'streak' },
    { name: 'Gentle Encouragement', type: 'wrong', component: 'encouragement' },
    { name: 'Learning Focus', type: 'wrong', component: 'learning' },
    { name: 'Reassurance', type: 'wrong', component: 'reassurance' },
    { name: 'Hint Prompt', type: 'wrong', component: 'hint' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 text-center">
          Quiz Feedback Modals Demo
        </h1>
        <p className="text-slate-600 text-center mb-8">
          Click any button to preview the modal
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Correct Answer Modals */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-green-600 mb-4">✅ Correct Answer Modals</h2>
            <div className="space-y-2">
              {modals.filter(m => m.type === 'correct').map((modal) => (
                <button
                  key={modal.component}
                  onClick={() => setActiveModal(modal.component)}
                  className="w-full text-left p-3 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
                >
                  {modal.name}
                </button>
              ))}
            </div>
          </div>

          {/* Wrong Answer Modals */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-purple-600 mb-4">❌ Wrong Answer Modals</h2>
            <div className="space-y-2">
              {modals.filter(m => m.type === 'wrong').map((modal) => (
                <button
                  key={modal.component}
                  onClick={() => setActiveModal(modal.component)}
                  className="w-full text-left p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  {modal.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Render Active Modal */}
        <MotivationBoostModal
          isOpen={activeModal === 'motivation'}
          onClose={() => setActiveModal(null)}
          onNext={() => setActiveModal(null)}
        />
        <ConfidenceBuilderModal
          isOpen={activeModal === 'confidence'}
          onClose={() => setActiveModal(null)}
          onNext={() => setActiveModal(null)}
        />
        <StreakCelebrationModal
          isOpen={activeModal === 'streak'}
          onClose={() => setActiveModal(null)}
          onNext={() => setActiveModal(null)}
          streak={5}
        />
        <GentleEncouragementModal
          isOpen={activeModal === 'encouragement'}
          onClose={() => setActiveModal(null)}
          onNext={() => setActiveModal(null)}
        />
        <LearningFocusModal
          isOpen={activeModal === 'learning'}
          onClose={() => setActiveModal(null)}
          onNext={() => setActiveModal(null)}
          onReview={() => alert('Review concept clicked!')}
        />
        <ReassuranceModal
          isOpen={activeModal === 'reassurance'}
          onClose={() => setActiveModal(null)}
          onNext={() => setActiveModal(null)}
        />
        <HintPromptModal
          isOpen={activeModal === 'hint'}
          onClose={() => setActiveModal(null)}
          onGetHint={() => alert('Get hint clicked!')}
          onTryAgain={() => setActiveModal(null)}
        />
      </div>
    </div>
  );
};

// ========================================
// SMART MODAL SELECTOR (Helper Function)
// ========================================
export const selectFeedbackModal = (isCorrect, streak = 0, attemptCount = 1, studentLevel = 'normal') => {
  if (isCorrect) {
    // Correct answer logic
    if (streak >= 3) return 'streak';
    if (studentLevel === 'improving') return 'confidence';
    return 'motivation';
  } else {
    // Wrong answer logic
    if (attemptCount === 1) return 'encouragement';
    if (attemptCount === 2) return 'hint';
    if (studentLevel === 'struggling') return 'learning';
    return 'reassurance';
  }
};
