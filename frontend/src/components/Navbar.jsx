import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGame } from "./GameContext"; // 1. Import Hook
import { 
  LogIn, Bell, Flame, LayoutDashboard, LogOut, User, 
  ChevronDown, BookOpen, Menu, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData') || localStorage.getItem('user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const normalized = {
        name: parsed.name || parsed.displayName || parsed.fullName || null,
        email: parsed.email || (parsed.emails && parsed.emails[0] && parsed.emails[0].value) || null,
        avatar: parsed.avatar || parsed.picture || (parsed.photos && parsed.photos[0] && parsed.photos[0].value) || (parsed._json && parsed._json.picture) || null,
      };
      setUserData(normalized);
    } catch (e) {
      // ignore parse errors
    }
  }, []);
  useEffect(() => {
    const normalizeAndSet = (obj) => {
      if (!obj) { setUserData(null); return; }
      const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj;
      const normalized = {
        name: parsed.name || parsed.displayName || parsed.fullName || null,
        email: parsed.email || (parsed.emails && parsed.emails[0] && parsed.emails[0].value) || null,
        avatar: parsed.avatar || parsed.picture || (parsed.photos && parsed.photos[0] && parsed.photos[0].value) || (parsed._json && parsed._json.picture) || null,
      };
      setUserData(normalized);
    };

    // initial read (use only `userData`)
    try {
      const raw = localStorage.getItem('userData');
      if (raw) normalizeAndSet(raw);
    } catch (e) {}

    // storage event (other tabs/windows)
    const storageHandler = (e) => {
      if (e.key === 'userData') {
        try {
          if (!e.newValue) { setUserData(null); return; }
          normalizeAndSet(e.newValue);
        } catch (err) {}
      }
    };

    // custom event for same-window updates
    const customHandler = (e) => {
      try {
        if (e && e.detail) normalizeAndSet(e.detail);
        else {
          const raw = localStorage.getItem('userData') || localStorage.getItem('user');
          if (raw) normalizeAndSet(raw);
        }
      } catch (err) {}
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('user-data-changed', customHandler);

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('user-data-changed', customHandler);
    };
  }, []);
  // 2. Get userStats from Context
  const { userStats } = useGame(); 

  const isStudent = location.pathname.startsWith('/student');
  const isTeacher = location.pathname.startsWith('/teacher');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    setUserData(null);
    navigate("/");
    setIsProfileOpen(false);
  };

  const handleDomainsClick = (e) => {
    e.preventDefault();

    const scrollToDomainsWithRetry = (retries = 40, interval = 100) => {
      const tryScroll = () => {
        const element = document.getElementById('domains');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (tryScroll()) return;

      let attempts = 0;
      const id = setInterval(() => {
        attempts += 1;
        if (tryScroll() || attempts >= retries) {
          clearInterval(id);
        }
      }, interval);
    };

    if (!isStudent) {
      if (location.pathname !== '/') {
        // navigate to home and indicate we should scroll to domains after mount
        navigate('/', { state: { scrollToDomains: true } });
      } else {
        scrollToDomainsWithRetry(40, 100);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled || isStudent || isTeacher
          ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to={isStudent ? "/student/home" : isTeacher ? "/teacher/dashboard" : "/"} className="flex items-center gap-3 group">
          <img 
            src="/SARATHI-Picsart-BackgroundRemover.jpg" 
            alt="SARATHI" 
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            SARATHI
          </span>
        </Link>

        {/* RIGHT SECTION */}
        <div className="hidden md:flex items-center gap-6">
          
          {isTeacher ? (
            /* Teacher View - Only Profile */
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
              >
                <img 
                  src={userData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"} 
                  alt="Teacher" 
                  className="w-8 h-8 rounded-full bg-slate-200 object-cover border border-slate-200"
                />
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20"
                    >
                      <div className="p-4 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-900">{userData?.name || "Teacher"}</p>
                        <p className="text-xs text-slate-500 truncate">{userData?.email || "teacher@example.com"}</p>
                      </div>
                      <div className="p-1">
                        <Link to="/teacher/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <LogOut size={16} /> Log Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : isStudent ? (
            <>
              {/* Navigation Links */}
              <div className="flex items-center gap-6 mr-4 border-r border-slate-200 pr-6">
                 <Link to="/student/dashboard" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-2">
                   <LayoutDashboard size={18} />
                   Dashboard
                 </Link>
                
              </div>

              {/* Stats & Notification */}
              <div className="flex items-center gap-4 mr-4">
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-100">
                  <Flame size={14} className="fill-orange-500" />
                  <span>{userStats?.streak || 0} Day Streak</span>
                </div>
              </div>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                >
                  {/* 3. DYNAMIC AVATAR RENDERING */}
                  <img 
                    src={userData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    alt="User" 
                    className="w-8 h-8 rounded-full bg-slate-200 object-cover border border-slate-200"
                  />
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20"
                      >
                        <div className="p-4 border-b border-slate-50">
                          <p className="text-sm font-bold text-slate-900">{userData?.name || "Student"}</p>
                          <p className="text-xs text-slate-500 truncate">{userData?.email || "Student"}</p>
                        </div>
                        <div className="p-1">
                          <Link to="/student/settings" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                            <User size={16} /> My Profile
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <LogOut size={16} /> Log Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Guest Links ... (Unchanged) */
            <>
               <a 
                 href="#domains" 
                 onClick={handleDomainsClick}
                 className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors"
               >
                 Domains
               </a>
               <Link to="/auth/login" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">
                 Login
               </Link>
               <Link 
                 to="/auth/signup"
                 className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg"
               >
                 Get Started
               </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;