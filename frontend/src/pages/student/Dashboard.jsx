import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  TrendingUp, 
  Clock, 
  Zap,
  Award,
  BookOpen,
  Calendar as CalendarIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  Code2,
  BrainCircuit,
  Database
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [hoveredStat, setHoveredStat] = useState(null);

  // --- MOCK DATA ---

  const stats = [
    { id: 1, label: 'Current Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { id: 2, label: 'Total XP', value: '12,450', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { id: 3, label: 'Global Rank', value: 'Top 5%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 4, label: 'Hours Learned', value: '24h 15m', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const weeklyData = [
    { name: 'Mon', xp: 450 },
    { name: 'Tue', xp: 320 },
    { name: 'Wed', xp: 550 },
    { name: 'Thu', xp: 400 },
    { name: 'Fri', xp: 700 },
    { name: 'Sat', xp: 200 },
    { name: 'Sun', xp: 450 },
  ];

  const recommendedPaths = [
    { id: 1, title: 'Data Science Fundamentals', levels: 12, xp: 4500, icon: Database, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { id: 2, title: 'Advanced React Patterns', levels: 8, xp: 3200, icon: Code2, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { id: 3, title: 'Intro to Machine Learning', levels: 15, xp: 6000, icon: BrainCircuit, color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  ];

  const dailyQuests = [
    { id: 1, task: 'Complete 1 Python Lesson', progress: 100, total: 100, status: 'completed', xp: 50 },
    { id: 2, task: 'Solve 3 Coding Challenges', progress: 1, total: 3, status: 'in-progress', xp: 150 },
    { id: 3, task: 'Help a Peer in Workspace', progress: 0, total: 1, status: 'pending', xp: 100 },
  ];

  return (
    // CLEANUP: Removed min-h-screen and outer padding to fit StudentLayout
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back! You're on a great streak.</p>
        </div>
        {/* Optional: Quick Action Button */}
        <button className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 flex items-center gap-2">
           <Zap size={18} /> Resume Learning
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN (Main Stats & Charts) --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                onHoverStart={() => setHoveredStat(stat.id)}
                onHoverEnd={() => setHoveredStat(null)}
                whileHover={{ y: -4 }}
                className={`bg-white p-4 rounded-2xl border ${stat.border} shadow-sm transition-all cursor-default relative overflow-hidden`}
              >
                <div className={`p-2.5 rounded-xl w-fit mb-3 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Weekly Progress Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <LineChartIcon className="text-brand-600" /> Weekly Trends
              </h3>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} 
                    dy={10} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#0ea5e9" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#fff', stroke: '#0ea5e9', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Learning Paths */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-slate-900">Recommended For You</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedPaths.map(path => (
                <div key={path.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl ${path.bg} ${path.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <path.icon size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{path.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {path.levels} Levels</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-600 group-hover:gap-3 transition-all">
                    Start Path <ArrowUpRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Sidebar Widgets) --- */}
        <div className="space-y-6">
          {/* Daily Quests */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-yellow-500" /> Daily Quests
            </h3>
            <div className="space-y-4">
              {dailyQuests.map((quest) => (
                <div key={quest.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${quest.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {quest.task}
                    </span>
                    <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">+{quest.xp}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${quest.status === 'completed' ? 'bg-green-500' : 'bg-brand-500'}`} 
                      style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap (Simplified for Demo) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CalendarIcon className="text-brand-600" /> Activity
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
               {/* Mock Calendar Dots */}
               {Array.from({length: 28}).map((_, i) => (
                 <div key={i} className={`aspect-square rounded-md ${[3,4,8,12,15,20,22].includes(i) ? 'bg-brand-500' : 'bg-slate-100'}`} />
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;