import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import UploadMeeting from "./pages/UploadMeeting";
import Tasks from "./pages/Tasks";
import MeetingSummary from "./pages/MeetingSummary";
import Meetings from "./pages/Meetings";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Pages that don't use the dashboard layout (public, no sidebar)
const PUBLIC_PATHS = ["/landing", "/signin", "/signup"];

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // Public pages — no sidebar/topbar
  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    );
  }

  // All app pages — require auth, show sidebar/topbar
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <TopBar sidebarCollapsed={sidebarCollapsed} />
        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "ml-[68px]" : "ml-64"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<UploadMeeting />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/meeting/:id" element={<MeetingSummary />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default App;
