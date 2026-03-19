import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Lock } from 'lucide-react';
import Navbar from '../../components/Navbar';

const SkillSnapshot = () => {
  const { state } = useLocation();
  const score = state?.score || 0;

  // Determine Level
  let level = "Beginner";
  let color = "text-blue-500";
  if (score > 100) { level = "Intermediate"; color = "text-purple-500"; }
  if (score > 140) { level = "Advanced"; color = "text-orange-500"; }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-32 px-6 flex flex-col items-center justify-center text-center">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
            <Award size={40} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete!</h1>
          <p className="text-slate-500 mb-8">Based on your performance, your starting level is:</p>

          <div className="mb-8">
            <span className={`text-4xl font-black ${color} tracking-tight`}>{level}</span>
            <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm">
              <TrendingUp size={16} />
              <span>Score: {score} XP</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-left">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Recommended Path:</h4>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-brand-500"></div>
              <p className="text-sm text-slate-600">Python Data Structures (Level 2)</p>
            </div>
            <div className="flex items-center gap-3 mt-2 opacity-50">
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                Advanced Algorithms <Lock size={12} />
              </p>
            </div>
          </div>

          <Link to="/auth/signup" className="block w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
            Save Progress & Continue
          </Link>
          <p className="mt-4 text-xs text-slate-400">Create a free account to unlock your roadmap</p>

        </motion.div>
      </div>
    </div>
  );
};

export default SkillSnapshot;