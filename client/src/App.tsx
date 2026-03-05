// ============================================================
// App.tsx - Main application entry
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { useState, useEffect } from "react";
import Layout, { TabType } from "./components/Layout";
import CalendarPage from "./pages/CalendarPage";
import FinancePage from "./pages/FinancePage";
import CategoriesPage from "./pages/CategoriesPage";
import ProjectsPage from "./pages/ProjectsPage";
import LecturesPage from "./pages/LecturesPage";
import RecordingsPage from "./pages/RecordingsPage";
import LoginPage from "./pages/LoginPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { toast } from "sonner";

function DashboardApp() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // 로컬스토리지에서 로그인 상태 복원
  useEffect(() => {
    const savedUsername = localStorage.getItem('dashboardUsername');
    const savedPassword = localStorage.getItem('dashboardPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (inputUsername: string, inputPassword: string) => {
    // 간단한 로그인 검증 (실제로는 백엔드에서 검증해야 함)
    if (inputUsername.trim() && inputPassword.trim()) {
      localStorage.setItem('dashboardUsername', inputUsername);
      localStorage.setItem('dashboardPassword', inputPassword);
      setUsername(inputUsername);
      setIsLoggedIn(true);
      toast.success('로그인 성공!');
    } else {
      toast.error('아이디와 비밀번호가 일치하지 않습니다');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboardUsername');
    localStorage.removeItem('dashboardPassword');
    setUsername('');
    setIsLoggedIn(false);
    toast.success('로그아웃 되었습니다');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} username={username} onLogout={handleLogout}>
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'finance' && <FinancePage />}
      {activeTab === 'categories' && <CategoriesPage />}
      {activeTab === 'projects' && <ProjectsPage />}
      {activeTab === 'lectures' && <LecturesPage />}
      {activeTab === 'recordings' && <RecordingsPage />}
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <DashboardProvider>
            <Toaster />
            <DashboardApp />
          </DashboardProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
