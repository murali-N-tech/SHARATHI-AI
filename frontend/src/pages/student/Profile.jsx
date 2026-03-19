import { Calendar, MapPin, Link as LinkIcon, Edit3, Award, Zap, Target, Github, Linkedin, ExternalLink } from 'lucide-react';
import { useGame } from '../../components/GameContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { userStats } = useGame();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* --- HEADER PROFILE CARD --- */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
        {/* Cover Background */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="relative flex flex-col md:flex-row items-end gap-8 pt-16 px-2">
          
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-[6px] border-white shadow-2xl bg-white overflow-hidden">
               <img 
                 src={userStats.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                 alt="Profile" 
                 className="w-full h-full object-cover" 
               />
            </div>
            <div className="absolute bottom-4 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Online"></div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 mb-2 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{userStats.name || "Aditya Satvik Annapantula"}</h1>
            <p className="text-slate-500 font-medium flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Student
              </span>
              <span className="flex items-center gap-1 text-sm"><MapPin size={14}/> San Francisco, CA</span>
              <span className="flex items-center gap-1 text-sm"><Calendar size={14}/> Joined Sept 2024</span>
            </p>
          </div>

          {/* Edit Button */}
          <button 
            onClick={() => navigate('/student/settings')}
            className="mb-4 flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* Bio & Socials */}
        <div className="mt-8 px-2 grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">About Me</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {userStats.bio || "Aspiring Full Stack Developer. Currently learning React and Node.js. Love solving algorithmic challenges and building cool projects! 🚀"}
              </p>
            </div>
            
            <div className="flex gap-4">
              <SocialButton icon={Github} label="GitHub" />
              <SocialButton icon={Linkedin} label="LinkedIn" />
              <SocialButton icon={ExternalLink} label="Portfolio" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Total XP" value={userStats.xp?.toLocaleString() || "0"} />
            <StatBox label="Global Rank" value="Top 5%" />
            <StatBox label="Badges" value="12" />
            <StatBox label="Streak" value={`${userStats.streak || 0} Days`} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Activity & Badges --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Heatmap Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <Zap className="text-brand-500 fill-brand-500" /> Learning Activity
              </h3>
              <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option>Last 30 Days</option>
                <option>Last Year</option>
              </select>
            </div>
            
            {/* Mock Heatmap Grid */}
            <div className="grid grid-cols-12 gap-2">
              {[...Array(60)].map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md transition-all hover:scale-110 ${
                    Math.random() > 0.7 ? 'bg-brand-500' : 
                    Math.random() > 0.4 ? 'bg-brand-300' : 'bg-slate-100'
                  }`}
                  title={`Day ${i}: ${Math.floor(Math.random() * 100)} XP`}
                ></div>
              ))}
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <h3 className="font-bold text-xl text-slate-900 mb-8 flex items-center gap-2">
              <Award className="text-yellow-500 fill-yellow-500" /> Recent Badges
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[
                { name: 'Bug Hunter', icon: '🐞', color: 'bg-red-100 text-red-600' },
                { name: 'Fast Learner', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
                { name: 'Code Ninja', icon: '🥷', color: 'bg-slate-100 text-slate-700' },
                { name: 'Night Owl', icon: '🦉', color: 'bg-indigo-100 text-indigo-600' },
                { name: 'Team Player', icon: '🤝', color: 'bg-green-100 text-green-600' },
                { name: 'Problem Solver', icon: '🧩', color: 'bg-blue-100 text-blue-600' }
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center group cursor-pointer p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className={`w-16 h-16 ${badge.color} rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {badge.icon}
                  </div>
                  <span className="text-sm font-bold text-slate-700 text-center">{badge.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">Dec 2024</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Focus & Skills --- */}
        <div className="space-y-8">
           
           {/* Current Focus */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
            <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <Target className="text-red-500" /> Current Focus
            </h3>
            
            <div className="space-y-6">
              <SkillBar label="React Hooks" progress={85} color="bg-blue-500" />
              <SkillBar label="Advanced CSS" progress={60} color="bg-pink-500" />
              <SkillBar label="Node.js API" progress={35} color="bg-green-500" />
              <SkillBar label="System Design" progress={15} color="bg-purple-500" />
            </div>
           </div>

           {/* Next Goals */}
           <div className="bg-brand-900 rounded-[2rem] p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Target size={100} />
              </div>
              <h3 className="font-bold text-xl mb-4 relative z-10">Next Milestone</h3>
              <p className="text-brand-200 mb-6 text-sm leading-relaxed relative z-10">
                 Complete 3 more "System Design" modules to unlock the <strong>Architect Badge</strong>.
              </p>
              <button className="w-full py-3 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 transition-colors relative z-10">
                Continue Learning
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SocialButton = ({ icon: Icon, label }) => (
  <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-brand-600 hover:border-brand-300 transition-all">
    <Icon size={16} /> {label}
  </button>
);

const StatBox = ({ label, value }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center hover:bg-white hover:shadow-md transition-all">
    <div className="text-2xl font-black text-slate-900">{value}</div>
    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">{label}</div>
  </div>
);

const SkillBar = ({ label, progress, color }) => (
  <div>
    <div className="flex justify-between text-sm font-bold mb-2">
      <span className="text-slate-700">{label}</span>
      <span className="text-slate-400">{progress}%</span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${color} shadow-sm`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

export default Profile;