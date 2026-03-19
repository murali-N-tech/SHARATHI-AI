import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, BookOpen, Clock, Award, Star, TrendingUp, 
  CheckCircle, Lock, Play, Target, Zap, ChevronRight,
  Filter, Search, Grid, List, SortAsc
} from 'lucide-react';
import { DOMAINS } from '../../utils/domains';

const DomainSubjects = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'name', 'difficulty'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all', 'beginner', 'intermediate', 'advanced'

  useEffect(() => {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (domain) {
      setSelectedDomain(domain);
    }
  }, [domainId]);

  if (!selectedDomain) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Domain not found</h2>
          <button
            onClick={() => navigate('/student/home')}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Get programs with enhanced data
  const programs = selectedDomain.programs.map((program, index) => ({
    id: index,
    slug: program.toLowerCase().replace(/\s+/g, '-'),
    name: program,
    description: getDescription(program),
    duration: getDuration(),
    difficulty: getDifficulty(index),
    modules: Math.floor(Math.random() * 8) + 4,
    students: Math.floor(Math.random() * 5000) + 500,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1)
  }));

  // Filter and sort programs
  let filteredPrograms = programs.filter(program => 
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedDifficulty !== 'all') {
    filteredPrograms = filteredPrograms.filter(
      program => program.difficulty === selectedDifficulty
    );
  }

  if (sortBy === 'name') {
    filteredPrograms.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'difficulty') {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    filteredPrograms.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
  }

  const Icon = selectedDomain.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/student/home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
            <span className="font-medium">Back to Home</span>
          </button>

          {/* Domain Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl ${selectedDomain.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-9 h-9 ${selectedDomain.color}`} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedDomain.title}</h1>
                <p className="text-gray-600">
                  Explore {selectedDomain.programs.length} programs to master {selectedDomain.title}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">{programs.length}</div>
                <div className="text-sm text-gray-600">Programs Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2 items-center flex-wrap">
              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="default">Default Order</option>
                <option value="name">Sort by Name</option>
                <option value="difficulty">Sort by Difficulty</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-brand-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-brand-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPrograms.map((program, index) => (
                <ProgramRowItem
                  key={program.id}
                  program={program}
                  domainColor={selectedDomain.color}
                  domainBg={selectedDomain.bg}
                  index={index}
                  domainId={selectedDomain.id}
                />
              ))}
              {/* Domain Assessment Test */}
              <DomainAssessmentRow 
                domainTitle={selectedDomain.title}
                domainColor={selectedDomain.color}
                domainBg={selectedDomain.bg}
                totalPrograms={filteredPrograms.length}
              />
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPrograms.map((program, index) => (
                <ProgramCompactItem
                  key={program.id}
                  program={program}
                  domainColor={selectedDomain.color}
                  domainBg={selectedDomain.bg}
                  index={index}
                  domainId={selectedDomain.id}
                />
              ))}
              {/* Domain Assessment Test */}
              <DomainAssessmentCompact 
                domainTitle={selectedDomain.title}
                domainColor={selectedDomain.color}
                domainBg={selectedDomain.bg}
                totalPrograms={filteredPrograms.length}
              />
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// Row Item Component (Default Grid View - Horizontal Layout)
const ProgramRowItem = ({ program, domainColor, domainBg, index, domainId }) => {
  const navigate = useNavigate();
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'border-green-400 bg-green-50';
      case 'intermediate': return 'border-yellow-400 bg-yellow-50';
      case 'advanced': return 'border-red-400 bg-red-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'intermediate': return 'bg-yellow-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      className="group"
    >
      <div className="bg-white rounded-lg border border-gray-200 hover:border-brand-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="flex items-center gap-4 p-5">
          {/* Number Badge */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">{index + 1}</span>
            </div>
          </div>

          {/* Program Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-1">
                  {program.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1">{program.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className={`px-2.5 py-0.5 rounded text-xs font-bold ${getDifficultyBadge(program.difficulty)}`}>
                {program.difficulty.toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">{program.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <BookOpen className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">{program.modules} modules</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" fill="#facc15" stroke="#facc15" strokeWidth={2} />
                <span className="font-bold text-gray-900">{program.rating}</span>
                <span className="text-gray-500">({program.students.toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => {
                const slug = program.slug || String(program.name || program).toLowerCase().replace(/\s+/g,'-');
                navigate(`/student/roadmap/${domainId}/${slug}`, { state: { program, domainTitle: domainColor, domainBg, domainId } });
              }}
              className="px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white"
            >
              <Play className="w-4 h-4" strokeWidth={2} />
              Play
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Domain Assessment Row Component (For Grid View)
const DomainAssessmentRow = ({ domainTitle, domainColor, domainBg, totalPrograms }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: totalPrograms * 0.03 }}
      className="group mt-8"
    >
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300 p-6">
        <div className="flex items-center gap-6">
          {/* Icon Section */}
          <div className="flex-shrink-0 relative">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Award className="w-10 h-10 text-indigo-600" strokeWidth={2} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {domainTitle} Final Assessment
              </h3>
              <p className="text-sm text-gray-600">
                Complete all {totalPrograms} programs to unlock this test
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <span>50 Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <span>60 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <span>Certificate Available</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            <button
              disabled
              className="px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2"
            >
              <Lock className="w-4 h-4" strokeWidth={2} />
              Locked
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Domain Assessment Compact Component (For List View)
const DomainAssessmentCompact = ({ domainTitle, domainColor, domainBg, totalPrograms }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: totalPrograms * 0.02 }}
      className="group cursor-not-allowed mt-6"
    >
      <div className="bg-white border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 relative">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Award className="w-7 h-7 text-indigo-600" strokeWidth={2} />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">
                {domainTitle} Final Assessment
              </h3>
              <p className="text-sm text-gray-600 truncate">
                Complete {totalPrograms} programs • 50 Questions • 60 Minutes
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            <button
              disabled
              className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Lock className="w-4 h-4" strokeWidth={2} />
              Locked
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Compact Item Component (List View - More Condensed)
const ProgramCompactItem = ({ program, domainColor, domainBg, index, domainId }) => {
  const navigate = useNavigate();
  
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay: index * 0.02 }}
      onClick={() => {
        const slug = program.slug || String(program.name || program).toLowerCase().replace(/\s+/g,'-');
        navigate(`/student/roadmap/${domainId}/${slug}`, { state: { program, domainTitle: domainColor, domainBg, domainId } });
      }}
      className="group cursor-pointer"
    >
      <div className="bg-white hover:bg-gradient-to-r hover:from-brand-50 hover:to-transparent border-l-4 border-gray-200 hover:border-brand-500 transition-all duration-200 p-4 rounded-r-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-xl font-bold text-gray-400 group-hover:text-brand-600 transition-colors">
                {index + 1}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                  {program.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 truncate">{program.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span>{getDifficultyIcon(program.difficulty)}</span>
              <span className="text-gray-700 font-medium capitalize">{program.difficulty}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-600 min-w-[80px]">
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="font-medium">{program.duration}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-600 min-w-[90px]">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="font-medium">{program.modules} modules</span>
            </div>

            <div className="flex items-center gap-1 min-w-[80px]">
              <Star className="w-3.5 h-3.5" fill="#facc15" stroke="#facc15" strokeWidth={2} />
              <span className="text-sm font-bold text-gray-900">{program.rating}</span>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" strokeWidth={2} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions
const getDescription = (programName) => {
  const descriptions = {
    // Mathematics
    'Algebra': 'Master equations, functions, and algebraic expressions',
    'Geometry': 'Explore shapes, angles, and spatial reasoning',
    'Calculus': 'Learn derivatives, integrals, and limits',
    'Trigonometry': 'Study triangles, waves, and periodic functions',
    'Probability & Statistics': 'Understand data analysis and probability theory',
    
    // Science
    'Physics': 'Explore motion, energy, and forces in the universe',
    'Chemistry': 'Study matter, reactions, and molecular structures',
    'Biology': 'Discover life, organisms, and biological systems',
    
    // Programming
    'Python': 'Learn the most popular programming language',
    'Java': 'Master object-oriented programming with Java',
    'C': 'Understand low-level programming fundamentals',
    'C++': 'Advanced programming with C++ features',
    
    // Default
    default: 'Comprehensive course to build your skills and knowledge'
  };
  
  return descriptions[programName] || descriptions.default;
};

const getDuration = () => {
  const durations = ['4 weeks', '6 weeks', '8 weeks', '10 weeks', '12 weeks'];
  return durations[Math.floor(Math.random() * durations.length)];
};

const getDifficulty = (index) => {
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  return difficulties[index % 3];
};

export default DomainSubjects;
