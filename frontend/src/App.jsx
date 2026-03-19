import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { GameProvider } from "./components/GameContext";

/* ---------- Public Pages ---------- */
import Index from "./pages/Index";
import ProgramSelect from "./pages/ProgramSelect";
import GuestAssessment from "./pages/PreAssessment/GuestAssessment";
import Signup from "./pages/auth/Signup";
import SignIn from "./pages/auth/Login";
import CodingPage from "./pages/CodingPage";
import QuizPage from "./pages/QuizPage";
import QuizModalsDemo from "./pages/QuizModalsDemo";
import QuizInsightsSimple from "./components/QuizInsightsSimple";

/* ---------- Student Pages ---------- */
import StudentLayout from "./components/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import LearningPath from "./pages/student/LearningPath";
import Workspace from "./pages/student/Workspace";
import Leaderboard from "./pages/student/Leaderboard";
import Certificates from "./pages/student/Certificates";
import StudentSettings from "./pages/student/Settings";
import StudentHome from "./pages/student/Home";
import DomainSubjects from "./pages/student/DomainSubjects";
import CustomDomainBuilder from "./pages/student/CustomDomainBuilder_2";
import CustomDomainDetails from "./pages/student/CustomDomainDetails";
import AssessmentIntake from "./pages/student/AssessmentIntake";
import FinalQuizPage from "./pages/FinalQuizPage";

/* ---------- Teacher Pages ---------- */
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AssignmentPerformance from "./pages/teacher/AssignmentPerformance";
import AssignmentAnalysis from "./pages/teacher/AssignmentAnalysis";

/* ---------- 404 ---------- */
const NotFound = () => (
  <div className="h-screen flex items-center justify-center text-2xl font-bold text-slate-700">
    404: Page Not Found
  </div>
);

function App() {
  return (
    <GameProvider>
      <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
        <Navbar />

        <div className="pt-20">
          <Routes>

              {/* ---------- Public Routes ---------- */}
              <Route path="/" element={<Index />} />
              <Route path="/program-select/:domainId" element={<ProgramSelect />} />
              <Route path="/assessment/:programId" element={<GuestAssessment />} />
              <Route path="/coding" element={<CodingPage />} />

              <Route path="/quiz/:domainId/:programId/:level" element={<QuizPage />} />
              <Route path="/quiz/:domainId/:programId" element={<QuizPage />} />
              <Route path="/quiz" element={<QuizPage />} />

              <Route path="/quiz-insights/:sessionId" element={<QuizInsightsSimple />} />
              <Route path="/quiz-insights" element={<QuizInsightsSimple />} />
              <Route path="/quiz-modals-demo" element={<QuizModalsDemo />} />

              <Route path="/auth/login" element={<SignIn />} />
              <Route path="/auth/signup" element={<Signup />} />

              {/* ---------- Assignment Intake (Dynamic) ---------- */}
              <Route path="/assessment/take/:domainId" element={<AssessmentIntake />} />
              <Route path="/assessment/final/:id" element={<FinalQuizPage />} />

              {/* ---------- Teacher Routes ---------- */}
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/assignment-analysis/:assignmentId" element={<AssignmentAnalysis />} />
              <Route
                path="/teacher/performance/:domainId"
                element={<AssignmentPerformance />}
              />

              {/* ---------- Student Routes (With Layout) ---------- */}
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="home" element={<StudentHome />} />
                <Route path="roadmap/:domainId/:slug" element={<LearningPath />} />
                <Route path="workspace" element={<Workspace />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route path="custom-domain" element={<CustomDomainBuilder />} />
                <Route path="custom-domain/:domainId" element={<CustomDomainDetails />} />
                <Route path="domains/:domainId" element={<DomainSubjects />} />
                <Route path="compiler" element={<CodingPage />} />
              </Route>

              {/* ---------- Fallback ---------- */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </div>
        </div>
      </GameProvider>
  );
}

export default App;
