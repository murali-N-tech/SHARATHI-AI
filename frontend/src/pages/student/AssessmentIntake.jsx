// frontend/src/pages/student/AssessmentIntake.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Essential for reading the link ID
import Navbar from "../../components/Navbar";
import { BACKEND_API } from "../../lib/apiConfig";

const AssessmentIntake = () => {
  const { domainId } = useParams(); // This is the public test key from the URL
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the specific assignment details using the public test key from the link
    const fetchAssignment = async () => {
      try {
        const res = await fetch(`${BACKEND_API}/api/assignments/topics/${domainId}`);
        const result = await res.json();

        if (res.ok && result.status === "success" && result.data) {
          const data = result.data;
          // Normalize into the shape expected by this component
          setAssignment({
            name: data.assignment_name || "Assignment",
            userPrompt: "Topic-based adaptive assignment assessment",
            questionLimit: 15,
            difficulty: 3,
            test_key: data.test_key,
            topics: data.topics || [],
          });
        } else {
          console.warn("[AssessmentIntake] Assignment not found for test key:", domainId, result);
          setAssignment(null);
        }
      } catch (err) {
        console.error("Failed to load assignment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [domainId]);

  if (loading) return <div className="p-10 text-center">Loading Assignment...</div>;
  if (!assignment) return <div className="p-10 text-center">Assignment not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto p-8 max-w-2xl">
        {!isStarted ? (
          // Preview / Landing View
          <div className="bg-white p-8 rounded-3xl shadow-xl border text-center">
            <h1 className="text-3xl font-bold mb-4">{assignment.name}</h1>
            <p className="text-slate-600 mb-8">{assignment.userPrompt}</p>
            <div className="flex justify-center gap-8 mb-8 text-sm font-bold text-slate-500">
              <span>Questions: {assignment.questionLimit}</span>
              <span>Difficulty: Level {assignment.difficulty}</span>
            </div>
            {/* The button that triggers the test loading */}
            <button 
              onClick={() => {
                // Navigate directly into the final assignment quiz using this test key
                navigate(`/assessment/final/${assignment.test_key}`);
              }} 
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all"
            >
              Start Assignment Now
            </button>
          </div>
        ) : (
          // This state is no longer used now that we navigate directly to FinalQuizPage,
          // but we keep a simple placeholder in case it's referenced elsewhere.
          <div className="bg-white p-8 rounded-3xl shadow-xl border text-center">
            <h2 className="text-xl font-bold mb-4">Redirecting to quiz...</h2>
            <p>Please wait while we load your assignment quiz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentIntake;