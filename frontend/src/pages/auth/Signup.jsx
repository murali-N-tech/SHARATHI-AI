// Integration Done on 17-12-2025 19:03
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

// --- Sub-component: Computer Graphic ---
const ComputerGraphic = ({ isLogin }) => {
  const [isFlickering, setIsFlickering] = useState(false);

  useEffect(() => {
    setIsFlickering(true);
    const timer = setTimeout(() => setIsFlickering(false), 300);
    return () => clearTimeout(timer);
  }, [isLogin]);

  return (
    <div className="relative w-full h-48 md:h-64">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-sm bg-gray-300 dark:bg-gray-700 p-2 rounded-lg shadow-lg">
          <div
            className={`w-full h-32 md:h-48 bg-gray-900 rounded-md flex items-center justify-center overflow-hidden transition-all duration-300 ${isFlickering ? 'animate-flicker' : ''}`}
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-black text-gray-400 tracking-widest"
              >
                JOIN US
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-1/3 h-5 bg-gray-400 dark:bg-gray-600 rounded-b-md"></div>
      <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-1/2 h-2.5 bg-gray-500 dark:bg-gray-800 rounded-b-lg"></div>
    </div>
  );
};
import GoogleSignInPopup from '../../components/auth/GoogleSignInPopup';
import { BACKEND_API } from '../../lib/apiConfig';

const Signup = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');

  const handleGoogleSuccess = async (user) => {
    // User data already saved to localStorage and event dispatched by GoogleSignInPopup
    // Register presence in backend online-users collection
    try {
      const apiBase = process.env.REACT_APP_API_BASE || BACKEND_API;
      const payload = {
        email: user.email || null,
        name: user.name || null,
      };
      
      if (!payload.email) {
        console.warn('Missing email, skipping presence registration');
        navigate('/student/home');
        return;
      }

      console.log('[Signup] Registering presence:', payload);
      const response = await fetch(`${apiBase}/api/online-users/presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.error('Presence registration failed:', response.status);
      } else {
        const result = await response.json();
        console.log('[Signup] Presence registered successfully:', result);
      }
    } catch (err) {
      console.error('Failed to register presence:', err);
    } finally {
      navigate('/student/home');
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Sign Up failed:', error);
    // Could show an error toast here
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source
          src="https://ik.imagekit.io/murali17/Blue%20and%20White%20Modern%20Security%20Awareness%20Video.mp4?updatedAt=1765960012728"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition border border-white/20"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Main Content */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl w-full">
        {/* Left Side: Computer Graphic */}
        <div className="hidden md:flex items-center justify-center p-4">
          <ComputerGraphic isLogin={false} />
        </div>

        {/* Right Side: Glassmorphism Form */}
        <div
          className={`
            w-full p-8 rounded-2xl shadow-2xl transition-all duration-500
            border border-white/10
            bg-white/10 backdrop-blur-xl
            shadow-black/30
          `}
        >
          <div className="text-white">
            <AnimatePresence mode="wait">
              <motion.h2
                key="registerTitle"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-3xl font-bold text-center mb-2"
              >
                Create Account
              </motion.h2>
              <p className="text-center text-gray-300 mb-8 text-sm">
                Start your journey with adaptive AI learning
              </p>
            </AnimatePresence>

            {/* Google Sign Up Button */}
            <div className="space-y-4">
                <GoogleSignInPopup
                  redirect={`${BACKEND_API}/api/auth/google`}
                    label="Sign up with Google"
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-lg active:scale-95"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                    Sign up with Google
                </GoogleSignInPopup>
            </div>

            <div className="text-center mt-8 text-sm text-gray-300">
              <AnimatePresence mode="wait">
                <motion.p
                  key="hasAccount"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  Already have an account?
                  <Link
                    to="/auth/login"
                    className="text-blue-400 hover:text-blue-300 font-bold ml-2 underline decoration-2 underline-offset-4"
                  >
                    Login
                  </Link>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;