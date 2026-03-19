import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import Confetti from 'react-confetti'; // Optional: npm install react-confetti

const LevelUpModal = ({ isOpen, onClose, newLevel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl overflow-hidden"
        >
          {/* Confetti Effect inside modal if you want, or fullscreen */}
          {/* <Confetti numberOfPieces={200} recycle={false} /> */}
          
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-300/20 to-transparent"></div>
          
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg animate-bounce">
              <Trophy size={48} className="text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Level Up!</h2>
            <p className="text-slate-500">You reached Level {newLevel}</p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
              <span className="text-sm text-slate-600">Max XP</span>
              <span className="font-bold text-brand-600">+5000</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
              <span className="text-sm text-slate-600">Unlocks</span>
              <span className="font-bold text-brand-600">Advanced React</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 transition-transform hover:scale-105"
          >
            Awesome!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpModal;