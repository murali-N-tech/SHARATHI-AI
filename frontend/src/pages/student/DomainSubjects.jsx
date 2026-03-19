import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Clock, Award, Star, Target, Zap,
  CheckCircle, Lock, ChevronRight,
  Search, Grid, List
} from 'lucide-react';
import { DOMAINS } from '../../utils/domains';

const DomainSubjects = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (domain) setSelectedDomain(domain);
  }, [domainId]);

  if (!selectedDomain) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Domain not found</h2>
          <button onClick={() => navigate('/student/home')} className="text-brand-600">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const programs = selectedDomain.programs.map((program, index) => ({
    id: index,
    name: program,
    description: getDescription(program),
    duration: getDuration(),
    difficulty: getDifficulty(index),
    modules: Math.floor(Math.random() * 8) + 4,
    students: Math.floor(Math.random() * 5000) + 500,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1)
  }));

  let filteredPrograms = programs.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedDifficulty !== 'all') {
    filteredPrograms = filteredPrograms.filter(p => p.difficulty === selectedDifficulty);
  }

  const Icon = selectedDomain.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 overflow-x-hidden">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <button
            onClick={() => navigate('/student/home')}
            className="flex items-center gap-2 text-gray-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${selectedDomain.bg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 sm:w-9 sm:h-9 ${selectedDomain.color}`} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{selectedDomain.title}</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {selectedDomain.programs.length} programs available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 text-sm border rounded-lg"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow text-brand-600' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-brand-600' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRAMS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence>
          {filteredPrograms.map((program, index) => (
              <ProgramRowItem
                key={program.id}
                program={program}
                index={index}
                navigate={navigate}
                domainId={domainId}
              />
            ))}
          <DomainAssessmentRow
            domainTitle={selectedDomain.title}
            totalPrograms={filteredPrograms.length}
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

/* PROGRAM ROW (Mobile Optimized) */
const ProgramRowItem = ({ program, index, navigate, domainId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border hover:border-brand-400 transition mb-3"
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg">{program.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{program.description}</p>
          </div>
        </div>

        <button
          onClick={() => {
            const slug = (program.slug || program.name || String(program)).toString().toLowerCase().replace(/\s+/g, '-');
            navigate(`/student/roadmap/${domainId}/${slug}`, { state: { program } });
          }}
          className="mt-2 sm:mt-0 px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Start
        </button>
      </div>
    </motion.div>
  );
};

/* FINAL ASSESSMENT */
const DomainAssessmentRow = ({ domainTitle, totalPrograms }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-6 border-2 border-dashed rounded-xl p-4 sm:p-6 bg-white"
  >
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Award className="w-7 h-7 sm:w-10 sm:h-10 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold">{domainTitle} Final Assessment</h3>
          <p className="text-sm text-gray-600">
            Complete all {totalPrograms} programs to unlock
          </p>
        </div>
      </div>

      <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Locked
      </button>
    </div>
  </motion.div>
);

/* HELPERS */
const getDescription = (name) =>
  ({
    Algebra: 'Master equations and functions',
    Geometry: 'Understand shapes and angles',
    Python: 'Learn Python from scratch',
    Java: 'Object-oriented programming',
    default: 'Build strong fundamentals'
  }[name] || 'Build strong fundamentals');

const getDuration = () =>
  ['4 weeks', '6 weeks', '8 weeks'][Math.floor(Math.random() * 3)];

const getDifficulty = (i) =>
  ['beginner', 'intermediate', 'advanced'][i % 3];

export default DomainSubjects;
