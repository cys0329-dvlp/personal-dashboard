// App.tsx - Main application entry
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState } from "react";
import { Router, Route } from "wouter";
import Layout, { TabType } from "./components/Layout";
import CalendarPage from "./pages/CalendarPage";
import FinancePage from "./pages/FinancePage";
import ProjectsPage from "./pages/ProjectsPage";
import LecturesPage from "./pages/LecturesPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster as SonnerToaster } from "sonner";

function DashboardApp() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <DashboardProvider username={user?.username || "User"}>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        username={user?.username || "User"} 
        onLogout={handleLogout}
      >
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'finance' && <FinancePage />}
        {activeTab === 'projects' && <ProjectsPage />}
        {activeTab === 'lectures' && <LecturesPage />}
      </Layout>
    </DashboardProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">LO</span>
          </div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">LO</span>
          </div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Route path="/login">
        {user ? (
          <DashboardApp />
        ) : (
          <LoginPage onLogin={(username, userId) => {
            // 로그인 성공 후 처리는 LoginPage에서 수행
          }} />
        )}
      </Route>
      <Route path="/signup">
        {user ? (
          <DashboardApp />
        ) : (
          <SignUpPage />
        )}
      </Route>
      <Route path="/calendar">
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      </Route>
      <Route path="/finance">
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      </Route>
      <Route path="/projects">
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      </Route>
      <Route path="/lectures">
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        {user ? (
          <DashboardApp />
        ) : (
          <LoginPage onLogin={(username, userId) => {
            // 로그인 성공 후 처리는 LoginPage에서 수행
          }} />
        )}
      </Route>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <SonnerToaster />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
