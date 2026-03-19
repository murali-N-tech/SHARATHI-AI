import { CheckCircle2, XCircle, Lightbulb, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const QuizModal = ({ question, currentIndex, totalQuestions, onAnswerSelect, selectedAnswer, isAnswered }) => {
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState(new Set());

  const handleEliminate = () => {
    if (eliminatedOptions.size < 2) {
      const incorrectIndices = question.options
        .map((_, idx) => idx)
        .filter(idx => idx !== question.correctIndex && !eliminatedOptions.has(idx));
      
      if (incorrectIndices.length > 0) {
        const randomIdx = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
        setEliminatedOptions(new Set([...eliminatedOptions, randomIdx]));
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full inline-block hover:bg-brand-100 transition-colors">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {!isAnswered && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 border-2 border-yellow-300 text-yellow-700 rounded-lg font-semibold text-xs hover:bg-yellow-100 transition-all"
              title="Get a hint"
            >
              <Lightbulb size={16} />
              Hint
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEliminate}
              disabled={eliminatedOptions.size >= 2 || isAnswered}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 border-2 border-purple-300 text-purple-700 rounded-lg font-semibold text-xs hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Eliminate 2 incorrect options"
            >
              <Trash2 size={16} />
              Eliminate
            </motion.button>
          </div>
        )}
      </div>

      {/* Hint Display */}
      {showHint && !isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg"
        >
          <p className="text-sm text-yellow-800 font-semibold mb-2">💡 AI Insight:</p>
          <p className="text-sm text-yellow-700 leading-relaxed">{question.hint}</p>
        </motion.div>
      )}

      <h2 className="text-lg font-bold text-slate-900 mb-5 leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-2.5">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctIndex;
          const isEliminated = eliminatedOptions.has(index);
          
          let buttonClass = "w-full text-left p-3 rounded-lg border-2 transition-all duration-200 text-sm ";
          
          if (isAnswered) {
            if (isCorrect) {
              buttonClass += "border-green-500 bg-green-50 text-green-900 shadow-sm";
            } else if (isSelected && !isCorrect) {
              buttonClass += "border-red-500 bg-red-50 text-red-900 shadow-sm";
            } else {
              buttonClass += "border-slate-200 bg-slate-50 text-slate-500";
            }
          } else {
            if (isEliminated) {
              buttonClass += "border-gray-300 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed";
            } else if (isSelected) {
              buttonClass += "border-brand-600 bg-brand-50 text-brand-900 shadow-md transform scale-[1.02]";
            } else {
              buttonClass += "border-slate-200 hover:border-brand-400 hover:bg-brand-50 hover:shadow-md hover:transform hover:scale-[1.01] active:scale-100";
            }
          }

          return (
            <motion.button
              key={index}
              whileHover={!isAnswered && !isEliminated ? { x: 4 } : {}}
              onClick={() => !isEliminated && onAnswerSelect(index)}
              disabled={isAnswered || isEliminated}
              className={buttonClass}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-colors">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {isEliminated && (
                  <Trash2 className="text-gray-400" size={18} />
                )}
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="text-green-600 animate-in fade-in zoom-in duration-300" size={20} />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="text-red-600 animate-in fade-in zoom-in duration-300" size={20} />
                )}
              </div>
            </motion.button>
          );
        })}
```      </div>

      {isAnswered && (
        <div className={`mt-4 p-3 rounded-lg animate-in slide-in-from-top-2 duration-300 ${selectedAnswer === question.correctIndex ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
          <p className={`font-semibold text-sm ${selectedAnswer === question.correctIndex ? 'text-green-800' : 'text-red-800'}`}>
            {selectedAnswer === question.correctIndex ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className="text-xs text-slate-700 mt-1">
            The correct answer is: <strong>{question.options[question.correctIndex]}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizModal;