import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Mail,
  User,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";
import Navbar from "../../components/Navbar";
import { BACKEND_API } from "../../lib/apiConfig";

// Fallback mock detailed student data (used only when no real sessions found)
const FALLBACK_DETAILED_STUDENT_DATA = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@college.edu",
    score: 75,
    questionsAnswered: 12,
    accuracy: "62.5%",
    timeSpent: "45 min",
    status: "Completed",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@college.edu",
    score: 82,
    questionsAnswered: 15,
    accuracy: "73.3%",
    timeSpent: "52 min",
    status: "Completed",
  },
];

// Fallback topic-wise performance for when no real topic insights exist
const FALLBACK_TOPIC_PERFORMANCE = [
  { topic: "Topic 1", accuracy: 60, reliability: "Medium" },
  { topic: "Topic 2", accuracy: 70, reliability: "Medium" },
];

const AssignmentAnalysis = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState("overview");
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [studentRows, setStudentRows] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [topicPerformance, setTopicPerformance] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Load assignment from backend using URL param
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) return;
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BACKEND_API}/api/assignments/${assignmentId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch assignment: ${res.status}`);
        }

        const body = await res.json();
        setAssignment(body.data || null);
      } catch (err) {
        console.error("Error loading assignment:", err);
        setError("Failed to load assignment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);
  // Once assignment is loaded, fetch all quiz sessions that belong to this assignment via its test_key
  useEffect(() => {
    const fetchSessionsForAssignment = async () => {
      if (!assignment || !assignment.test_key) return;

      try {
        const testKey = assignment.test_key;
        const url = `${BACKEND_API}/api/quiz-sessions?testKey=${encodeURIComponent(
          testKey
        )}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch quiz sessions for assignment", res.status);
          return;
        }

        const body = await res.json();
        const data = Array.isArray(body.data) ? body.data : [];
        setSessions(data);

        // Map sessions into student table rows with per-student insights
        const mappedStudents = data.map((session, idx) => {
          const email = session.email || "Unknown";
          const name = email.includes("@")
            ? email.split("@")[0]
            : `Student ${idx + 1}`;

          const payload = session.payload || {};
          const questionsSource = Array.isArray(payload.questions)
            ? payload.questions
            : Array.isArray(payload.analytics?.level?.questions)
            ? payload.analytics.level.questions
            : [];

          const questionsAnswered = Array.isArray(questionsSource)
            ? questionsSource.length
            : 0;

          let correctCount = 0;
          if (Array.isArray(questionsSource)) {
            correctCount = questionsSource.reduce((acc, q) => {
              const isCorrect =
                typeof q?.is_correct === "boolean"
                  ? q.is_correct
                  : q?.user_answer_index === q?.correct_option_index;
              return acc + (isCorrect ? 1 : 0);
            }, 0);
          }

          const computedPercent =
            questionsAnswered > 0
              ? (correctCount / questionsAnswered) * 100
              : 0;

          const scorePercent =
            typeof session.scorePercent === "number"
              ? Math.round(session.scorePercent)
              : Math.round(computedPercent);

          const status = session.passed ? "Passed" : "Completed";

          const strongTopics =
            session.analysis?.strong_topics ||
            session.analysis?.strongTopics ||
            [];
          const weakTopics =
            session.analysis?.weak_topics || session.analysis?.weakTopics || [];
          const behaviorInsights =
            session.analysis?.behavior_insights ||
            session.analysis?.behaviour_insights ||
            session.analysis?.behaviorInsights ||
            [];

          return {
            id: session._id || session.sessionId || idx,
            name,
            email,
            score: scorePercent,
            questionsAnswered,
            status,
            strongTopics,
            weakTopics,
            behaviorInsights,
          };
        });

        setStudentRows(mappedStudents);

        // Build performance data for chart
        setPerformanceData(
          mappedStudents.map((s) => ({
            name: s.name,
            score: s.score,
            questions: s.questionsAnswered,
          }))
        );

        // Build topic-level performance from analysis.topic_breakdown
        const topicAgg = {};
        data.forEach((session) => {
          const breakdown = session.analysis?.topic_breakdown;
          if (!Array.isArray(breakdown)) return;

          breakdown.forEach((tb) => {
            if (!tb || !tb.topic) return;
            const key = tb.topic;
            if (!topicAgg[key]) {
              topicAgg[key] = {
                topic: key,
                questionCount: 0,
                correctCount: 0,
                totalTime: 0,
              };
            }
            const bucket = topicAgg[key];
            const qCount = Number(tb.question_count || 0);
            const cCount = Number(tb.correct_count || 0);
            const avgTime = Number(tb.avg_time_seconds || 0);
            bucket.questionCount += Number.isFinite(qCount) ? qCount : 0;
            bucket.correctCount += Number.isFinite(cCount) ? cCount : 0;
            // totalTime approximated as avg_time * question_count
            if (qCount > 0 && Number.isFinite(avgTime)) {
              bucket.totalTime += avgTime * qCount;
            }
          });
        });

        const topicsArray = Object.values(topicAgg).map((t) => {
          const accuracyPercent =
            t.questionCount > 0
              ? (t.correctCount / t.questionCount) * 100
              : 0;
          const avgTimeSeconds =
            t.questionCount > 0 ? t.totalTime / t.questionCount : 0;

          let reliability = "Low";
          if (t.questionCount >= 15) reliability = "High";
          else if (t.questionCount >= 5) reliability = "Medium";

          return {
            topic: t.topic,
            accuracy: Number(accuracyPercent.toFixed(1)),
            reliability,
            questionCount: t.questionCount,
            avg_time_seconds: Number(avgTimeSeconds.toFixed(1)),
          };
        });

        setTopicPerformance(topicsArray);
      } catch (err) {
        console.error("Error fetching sessions for assignment:", err);
      }
    };

    fetchSessionsForAssignment();
  }, [assignment]);

  const assignmentName = assignment?.assignment_name || "Assignment Analysis";

  const hasRealStudents = studentRows.length > 0;
  const effectiveStudents = hasRealStudents
    ? studentRows
    : FALLBACK_DETAILED_STUDENT_DATA;

  const totalStudents = effectiveStudents.length;
  const avgScore = (
    effectiveStudents.reduce((sum, s) => sum + (s.score || 0), 0) /
    (totalStudents || 1)
  ).toFixed(1);
  const totalQuestions = effectiveStudents.reduce(
    (sum, s) => sum + (s.questionsAnswered || 0),
    0
  );

  // Derive topic-level view from assignment topics and/or aggregated topic performance
  const derivedTopicPerformance = topicPerformance.length
    ? topicPerformance
    : assignment?.topics?.length
    ? assignment.topics.map((t, index) => ({
        topic: t.title || t.name || `Topic ${index + 1}`,
        accuracy: 0,
        reliability: "Medium",
      }))
    : FALLBACK_TOPIC_PERFORMANCE;

  /* ---------------- Export All Data to Excel ---------------- */
  const handleExportAll = () => {
    const rows = (effectiveStudents && effectiveStudents.length
      ? effectiveStudents
      : FALLBACK_DETAILED_STUDENT_DATA
    ).map((student) => ({
      Name: student.name,
      Email: student.email,
      Score: student.score,
      "Questions Answered": student.questionsAnswered,
      Status: student.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Data");
    XLSX.writeFile(wb, `${assignmentName}_Analysis.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      <Navbar />

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-600">
          Loading assignment details...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-4 text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* ============= HEADER ============= */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-8 py-6">
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4 font-semibold transition-all hover:gap-3"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {assignmentName}
              </h1>
              <p className="text-slate-600">Detailed Assignment Analysis</p>
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:shadow-lg"
            >
              <Download size={20} /> Export All Data
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-8 py-8">
        {/* ============= STATS OVERVIEW ============= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Users size={28} />
              <div className="bg-white/20 rounded-lg p-2">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-sky-100 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold">{totalStudents}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Award size={28} />
              <div className="bg-white/20 rounded-lg p-2">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-green-100 text-sm mb-1">Average Score</p>
            <p className="text-4xl font-bold">{avgScore}%</p>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">{" "}
            <div className="flex items-center justify-between mb-2">
              <Target size={28} />
              <div className="bg-white/20 rounded-lg p-2">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-sky-100 text-sm mb-1">Questions Answered</p>
            <p className="text-4xl font-bold">{totalQuestions}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={28} />
              <div className="bg-white/20 rounded-lg p-2">
                <TrendingDown size={18} />
              </div>
            </div>
            <p className="text-orange-100 text-sm mb-1">Completion Rate</p>
            <p className="text-4xl font-bold">100%</p>
          </div>
        </div>

        {/* ============= VIEW TABS ============= */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedView("overview")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedView === "overview"
                ? "bg-brand-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setSelectedView("students")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedView === "students"
                ? "bg-brand-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Student Details
          </button>
          <button
            onClick={() => setSelectedView("topics")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedView === "topics"
                ? "bg-brand-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Topic Analysis
          </button>
        </div>

        {/* ============= PERFORMANCE OVERVIEW ============= */}
        {selectedView === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Student Performance Trends
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.length ? performanceData : effectiveStudents.map((s) => ({
                    name: s.name.split(" ")[0],
                    score: s.score,
                    questions: s.questionsAnswered,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0284c7"
                      strokeWidth={3}
                      dot={{ fill: "#0284c7", r: 6 }}
                      activeDot={{ r: 8 }}
                      name="Score"
                    />
                    <Line
                      type="monotone"
                      dataKey="questions"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ fill: "#0ea5e9", r: 6 }}
                      activeDot={{ r: 8 }}
                      name="Questions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ============= STUDENT DETAILS TABLE ============= */}
        {selectedView === "students" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Student</th>
                    <th className="px-6 py-4 text-left font-bold">Email</th>
                    <th className="px-6 py-4 text-center font-bold">Score</th>
                    <th className="px-6 py-4 text-center font-bold">
                      Questions
                    </th>
                    <th className="px-6 py-4 text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveStudents.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={`border-b hover:bg-sky-50 transition-all ${
                        idx % 2 === 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {student.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={16} />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-4 py-2 rounded-lg font-bold ${
                            student.score >= 80
                              ? "bg-green-100 text-green-700"
                              : student.score >= 60
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {student.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">
                        {student.questionsAnswered}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-4 py-2 rounded-lg font-bold bg-green-100 text-green-700">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============= TOPIC ANALYSIS ============= */}
        {selectedView === "topics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Topic-wise Performance
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derivedTopicPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="topic"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#94a3b8"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                        padding: "12px",
                      }}
                    />
                    <Bar
                      dataKey="accuracy"
                      fill="#0284c7"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {derivedTopicPerformance.map((topic, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-brand-600 hover:shadow-xl transition-all"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {topic.topic}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Accuracy</span>
                      <span className="font-bold text-brand-600">
                        {topic.accuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Reliability</span>
                      <span
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          topic.reliability === "High"
                            ? "bg-green-100 text-green-700"
                            : topic.reliability === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {topic.reliability}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 bg-slate-100 rounded-lg h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-full rounded-lg transition-all duration-500"
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignmentAnalysis;
