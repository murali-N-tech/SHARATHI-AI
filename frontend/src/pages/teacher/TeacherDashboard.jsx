import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  FileSpreadsheet,
  Sparkles,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Zap,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";
import Navbar from "../../components/Navbar";
import { MODEL_API, BACKEND_API } from '../../lib/apiConfig';

// Static Topics Data
const TOPICS_DATA = [
  "Roux",
  "Sous Vide",
  "Blanching",
  "Emulsification",
  "Fermentation",
  "Caramelization",
];


// Static Student Stats Data
const STUDENT_STATS_DATA = {
  class_name: "Unknown Class",
  program_name: "introduction-to-cooking",
  timestamp: "2025-12-19T15:20:23.694918",
  aggregated_data: {
    total_students: 6,
    overall_raw_accuracy: "63.0%",
    overall_normalized_accuracy: "45.8%",
    total_questions_answered: 27,
    strong_topics: [],
    weak_topics: [
      {
        topic: "Roux",
        raw_accuracy: "20.0%",
        weighted_accuracy: "22.6%",
        reliability: "High",
      },
      {
        topic: "Sous Vide",
        raw_accuracy: "66.7%",
        weighted_accuracy: "42.4%",
        reliability: "Medium",
      },
      {
        topic: "Blanching",
        raw_accuracy: "66.7%",
        weighted_accuracy: "51.0%",
        reliability: "High",
      },
    ],
  },
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [modelOutput, setModelOutput] = useState(null);

  /* ---------------- Initial Load & Get Teacher Name ---------------- */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setTeacherName(userData?.name || userData?.fullName || "Teacher");
  }, []);

  /* ---------------- Fetch existing assignments from backend ---------------- */
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`${BACKEND_API}/api/assignments`);
        if (!res.ok) {
          console.error('[TeacherDashboard] Failed to fetch assignments:', res.status, res.statusText);
          return;
        }
        const json = await res.json();
        if (json?.status === 'success' && Array.isArray(json.data)) {
          const mapped = json.data.map((a) => ({
            id: a._id || a.test_key,
            name: a.assignment_name || 'Untitled Assignment',
            url: `${window.location.origin}/assessment/take/${a.test_key}`,
            createdAt: (a.createdAt || '').slice(0, 10),
          }));
          setAssignments(mapped);
        } else {
          console.warn('[TeacherDashboard] Unexpected assignments response shape', json);
        }
      } catch (err) {
        console.error('[TeacherDashboard] Error fetching assignments from backend', err);
      }
    };

    fetchAssignments();
  }, []);

  /* ---------------- Handle Create Assignment Start ---------------- */
  const handleCreateStart = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${MODEL_API}/assignment/generate_topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      const json = await res.json();
      if (json?.status === "success" && json?.data?.topics?.length) {
        const topics = json.data.topics;
        const titles = topics.map((t) => t.title || t.name || String(t));
        setGeneratedTopics(titles);

        // Save the raw model output so user can decide to persist it
        setModelOutput(json.data);

        setShowCreateModal(false);
        setShowTopicsModal(true);
        setPrompt("");
      } else {
        alert("AI did not return topics. Try refining your prompt.");
      }
    } catch (err) {
      console.error("[TeacherDashboard] generate topics error", err);
      alert("Failed to generate topics. Is the model server running?");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- Handle Generate Link ---------------- */
  const handleGenerateLink = () => {
    // Create the assignment on the backend and show the take-assignment link
    (async () => {
      if (!modelOutput) {
        alert('No generated assignment found. Please generate topics first.');
        return;
      }

      try {
        const assignRes = await fetch(`${BACKEND_API}/api/assignments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modelOutput),
        });
        const assignJson = await assignRes.json();
        const saved = assignJson?.data;
        const serverKey = assignJson?.test_key || saved?.test_key || saved?.testKey || null;
        if (serverKey && saved) {
          const link = `${window.location.origin}/assessment/take/${serverKey}`;
          setGeneratedLink(link);

          // Immediately add the newly created assignment to the list
          const newAssignment = {
            id: saved._id || serverKey,
            name: saved.assignment_name || 'Untitled Assignment',
            url: link,
            createdAt: (saved.createdAt || '').slice(0, 10),
          };

          setAssignments((prev) => [newAssignment, ...prev]);

          setShowTopicsModal(false);
          setShowLinkModal(true);
        } else {
          throw new Error('No test_key returned from server');
        }
      } catch (err) {
        console.error('[TeacherDashboard] failed to save assignment to backend', err);
        alert('Failed to create assignment on server. See console for details.');
      }
    })();
  };

  /* ---------------- Copy Link to Clipboard ---------------- */
  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link copied to clipboard!");
  };

  /* ---------------- Handle Export Assignment ---------------- */
  const handleExport = (assignment) => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Assignment: assignment.name,
        URL: assignment.url,
        CreatedAt: assignment.createdAt,
        Students: 6,
        Status: "Active",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assignment");
    XLSX.writeFile(wb, `${assignment.name}.xlsx`);
  };

  /* ---------------- Handle View Analysis ---------------- */
  const handleViewAnalysis = (assignment) => {
    navigate(`/teacher/assignment-analysis/${assignment.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {/* ============= WELCOME SECTION ============= */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome, <span className="text-indigo-600">{teacherName}</span>
            </h1>
            <p className="text-slate-500 mt-1">Manage your assignments and track student progress</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
          >
            <Sparkles size={20} /> Create Assignment
          </button>
        </div>
      </div>

      <main className="container mx-auto px-8 py-8">
        {/* ============= ASSIGNMENTS SECTION ============= */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Assignments</h2>

          <div className="space-y-4">
            {assignments.map((assignment, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                        {assignment.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {assignment.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Calendar size={14} />
                          <span>Created: {assignment.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1 font-semibold">Assignment URL</p>
                      <p className="text-sm text-slate-700 break-all font-mono">
                        {assignment.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleExport(assignment)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      <Download size={18} /> Export
                    </button>
                    <button
                      onClick={() => handleViewAnalysis(assignment)}
                      className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      <Eye size={18} /> View Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ============= MODAL: CREATE ASSIGNMENT ============= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-slideUp relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 translate-y-32 -translate-x-32" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                      Create Assignment
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Powered by AI ✨
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setPrompt("");
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 mb-6 border border-sky-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      AI-Powered Topic Generation
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Describe your course topic and our AI will generate relevant subtopics 
                      and create a comprehensive assignment tailored to your curriculum.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Assignment Topic
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Advanced cooking techniques, sauce making, food safety, molecular gastronomy..."
                  className="w-full border-2 border-slate-200 rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-brand-600 resize-none transition-all text-slate-900 placeholder-slate-400 text-lg"
                  rows={6}
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Sparkles size={12} />
                  Be as specific as possible for better results
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setPrompt("");
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold transition-all hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStart}
                  disabled={!prompt.trim()}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Zap size={20} />
                  Generate Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============= MODAL: LOADING STATE ============= */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-10 text-center animate-slideUp shadow-2xl max-w-md w-full mx-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-sky-100 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-brand-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              AI is Working...
            </h3>
            <p className="text-slate-600 mb-4">Generating relevant topics for your assignment</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ============= MODAL: TOPICS ============= */}
      {showTopicsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto relative">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Generated Topics</h2>
                    <p className="text-slate-500 mt-1">AI has created {generatedTopics.length || TOPICS_DATA.length} relevant topics</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTopicsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {(generatedTopics.length ? generatedTopics : TOPICS_DATA).map((topic, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-5 text-center hover:shadow-lg transition-all hover:scale-105 hover:border-sky-400 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md">
                      <span className="text-white font-bold">{idx + 1}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-lg">{topic}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowTopicsModal(false);
                    setShowCreateModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold transition-all hover:shadow-md"
                >
                  <ChevronLeft size={20} /> Regenerate
                </button>
                <button
                  onClick={handleGenerateLink}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============= MODAL: GENERATED LINK ============= */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slideUp relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-3xl opacity-40 -translate-y-24 translate-x-24" />

            <div className="relative z-10">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle size={40} className="text-white" />
              </div>

              {/* Header */}
              <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
                Assignment Created!
              </h2>
              <p className="text-slate-600 mb-6 text-center">
                Share this link with your students to get started
              </p>

              {/* Link Display */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-5 mb-6">
                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
                  Assignment Link
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-mono text-slate-700 flex-1 truncate">
                    {generatedLink}
                  </p>
                  <button
                    onClick={copyLink}
                    className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl transition-all shadow-md hover:shadow-lg flex-shrink-0"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-slate-700 text-center">
                  <span className="font-bold text-brand-700">Tip:</span> Students can access this assignment anytime using the link above
                </p>
              </div>

              {/* Done Button */}
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setGeneratedLink("");
                }}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;

