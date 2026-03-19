import { Bell, Search, Flame, Coins, Star } from 'lucide-react';
import { useGame } from './GameContext'; // Assuming context is set up

const TopBar = () => {
  const { userStats } = useGame(); // Use the context data

  return (
    <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm/50 backdrop-blur-sm bg-white/90">
      
      {/* Search Bar */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for challenges, friends, or badges..." 
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all hover:bg-slate-200/50"
        />
      </div>

      {/* Gamification Stats */}
      <div className="flex items-center gap-6">
        
        {/* Streak */}
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100" title="Daily Streak">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={20} />
          <span className="font-bold text-orange-700">{userStats.streak}</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100" title="Gems">
          <Coins className="text-yellow-500 fill-yellow-500" size={20} />
          <span className="font-bold text-yellow-700">{userStats.coins}</span>
        </div>

        {/* XP Level */}
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100" title="Current Level">
          <Star className="text-blue-500 fill-blue-500" size={20} />
          <span className="font-bold text-blue-700">Lvl {userStats.level}</span>
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        {/* Profile & Notifs */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <img 
            src={userStats.avatar} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-brand-500 cursor-pointer hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

export default TopBar;