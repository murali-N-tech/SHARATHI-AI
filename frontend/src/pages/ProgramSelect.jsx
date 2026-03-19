import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import { DOMAINS } from '../utils/domains';

const ProgramSelect = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();

  // Find the selected domain data
  const selectedDomain = DOMAINS.find(d => d.id === domainId);

  // Fallback if domain not found
  if (!selectedDomain) {
    return <div className="p-10 text-center">Domain not found. <button onClick={() => navigate('/')} className="text-blue-500 underline">Go Home</button></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-slate-500 hover:text-brand-600 mb-8 transition-colors group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium">Back to Domains</span>
        </button>

        <div className="flex items-center gap-6 mb-12">
          <div className={`p-6 rounded-2xl ${selectedDomain.bg} ${selectedDomain.color}`}>
            <selectedDomain.icon size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{selectedDomain.title}</h1>
            <p className="text-slate-600 text-lg">Select a specific topic to begin your assessment.</p>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedDomain.programs.map((program, index) => (
            <div
              key={index}
              // Clicking a program starts the guest assessment for this domain
              onClick={() => navigate(`/assessment/${domainId}`)}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg border border-slate-100 cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  <BookOpen size={24} />
                </div>
                {index === 0 && (
                   <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                     <Star size={10} fill="currentColor" /> Popular
                   </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{program}</h3>
              <p className="text-sm text-slate-500 mb-4">Adaptive assessment • Beginner to Advanced</p>
              
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
              </div>
              </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProgramSelect;