import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Jobs from "../pages/Jobs";
import JobDetails from "../pages/JobDetails";
import SavedJobs from "../pages/SavedJobs";
import EmployerDashboard from "../pages/EmployerDashboard";
import AddJob from "../pages/AddJob";
import EditJob from "../pages/EditJob";
import AiDashboard from "../pages/AIDashboard";
import Applicants from "../pages/Applicants";
import Swipe from "../pages/Swipe";
import Games from "../pages/Games"; // NEW
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute role="seeker">
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route path="/swipe" element={<ProtectedRoute role="seeker"><Swipe /></ProtectedRoute>} />
      <Route path="/games" element={<ProtectedRoute role="seeker"><Games /></ProtectedRoute>} /> {/* NEW */}
      <Route
        path="/ai-dashboard"
        element={
          <ProtectedRoute role="seeker">
            <AiDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicants/:jobId"
        element={
          <ProtectedRoute role="employer">
            <Applicants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="employer">
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-job"
        element={
          <ProtectedRoute role="employer">
            <AddJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-job/:id"
        element={
          <ProtectedRoute role="employer">
            <EditJob />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;