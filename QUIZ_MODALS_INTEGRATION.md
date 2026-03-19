# Quiz Feedback Modals - Integration Guide

## 📦 Files Created

1. **QuizFeedbackModals.jsx** - Main component file with all 7 modals
2. **QuizPageWithFeedback.jsx** - Example integration with existing quiz
3. **QuizModalsDemo.jsx** - Demo page to preview all modals
4. **tailwind.config.js** - Updated with new animations

---

## ✅ What's Been Implemented

### 7 Feedback Modals Created:

#### ✅ Correct Answer Modals
1. **MotivationBoostModal** - General correct answer feedback
2. **ConfidenceBuilderModal** - For showing improvement
3. **StreakCelebrationModal** - For 3+ consecutive correct answers

#### ❌ Wrong Answer Modals
4. **GentleEncouragementModal** - First wrong answer
5. **LearningFocusModal** - Review needed (with "Review Concept" button)
6. **ReassuranceModal** - Student seems discouraged
7. **HintPromptModal** - Student struggling (with "Get a Hint" button)

### Animations Added to Tailwind Config:
- `animate-wiggle` - For flame icon
- `animate-zoom-in-95` - For modal entrance
- `animate-fade-in` - For backdrop fade

---

## 🚀 How to Use

### Option 1: Replace Existing QuizPage

Replace your current [QuizPage.jsx](../pages/QuizPage.jsx) with [QuizPageWithFeedback.jsx](../pages/QuizPageWithFeedback.jsx):

```bash
# Backup original
cp frontend/src/pages/QuizPage.jsx frontend/src/pages/QuizPage.backup.jsx

# Replace with new version
cp frontend/src/pages/QuizPageWithFeedback.jsx frontend/src/pages/QuizPage.jsx
```

### Option 2: Add to Existing QuizPage

Add this code to your existing [QuizPage.jsx](../pages/QuizPage.jsx):

#### 1. Import the modals at the top:
```jsx
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
```

#### 2. Add state variables:
```jsx
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [currentFeedbackModal, setCurrentFeedbackModal] = useState(null);
const [streak, setStreak] = useState(0);
const [wrongAttempts, setWrongAttempts] = useState(0);
```

#### 3. Update `handleAnswerSelect` function:
```jsx
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
```

#### 4. Add modal handlers:
```jsx
const handleModalNext = () => {
  setShowFeedbackModal(false);
  setTimeout(() => {
    if (currentQuestion < QUIZ_DATA.length - 1) {
      handleNext();
    }
  }, 300);
};

const handleReviewConcept = () => {
  setShowFeedbackModal(false);
  // Add your review logic here
};

const handleGetHint = () => {
  setShowFeedbackModal(false);
  // Add your hint logic here
};

const handleTryAgain = () => {
  setShowFeedbackModal(false);
  const newAnswers = [...answers];
  newAnswers[currentQuestion] = null;
  setAnswers(newAnswers);
  setSelectedAnswer(null);
  setIsAnswered(false);
};
```

#### 5. Add modal components before closing `</div>` tag:
```jsx
{/* Feedback Modals */}
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
```

---

## 🎨 Testing the Modals

### View Demo Page
Access the demo page to test all modals:

1. Add route to your router (usually in `App.jsx` or `main.jsx`):
```jsx
import QuizModalsDemo from './pages/QuizModalsDemo';

// Add to routes
<Route path="/quiz-modals-demo" element={<QuizModalsDemo />} />
```

2. Navigate to: `http://localhost:5173/quiz-modals-demo`

---

## 📋 Modal Selection Logic

The `selectFeedbackModal()` helper automatically chooses the right modal:

```jsx
// Correct answers
- Streak >= 3 → StreakCelebrationModal
- Student improving → ConfidenceBuilderModal
- Default → MotivationBoostModal

// Wrong answers
- First attempt → GentleEncouragementModal
- Second attempt → HintPromptModal
- Student struggling → LearningFocusModal
- Default → ReassuranceModal
```

You can customize this logic in [QuizFeedbackModals.jsx](../components/QuizFeedbackModals.jsx)

---

## 🎯 Customization

### Change Colors
Edit gradient classes in each modal:
```jsx
// Example: Change from emerald to blue
<div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
```

### Change Messages
Update text in the modal components:
```jsx
<p className="text-lg text-slate-700 mb-6 leading-relaxed">
  Your custom message here!
</p>
```

### Add Sound Effects
```jsx
// In modal component
useEffect(() => {
  if (isOpen) {
    const audio = new Audio('/sounds/success.mp3');
    audio.play();
  }
}, [isOpen]);
```

---

## 📱 Features

✅ Mobile responsive
✅ Smooth animations (fade, zoom, bounce, wiggle)
✅ Keyboard accessible (ESC to close)
✅ Matches your brand theme
✅ Student-centric messaging
✅ Lucide React icons
✅ Auto-advance to next question
✅ Smart modal selection based on performance

---

## 🔧 Troubleshooting

### Animations not working?
Make sure Tailwind config changes are applied:
```bash
# Restart dev server
npm run dev
```

### Modals not showing?
Check these:
1. Import statements are correct
2. State is being updated in `handleAnswerSelect`
3. Modal components are rendered at the end of your component

### X button not showing?
The X button uses white text. If background is light, change:
```jsx
className="text-slate-600 hover:text-slate-900"
```

---

## 📄 File Locations

```
frontend/src/
├── components/
│   ├── QuizFeedbackModals.jsx     ← Main modal components
│   └── QuizModal.jsx               ← Original quiz modal
├── pages/
│   ├── QuizPage.jsx                ← Original quiz page
│   ├── QuizPageWithFeedback.jsx    ← Example with modals integrated
│   └── QuizModalsDemo.jsx          ← Demo/test page
└── tailwind.config.js              ← Updated with animations
```

---

## 🚀 Next Steps

1. **Test the demo**: Visit `/quiz-modals-demo` to preview all modals
2. **Integrate**: Choose Option 1 or Option 2 above
3. **Customize**: Adjust colors, messages, and logic to fit your needs
4. **Add features**: Implement review concept and hint functionality
5. **Add sounds**: Include audio feedback for enhanced UX

---

## 💡 Tips

- **Don't overuse streaks**: Only show after 3+ consecutive correct answers
- **Vary the modals**: Use the smart selector to keep it fresh
- **Quick transitions**: Keep animations under 0.5s
- **Test on mobile**: Ensure touch-friendly button sizes
- **Track analytics**: Log which modals encourage the most learning

---

## 📚 Additional Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)
- [React Modal Best Practices](https://react.dev)

---

**Created for AI-AAP Quiz System**
Last Updated: December 2025
