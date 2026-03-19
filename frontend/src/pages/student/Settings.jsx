import { useState, useRef } from "react";
import { useGame } from "../../components/GameContext";
import { 
  Save, User, Bell, Monitor, Shield, Zap, 
  Check, Camera, Upload, Trash2, Mail, 
  Smartphone, Globe, Moon, Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentSettings() {
  const { userStats, updateProfile } = useGame();
  // Read stored userData from localStorage (if available)
  const _storedUser = (() => {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  })();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);

  // Initial State synced with Context and localStorage `userData`
  const [formData, setFormData] = useState({
    name: _storedUser?.name || _storedUser?.displayName || "Aditya Satvik Annapantula",
    email: _storedUser?.email || "alex.student@sarathi.ai",
    bio: userStats.bio || "Full Stack Developer in training. Love Python and React! 🚀",
    avatar: _storedUser?.avatar || _storedUser?.picture || userStats.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    theme: "light",
    sounds: true,
    animations: true,
    publicProfile: true,
    emailNotifs: true,
    pushNotifs: false,
  });

  // Predefined Avatars
  const avatars = [
    _storedUser.avatar,
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sorelle",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Cuddles",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Bandit",
  ];

  // Handle File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB Limit
        alert("File is too large! Please choose an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateProfile({ 
        name: formData.name, 
        avatar: formData.avatar,
        bio: formData.bio 
      });
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const tabs = [
    { id: "profile", label: "Profile & Avatar", icon: User },
    { id: "gamification", label: "Game Preferences", icon: Zap },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account Security", icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Customize your SARATHI experience.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 transition-all hover:scale-105 shadow-lg shadow-brand-600/20 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-brand-600 shadow-md shadow-slate-200/50 translate-x-1"
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? "text-brand-600" : "text-slate-400"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* === PROFILE TAB === */}
              {activeTab === "profile" && (
                <>
                  {/* Avatar Section */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Your Avatar</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                      {/* Current Avatar & Upload */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                          <img 
                            src={formData.avatar} 
                            alt="Current Avatar" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-md"
                          />
                          <button 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-brand-600 transition-colors shadow-lg"
                          >
                            <Camera size={16} />
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current</p>
                      </div>

                      {/* Preset Selection */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-600 mb-3">Or choose a preset:</p>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                          {avatars.map((img) => (
                            <button
                              key={img}
                              onClick={() => setFormData({ ...formData, avatar: img })}
                              className={`relative aspect-square rounded-xl overflow-hidden transition-all hover:opacity-80 ${
                                formData.avatar === img 
                                  ? "ring-4 ring-brand-500 ring-offset-2" 
                                  : "ring-1 ring-slate-200"
                              }`}
                            >
                              <img src={img} alt="preset" className="w-full h-full object-cover" />
                              {formData.avatar === img && (
                                <div className="absolute inset-0 bg-brand-600/20 flex items-center justify-center">
                                  <Check className="text-white drop-shadow-md" size={20} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          ))}
                          <button 
                             onClick={() => fileInputRef.current.click()}
                             className="flex flex-col items-center justify-center gap-1 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-all aspect-square"
                          >
                            <Upload size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info Form */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="font-bold text-slate-900">Personal Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Display Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                        <input 
                          type="email" 
                          value={formData.email}
                          disabled
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bio</label>
                      <textarea 
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                        placeholder="Tell us a bit about yourself..."
                      />
                      <p className="text-right text-xs text-slate-400 mt-1">{formData.bio.length}/300</p>
                    </div>
                  </div>
                </>
              )}

              {/* === GAMIFICATION TAB === */}
              {activeTab === "gamification" && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Zap className="text-brand-500" size={20} /> Experience Settings
                    </h3>
                    {/* Toggles */}
                    <div className="space-y-6">
                      <ToggleItem 
                        label="Sound Effects" 
                        desc="Play sounds on level up & milestones"
                        icon={Volume2}
                        checked={formData.sounds}
                        onChange={() => setFormData({...formData, sounds: !formData.sounds})}
                      />
                      <ToggleItem 
                        label="Celebration Animations" 
                        desc="Show confetti and 3D effects on success"
                        icon={Zap}
                        checked={formData.animations}
                        onChange={() => setFormData({...formData, animations: !formData.animations})}
                      />
                      <ToggleItem 
                        label="Dark Mode" 
                        desc="Switch to a darker theme for night coding"
                        icon={Moon}
                        checked={formData.theme === 'dark'}
                        onChange={() => setFormData({...formData, theme: formData.theme === 'dark' ? 'light' : 'dark'})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === NOTIFICATIONS TAB === */}
              {activeTab === "notifications" && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                   <h3 className="font-bold text-slate-900 mb-2">Notification Preferences</h3>
                   <ToggleItem 
                      label="Email Updates" 
                      desc="Weekly progress reports and digests"
                      icon={Mail}
                      checked={formData.emailNotifs}
                      onChange={() => setFormData({...formData, emailNotifs: !formData.emailNotifs})}
                   />
                   <ToggleItem 
                      label="Mobile Push" 
                      desc="Daily reminders & quests (Mobile App)"
                      icon={Smartphone}
                      checked={formData.pushNotifs}
                      onChange={() => setFormData({...formData, pushNotifs: !formData.pushNotifs})}
                   />
                </div>
              )}

              {/* === ACCOUNT TAB === */}
              {activeTab === "account" && (
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4">Security</h3>
                      <button className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 mb-3">
                        <Shield size={18} /> Change Password
                      </button>
                      <button className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2">
                        <Globe size={18} /> Active Sessions
                      </button>
                   </div>
                   <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                      <h3 className="font-bold text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-700 mb-4">Deleting your account is permanent.</p>
                      <button className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete Account
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-3">
          <div className="sticky top-24">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Public Profile Preview</h3>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="h-24 bg-gradient-to-r from-brand-600 to-indigo-600 relative">
                 <div className="absolute inset-0 bg-black/10"></div>
              </div>
              
              <div className="px-6 pb-6 text-center -mt-12 relative">
                <img 
                  src={formData.avatar} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mx-auto bg-slate-100"
                />
                
                <div className="mt-3">
                  <h2 className="text-xl font-bold text-slate-900">{formData.name}</h2>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mt-1 border border-brand-100">
                    <Zap size={10} className="fill-brand-700" />
                    Level {userStats.level || 5}
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mt-4 leading-relaxed line-clamp-3">
                  {formData.bio || "No bio set yet."}
                </p>

                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-100 w-full">
                  <div className="text-center">
                    <div className="font-bold text-slate-900">{userStats.xp || 0}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total XP</div>
                  </div>
                  <div className="text-center">
                     <div className="font-bold text-slate-900">{userStats.streak || 0}</div>
                     <div className="text-[10px] text-slate-400 uppercase font-bold">Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-8 left-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="bg-green-500 rounded-full p-0.5">
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="font-bold">Changes saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper Component for Toggle Switches
const ToggleItem = ({ label, desc, icon: Icon, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${checked ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
        <Icon size={20}/>
      </div>
      <div>
        <div className="font-bold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500 font-medium">{desc}</div>
      </div>
    </div>
    <button 
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors relative ${
        checked ? "bg-brand-500" : "bg-slate-300"
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-all ${
        checked ? "left-6" : "left-1"
      }`} />
    </button>
  </div>
);