import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyCertificate as verifyCertificateApi } from '../../utils/certificateApi';

const VerifyCertificate = () => {
  const { credentialId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await verifyCertificateApi(credentialId);
        if (!data || !data.certificate) {
          setError('Certificate not found');
          setCertificate(null);
          setLoading(false);
          return;
        }

        const cert = data.certificate;

        // Normalize data for UI
        const issuedDate = cert.date ? new Date(cert.date) : null;
        const expiryDate = issuedDate
          ? new Date(issuedDate.getFullYear() + 2, issuedDate.getMonth(), issuedDate.getDate())
          : null;

        setCertificate({
          title: cert.title,
          issuer: cert.issuer || 'SARATHI',
          date: issuedDate
            ? issuedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
            : '',
          grade: cert.grade,
          credentialId: cert.credentialId,
          studentName: cert.userId?.name || 'Student',
          studentEmail: cert.userId?.email || '',
          status: 'verified',
          issuedDate: issuedDate ? issuedDate.toISOString().slice(0, 10) : '',
          expiryDate: expiryDate ? expiryDate.toISOString().slice(0, 10) : '',
          skills: cert.skills || [],
          color: cert.color || 'from-blue-500 to-cyan-500',
        });
      } catch (e) {
        console.error('Error verifying certificate:', e);
        setError(e.message || 'The certificate could not be verified.');
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [credentialId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Certificate Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The certificate could not be verified.'}</p>
          <button
            onClick={() => navigate('/student/home')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/student/certificates')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 font-semibold transition-colors"
        >
          Back to Certificates
        </motion.button>

        {/* Main Certificate Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          
          {/* Header */}
          <div className={`h-32 bg-gradient-to-r ${certificate.color} relative flex items-center justify-center`}>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            
            {/* Verification Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 w-fit mx-auto mb-8"
            >
              <span className="font-bold">Certificate Verified ✓</span>
            </motion.div>

            {/* Certificate Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-center text-slate-900 mb-2"
            >
              {certificate.title}
            </motion.h1>
            <p className="text-center text-slate-600 mb-8">Issued by {certificate.issuer}</p>

            {/* Student Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Awarded to</h3>
              <p className="text-2xl font-bold text-slate-900">{certificate.studentName}</p>
              <p className="text-slate-600">{certificate.studentEmail}</p>
            </motion.div>

            {/* Details Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="mb-3">
                  <span className="text-xs font-bold text-blue-600 uppercase">Grade</span>
                </div>
                <p className="text-3xl font-bold text-blue-900">{certificate.grade}</p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6">
                <div className="mb-3">
                  <span className="text-xs font-bold text-purple-600 uppercase">Issued</span>
                </div>
                <p className="text-lg font-bold text-purple-900">{certificate.date}</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6">
                <div className="mb-3">
                  <span className="text-xs font-bold text-amber-600 uppercase">Credential ID</span>
                </div>
                <p className="text-sm font-mono font-bold text-amber-900 break-all">{certificate.credentialId}</p>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Skills Demonstrated</h3>
              <div className="flex flex-wrap gap-3">
                {certificate.skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Validity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-600"
            >
              <p>
                Valid from <span className="font-bold text-slate-900">{certificate.issuedDate}</span> to{' '}
                <span className="font-bold text-slate-900">{certificate.expiryDate}</span>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          This is a verified digital certificate. Scan the QR code on the original certificate to verify its authenticity.
        </motion.p>
      </div>
    </div>
  );
};

export default VerifyCertificate;
