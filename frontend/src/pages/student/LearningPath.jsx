import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BACKEND_API } from '../../lib/apiConfig';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Star, 
  MapPin,
  Trophy,
  Flag,
  ArrowLeft,
  BookOpen,
  Target,
  Award
} from 'lucide-react';

const LEVELS = [
  { id: 1, title: 'Introduction to Logic', type: 'Concept', status: 'completed', stars: 3, xp: 500, desc: 'Understand the basics of boolean logic.' },
  { id: 2, title: 'Variables & Data Types', type: 'Lesson', status: 'completed', stars: 2, xp: 750, desc: 'Mastering strings, integers, and storage.' },
  { id: 3, title: 'Control Structures', type: 'Challenge', status: 'current', stars: 0, xp: 1000, desc: 'Loops, If-Else, and decision making.' },
  { id: 4, title: 'Functions & Scope', type: 'Lesson', status: 'locked', stars: 0, xp: 1200, desc: 'Writing reusable blocks of code.' },
  { id: 5, title: 'Data Structures I', type: 'Project', status: 'locked', stars: 0, xp: 2000, desc: 'Build a contact management system.' },
  { id: 6, title: 'Object Oriented Programming', type: 'Boss', status: 'locked', stars: 0, xp: 2500, desc: 'Final Boss: The RPG Game Logic.' },
];

const LearningPath = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { program: stateProgram, domainTitle: stateDomainTitle, domainBg: stateDomainBg, domainId: stateDomainId } = location.state || {};
  // Route path is /student/roadmap/:domainId/:slug -> map slug to programSlug
  const { domainId: paramDomainId, slug: programSlug } = useParams();

  const domainId = stateDomainId || paramDomainId;

  const program = stateProgram || (programSlug ? {
    name: programSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    slug: programSlug,
    modules: 6,
    difficulty: 'Beginner',
    duration: '6 weeks'
  } : null);
  const domainTitle = stateDomainTitle || '';
  const domainBg = stateDomainBg || '';

  // Generate dynamic levels based on the program
  const generateLevels = (programName, modules) => {
    return [
      {
        id: 1,
        title: `${programName} - Basics`,
        type: 'Foundation',
        status: 'current',
        stars: 0,
        xp: 500,
        desc: 'Build a strong foundation with fundamental concepts'
      },
      {
        id: 2,
        title: `${programName} - Easy Level`,
        type: 'Beginner',
        status: 'locked',
        stars: 0,
        xp: 750,
        desc: 'Practice basic problems and simple applications'
      },
      {
        id: 3,
        title: `${programName} - Medium Level`,
        type: 'Intermediate',
        status: 'locked',
        stars: 0,
        xp: 1000,
        desc: 'Tackle intermediate challenges and real-world scenarios'
      },
      {
        id: 4,
        title: `${programName} - Hard Level`,
        type: 'Advanced',
        status: 'locked',
        stars: 0,
        xp: 1500,
        desc: 'Master advanced concepts and complex problem-solving'
      },
      {
        id: 5,
        title: `${programName} - Final Assessment`,
        type: 'Certification',
        status: 'locked',
        stars: 0,
        xp: 2500,
        desc: 'Complete the final test and earn your certificate'
      }
    ];
  };

  const [levels, setLevels] = useState(() => (
    program ? generateLevels(program.name, program.modules || 6) : [
      { id: 1, title: 'Introduction to Logic', type: 'Concept', status: 'completed', stars: 3, xp: 500, desc: 'Understand the basics of boolean logic.' },
      { id: 2, title: 'Variables & Data Types', type: 'Lesson', status: 'completed', stars: 2, xp: 750, desc: 'Mastering strings, integers, and storage.' },
      { id: 3, title: 'Control Structures', type: 'Challenge', status: 'current', stars: 0, xp: 1000, desc: 'Loops, If-Else, and decision making.' },
      { id: 4, title: 'Functions & Scope', type: 'Lesson', status: 'locked', stars: 0, xp: 1200, desc: 'Writing reusable blocks of code.' },
      { id: 5, title: 'Data Structures I', type: 'Project', status: 'locked', stars: 0, xp: 2000, desc: 'Build a contact management system.' },
      { id: 6, title: 'Object Oriented Programming', type: 'Boss', status: 'locked', stars: 0, xp: 2500, desc: 'Final Boss: The RPG Game Logic.' },
    ]
  ));

  // We use fixed heights to align the SVG curve perfectly with the CSS grid/flex layout
  const ITEM_HEIGHT = 180; // height of each level row in pixels
  // TOTAL_HEIGHT and road path are computed from the current `levels` state
  const getTotalHeight = () => {
    const count = (typeof levels !== 'undefined' && levels && levels.length) ? levels.length : LEVELS.length;
    return count * ITEM_HEIGHT + 100;
  };

  // Calculate SVG Path for a smooth S-curve road using the active levels sequence
  const generateRoadPath = () => {
    const seq = (typeof levels !== 'undefined' && levels && levels.length) ? levels : LEVELS;
    let path = `M 50 ${0}`; // Start Top Center (percentage)

    seq.forEach((_, index) => {
      const y = index * ITEM_HEIGHT + (ITEM_HEIGHT / 2); // Center Y of the item
      const x = index % 2 === 0 ? 25 : 75; // Zig-zag X positions (25% and 75%)

      // Control points for smooth bezier curves
      const prevY = index === 0 ? 0 : (index - 1) * ITEM_HEIGHT + (ITEM_HEIGHT / 2);
      const prevX = index === 0 ? 50 : (index - 1) % 2 === 0 ? 25 : 75;

      const cp1y = prevY + ITEM_HEIGHT * 0.5;
      const cp2y = y - ITEM_HEIGHT * 0.5;

      // First segment connects start to first point
      if (index === 0) {
        path += ` Q 50 ${y / 2}, ${x} ${y}`;
      } else {
        path += ` C ${prevX} ${cp1y}, ${x} ${cp2y}, ${x} ${y}`;
      }
    });

    return path;
  };

  useEffect(() => {
    // Fetch completed levels for this course
    const fetchCompletedLevels = async () => {
      try {
        // Use the programSlug directly (it's a primitive value, not an object)
        if (!domainId || !programSlug) {
          console.log('fetchCompletedLevels: missing domainId or programSlug', { domainId, programSlug });
          return;
        }

        // Get email from localStorage userData
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          console.log('fetchCompletedLevels: userData not found in localStorage');
          return;
        }

        let userData;
        try {
          userData = JSON.parse(userDataStr);
        } catch (e) {
          console.log('fetchCompletedLevels: failed to parse userData', e);
          return;
        }

        const email = userData?.email;
        if (!email) {
          console.log('fetchCompletedLevels: email not found in userData');
          return;
        }

        const q = new URLSearchParams({ domainId, programId: programSlug, email });
        const url = `${BACKEND_API}/api/quiz-sessions/levels/completed?${q.toString()}`;
        console.log('Fetching completed levels from:', url);
        
        const res = await fetch(url);
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          console.log('Response not ok');
          return;
        }
        
        const body = await res.json();
        const completedLevelsData = body.completedLevels || [];
        console.log('Completed levels data:', completedLevelsData);

        if (completedLevelsData.length > 0) {
          // Extract level numbers from response
          const levelNumbers = completedLevelsData.map(item => item.level);
          console.log('Level numbers:', levelNumbers);

          setLevels(prev => {
            // Find the max completed level
            const maxCompleted = Math.max(...levelNumbers);
            const cappedMax = Math.min(maxCompleted, prev.length);

            return prev.map(l => {
              if (l.id <= cappedMax) {
                return { ...l, status: 'completed' };
              } else if (l.id === cappedMax + 1) {
                return { ...l, status: 'current' };
              } else {
                return { ...l, status: 'locked' };
              }
            });
          });
        }
      } catch (e) {
        console.error('Failed to fetch completed levels', e);
      }
    };

    fetchCompletedLevels();
  }, [domainId, programSlug]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 overflow-hidden">
      
      {/* Back Button */}
      {program && (
        <div className="max-w-3xl mx-auto mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
            <span className="font-medium">Back to Programs</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        {program && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 bg-white border-2 border-brand-200 px-6 py-3 rounded-2xl shadow-md mb-3">
              <BookOpen className="w-6 h-6 text-brand-600" strokeWidth={2} />
              <div className="text-left">
                <div className="text-xs text-gray-500 font-semibold uppercase">Now Learning</div>
                <div className="text-lg font-bold text-gray-900">{program.name}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{program.difficulty}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{program.modules} modules</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{program.duration}</span>
              </div>
            </div>
          </div>
        )}
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
          <MapPin size={16} /> Adventure Mode
        </div>
        <h1 className="text-4xl font-bold text-slate-900">
          {program ? `${program.name} Learning Path` : 'Your Learning Journey'}
        </h1>
        <p className="text-slate-500 mt-2">Follow the path to mastery</p>
      </div>

      <div className="max-w-3xl mx-auto relative min-h-[1000px]">
        
        {/* --- THE CURVED ROAD (SVG) --- */}
        {/* We use a percentage-based ViewBox to scale responsive width, but fixed height */}
        <svg 
          className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block"
          viewBox={`0 0 100 ${getTotalHeight()}`} 
          preserveAspectRatio="none"
        >
          {/* Outer Road Border (White) */}
          <path 
            d={generateRoadPath()} 
            fill="none" 
            stroke="white" 
            strokeWidth="40" 
            strokeLinecap="round"
            className="drop-shadow-sm"
          />
          {/* Inner Road (Gray) */}
          <path 
            d={generateRoadPath()} 
            fill="none" 
            stroke="#e2e8f0" 
            strokeWidth="24" 
            strokeLinecap="round"
          />
          {/* Dashed Center Line */}
          <path 
            d={generateRoadPath()} 
            fill="none" 
            stroke="#94a3b8" 
            strokeWidth="2" 
            strokeDasharray="10 10" 
            strokeLinecap="round"
            className="opacity-50"
          />
        </svg>

        {/* --- VERTICAL LINE (MOBILE ONLY) --- */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200 md:hidden"></div>


        {/* --- LEVELS --- */}
        <div className="relative z-10">
          {levels.map((level, index) => {
            const isLeft = index % 2 === 0;
            const isCompleted = level.status === 'completed';
            const isCurrent = level.status === 'current';
            const isLocked = level.status === 'locked';
            
            // Positioning Logic
            // On Mobile: All align left
            // On Desktop: Alternating Left (0%) / Right (50% + offset)
            const desktopPositionClass = isLeft 
              ? 'md:flex-row md:justify-start md:pr-[50%]' 
              : 'md:flex-row-reverse md:justify-start md:pl-[50%]';

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ height: ITEM_HEIGHT }} // Fixed height to align with SVG
                className={`flex items-center w-full relative pl-16 md:pl-0 ${desktopPositionClass}`}
              >
                
                {/* --- 1. The Marker Node (On the Road) --- */}
                {/* Mobile: Absolute Left. Desktop: Centered on the zig-zag end points */}
                <div className={`
                  absolute md:static left-5 md:left-auto flex-shrink-0 z-20 transition-transform duration-300
                  ${isLeft ? 'md:order-2 md:-ml-8' : 'md:order-2 md:-mr-8'}
                `}>
                  <div className={`
                    w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-xl relative
                    ${isCompleted 
                      ? 'bg-green-500 border-green-100' 
                      : isCurrent 
                      ? 'bg-brand-600 border-brand-100 animate-bounce-slow' 
                      : 'bg-slate-300 border-slate-100'}
                  `}>
                    {/* Inner Icon */}
                    {isCompleted ? <CheckCircle2 size={28} className="text-white" /> :
                     isCurrent ? <Play size={28} className="text-white ml-1 fill-white" /> :
                     <Lock size={24} className="text-slate-500" />}

                    {/* Current Indicator (Ripple) */}
                    {isCurrent && (
                      <span className="absolute -inset-2 rounded-full border-2 border-brand-500 opacity-50 animate-ping"></span>
                    )}
                  </div>
                </div>


                {/* --- 2. Content Card --- */}
                <div className={`
                  flex-1 md:w-full max-w-sm transition-all duration-300
                  ${isLeft ? 'md:mr-12 md:text-right' : 'md:ml-12 md:text-left'}
                `}>
                  <div className={`
                    p-5 rounded-2xl bg-white border-2 shadow-sm relative group hover:-translate-y-1 transition-transform
                    ${isCurrent ? 'border-brand-500 shadow-brand-100' : 'border-slate-100'}
                  `}>
                     {/* Connector Triangle (Desktop) */}
                     <div className={`
                       hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t-2 border-r-2 
                       ${isLeft 
                          ? '-right-[7px] rotate-45 border-slate-100' 
                          : '-left-[7px] -rotate-135 border-slate-100'}
                       ${isCurrent ? 'border-brand-500' : ''}
                     `}></div>

                    <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {level.type}
                        </span>
                        {isCompleted && (
                          <div className="flex text-yellow-400">
                             {[...Array(level.stars)].map((_, i) => <Star key={i} size={10} fill="currentColor"/>)}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{level.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{level.desc}</p>
                      
                      <button 
                        onClick={() => {
                          if (!isLocked && program && domainId) {
                            const programSlug = program.name?.toLowerCase().replace(/\s+/g, '-') || 'program';
                            navigate(`/quiz/${domainId}/${programSlug}/${index + 1}`);
                          }
                        }}
                        disabled={isLocked}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                          isCompleted ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                          isCurrent ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-200 cursor-pointer' :
                          'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? 'Review Lesson' : isCurrent ? 'Start Now' : 'Locked'}
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
          
          {/* Finish Line */}
          <div className="flex justify-center mt-8 relative z-10">
             <div className="bg-slate-900 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-xl border-4 border-slate-100">
               <Flag size={20} className="text-yellow-400 fill-yellow-400" />
               <span className="font-bold">Goal</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LearningPath;