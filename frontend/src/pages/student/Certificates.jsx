import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { X } from 'lucide-react';
import { getUserCertificates } from '../../utils/certificateApi';

const Certificates = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [userData, setUserData] = useState({ name: 'Student', email: '' });
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrCodeRef = useRef(null);

  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData({
          name: user.name || 'Student',
          email: user.email || ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load certificates for the logged-in user
  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserCertificates();
        if (data && Array.isArray(data.certificates)) {
          setCertificates(data.certificates);
        } else {
          setCertificates([]);
        }
      } catch (e) {
        console.error('Error loading certificates:', e);
        setError('Failed to load certificates');
        setCertificates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificates();
  }, []);

  // Filter Logic
  const filteredCerts = certificates.filter(cert => {
    const status = cert.status || 'earned';
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'earned' 
        ? status === 'earned' 
        : status === 'locked';
    
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const earnedCount = certificates.filter(c => (c.status || 'earned') === 'earned').length;

  // Generate QR code when certificate is selected
  useEffect(() => {
    if (selectedCert && qrCodeRef.current) {
      // Build base URL dynamically: prefer Vite env var, fall back to current origin
      const origin =
        typeof window !== 'undefined'
          ? (import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin)
          : (import.meta.env.VITE_PUBLIC_BASE_URL || '');
      const qrUrl = `http://172.36.5.136:3000/student/verify-certificate/${selectedCert.credentialId}`;
      QRCode.toCanvas(qrCodeRef.current, qrUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 200,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [selectedCert]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      
      {/* --- Page Header --- */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              My Credentials
            </h1>
            <p className="text-slate-500 text-lg">
              Showcase your achievements and verify your skills.
            </p>
          </div>

          {/* Mini Stats */}
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">✓</div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{earnedCount}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Earned</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">🔒</div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{certificates.length - earnedCount}</div>
                <div className="text-xs text-slate-500 font-bold uppercase">Locked</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Controls Toolbar --- */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
            {['all', 'earned', 'locked'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-brand-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search certificates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Certificates Grid --- */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCerts.map((cert) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={cert._id || cert.id}
              className={`group relative 
                bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${
                (cert.status || 'earned') === 'locked' 
                  ? 'border-slate-200 opacity-80 hover:opacity-100' 
                  : 'border-slate-200 hover:border-brand-300 hover:shadow-2xl hover:-translate-y-1'
              }`}
            >
              {/* Card Preview Area */}
              <div className={`h-40 relative overflow-hidden flex items-center justify-center bg-gradient-to-br ${cert.color}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                {/* Icon/Badge */}
                  {/* <div className="relative z-10 bg-white/20 backdrop-blur-md p-4 rounded-full shadow-lg border border-white/30 transform transition-transform group-hover:scale-110">
                    <span className="text-4xl drop-shadow-md">{cert.icon}</span>
                  </div> */}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {(cert.status || 'earned') === 'earned' ? (
                    <span className="bg-white/90 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-slate-900/50 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                      Locked
                    </span>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight group-hover:text-brand-600 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-sm text-slate-500 mb-4">{cert.issuer}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(cert.skills || []).slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto">
                  {(cert.status || 'earned') === 'earned' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedCert(cert)}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-brand-600/20"
                      >
                        View
                      </button>
                      <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors" title="Download PDF">
                        ⬇
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Progress</span>
                        <span>{cert.progress ?? 0}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-400 rounded-full" 
                          style={{ width: `${cert.progress ?? 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-brand-600 mt-2 font-medium">
                        {cert.requirement || ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- Certificate Detail Modal --- */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Certificate</h3>
                <button 
                  onClick={() => setSelectedCert(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 bg-slate-50">
                {/* Certificate - Horizontal/Landscape Layout */}
                <div className="bg-white border-4 border-blue-200 p-12 rounded-2xl shadow-2xl relative overflow-hidden mb-8" style={{ aspectRatio: '16/10' }}>
                  {/* Blue Gradient Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                  
                  {/* SARATHI Logo Background Watermark */}
                  <div className="absolute -right-16 -top-16 opacity-5 pointer-events-none">
                    <img src="/SARATHI.jng" alt="SARATHI" className="w-80 h-80 object-contain" />
                  </div>
                  
                  {/* Corner Blue Accents */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-2 border-blue-500"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-2 border-blue-500"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-2 border-blue-500"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-blue-500"></div>
                  
                  {/* Main Content Container */}
                  <div className="relative z-10 h-full flex items-center justify-between">
                    {/* Top Logo Section */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                      <img src="/SARATHI-Picsart-BackgroundRemover.jpg" alt="SARATHI Logo" className="h-16 w-auto" />
                    </div>
                    
                    {/* Left Content */}
                    <div className="flex-1 pr-8 pt-6">
                      {/* Certificate Header */}
                      <div className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-3">Certificate of Achievement</div>
                      
                      {/* Title */}
                      <h2 className="text-3xl font-serif font-bold text-blue-900 mb-4">{selectedCert.title}</h2>
                      
                      {/* Divider Line */}
                      <div className="w-16 h-1 bg-blue-500 rounded-full mb-6"></div>
                      
                      {/* Recipient Info */}
                      <div className="mb-6">
                        <p className="text-slate-600 text-sm mb-2">This certificate is proudly presented to</p>
                        <p className="text-blue-900 text-xl font-bold font-serif mb-1">{userData.name}</p>
                        {userData.email && (
                          <p className="text-slate-500 text-xs font-mono">{userData.email}</p>
                        )}
                      </div>
                      
                      {/* Achievement Details */}
                      <div className="flex gap-6 text-slate-700 text-sm">
                        <div>
                          <span className="block text-xs text-slate-500 uppercase font-bold">Date</span>
                          <span className="text-slate-900 font-semibold">{selectedCert.date}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-500 uppercase font-bold">Grade</span>
                          <span className="text-slate-900 font-semibold">{selectedCert.grade}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-500 uppercase font-bold">ID</span>
                          <span className="text-slate-900 font-mono text-xs">{selectedCert.credentialId}</span>
                        </div>
                      </div>
                      
                      {/* Footer Text */}
                      {/* <p className="text-slate-500 text-xs italic mt-6">Issued by SARATHI </p>     */}
                    </div>

                    {/* Right Side - QR Code */}
                    <div className="flex flex-col items-center justify-center border-l-2 border-blue-200 pl-8">
                      <p className="text-xs font-bold text-blue-600 mb-3 text-center">Scan to Verify</p>
                      <div className="bg-white p-3 rounded-lg border-2 border-blue-300 shadow-md">
                        <div className="w-32 h-32 flex items-center justify-center bg-white rounded">
                          <canvas ref={qrCodeRef} className="w-full h-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-600/25">
                    Download PDF
                  </button>
                  <button className="flex-1 bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    Share Link
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Certificates;