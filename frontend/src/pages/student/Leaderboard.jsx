import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Medal, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Shield, 
  Search,
  Zap 
} from 'lucide-react';

const LEADERBOARD_DATA = [
  { rank: 1, name: "Sarah Smith", xp: 15420, trend: 'up', avatar: "https://i.pravatar.cc/150?u=2", badge: "Grandmaster" },
  { rank: 2, name: "Aditya Satvik Annapantula", xp: 14200, trend: 'same', avatar: "https://i.pravatar.cc/150?u=1", badge: "Diamond", isMe: true }, // Current User
  { rank: 3, name: "Mike Chen", xp: 13850, trend: 'up', avatar: "https://i.pravatar.cc/150?u=3", badge: "Diamond" },
  { rank: 4, name: "Emily Davis", xp: 12100, trend: 'down', avatar: "https://i.pravatar.cc/150?u=4", badge: "Platinum" },
  { rank: 5, name: "Chris Wilson", xp: 11500, trend: 'up', avatar: "https://i.pravatar.cc/150?u=5", badge: "Platinum" },
  { rank: 6, name: "Jessica Lee", xp: 10200, trend: 'down', avatar: "https://i.pravatar.cc/150?u=6", badge: "Gold" },
  { rank: 7, name: "David Kim", xp: 9800, trend: 'same', avatar: "https://i.pravatar.cc/150?u=7", badge: "Gold" },
  { rank: 8, name: "Lisa Wong", xp: 9400, trend: 'up', avatar: "https://i.pravatar.cc/150?u=8", badge: "Gold" },
  { rank: 9, name: "Tom Holland", xp: 9100, trend: 'down', avatar: "https://i.pravatar.cc/150?u=9", badge: "Silver" },
  { rank: 10, name: "Zendaya", xp: 8900, trend: 'same', avatar: "https://i.pravatar.cc/150?u=10", badge: "Silver" },
];

const Leaderboard = () => {
  const [timeFrame, setTimeFrame] = useState('weekly'); // weekly | allTime

  const topThree = LEADERBOARD_DATA.slice(0, 3);
  const restOfList = LEADERBOARD_DATA.slice(3);
  const myData = LEADERBOARD_DATA.find(u => u.isMe);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans pb-24">
      
      {/* --- Header Section --- */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5 rounded-full font-bold text-sm mb-4 shadow-lg shadow-indigo-500/30">
          <Trophy size={14} /> Diamond League
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Global Leaderboard</h1>
        
        {/* Toggle Switch */}
        <div className="bg-white p-1 rounded-xl inline-flex border border-slate-200 shadow-sm">
          <button 
            onClick={() => setTimeFrame('weekly')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              timeFrame === 'weekly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeFrame('allTime')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              timeFrame === 'allTime' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* --- PODIUM SECTION (Top 3) --- */}
      <div className="max-w-4xl mx-auto mb-16 relative">
        {/* Glow Effect Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex items-end justify-center gap-4 md:gap-8 h-80">
          
          {/* 2nd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-1/3 max-w-[140px]"
          >
            <div className="relative mb-4">
              <img src={topThree[1].avatar} className="w-20 h-20 rounded-full border-4 border-slate-300 shadow-lg" alt="2nd" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-300">
                Lvl 12
              </div>
            </div>
            <div className="text-center mb-2">
              <h3 className="font-bold text-slate-900 truncate w-full">{topThree[1].name}</h3>
              <div className="text-brand-600 font-bold text-sm">{topThree[1].xp.toLocaleString()} XP</div>
            </div>
            {/* Pedestal */}
            <div className="w-full h-32 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl border-t border-slate-300 shadow-xl flex items-center justify-center relative overflow-hidden group">
              <span className="text-5xl font-black text-slate-300/50 group-hover:text-slate-400/50 transition-colors">2</span>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            className="flex flex-col items-center w-1/3 max-w-[160px] z-10 -mt-8"
          >
            <Crown size={40} className="text-yellow-400 fill-yellow-400 mb-2 animate-bounce-slow" />
            <div className="relative mb-4">
              <img src={topThree[0].avatar} className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl ring-4 ring-yellow-400/20" alt="1st" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-0.5 rounded-full border-2 border-yellow-300">
                Lvl 15
              </div>
            </div>
            <div className="text-center mb-2">
              <h3 className="font-bold text-slate-900 text-lg truncate w-full">{topThree[0].name}</h3>
              <div className="text-brand-600 font-bold">{topThree[0].xp.toLocaleString()} XP</div>
            </div>
            {/* Pedestal */}
            <div className="w-full h-44 bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-2xl border-t border-yellow-200 shadow-2xl shadow-yellow-500/20 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
               <span className="text-6xl font-black text-yellow-500/40 relative z-10">1</span>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col items-center w-1/3 max-w-[140px]"
          >
            <div className="relative mb-4">
              <img src={topThree[2].avatar} className="w-20 h-20 rounded-full border-4 border-orange-300 shadow-lg" alt="3rd" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-orange-300">
                Lvl 11
              </div>
            </div>
            <div className="text-center mb-2">
              <h3 className="font-bold text-slate-900 truncate w-full">{topThree[2].name}</h3>
              <div className="text-brand-600 font-bold text-sm">{topThree[2].xp.toLocaleString()} XP</div>
            </div>
            {/* Pedestal */}
            <div className="w-full h-24 bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-2xl border-t border-orange-200 shadow-xl flex items-center justify-center relative overflow-hidden group">
              <span className="text-5xl font-black text-orange-300/50 group-hover:text-orange-400/50 transition-colors">3</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
        
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-6 md:col-span-5">Student</div>
          <div className="col-span-2 hidden md:block text-center">Badge</div>
          <div className="col-span-2 text-center">Trend</div>
          <div className="col-span-3 md:col-span-2 text-right">XP</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {restOfList.map((user, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              key={user.rank}
              className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors ${
                user.isMe ? 'bg-brand-50/50' : ''
              }`}
            >
              <div className="col-span-1 text-center font-bold text-slate-500">#{user.rank}</div>
              
              <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt={user.name} />
                <div className="min-w-0">
                  <div className={`font-bold text-sm truncate ${user.isMe ? 'text-brand-700' : 'text-slate-900'}`}>
                    {user.name} {user.isMe && '(You)'}
                  </div>
                </div>
              </div>

              <div className="col-span-2 hidden md:flex justify-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                  user.badge === 'Platinum' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                  user.badge === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {user.badge}
                </span>
              </div>

              <div className="col-span-2 flex justify-center">
                {user.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                {user.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                {user.trend === 'same' && <Minus size={16} className="text-slate-300" />}
              </div>

              <div className="col-span-3 md:col-span-2 text-right font-bold text-slate-900 flex items-center justify-end gap-1">
                <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                {user.xp.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- STICKY USER BAR (Mobile/Scroll) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-40">
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="font-bold text-slate-400 w-8 text-center">#{myData.rank}</div>
             <img src={myData.avatar} className="w-10 h-10 rounded-full border-2 border-brand-500" alt="Me" />
             <div>
               <div className="font-bold text-sm">You</div>
               <div className="text-xs text-slate-400">Diamond League</div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <div className="font-bold text-lg leading-none">{myData.xp.toLocaleString()}</div>
               <div className="text-[10px] text-slate-400 uppercase">Total XP</div>
             </div>
             <div className="h-8 w-px bg-slate-700"></div>
             <div className="text-green-400 flex flex-col items-center">
               <TrendingUp size={16} />
               <span className="text-[10px] font-bold">Top 2%</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Leaderboard;