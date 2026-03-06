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
import ProjectsPage from "./pages/ProjectsPage";
import LecturesPage from "./pages/LecturesPage";
import LoginPage from "./pages/LoginPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { toast } from "sonner";
import { migrateDataFromLocalStorage } from "./lib/supabase";

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

  const handleLogin = async (inputUsername: string, userId: string) => {
    // Supabase 로그인 완료 후 호출됨
    localStorage.setItem('dashboardUsername', inputUsername);
    localStorage.setItem('dashboardUserId', userId);
    setUsername(inputUsername);
    
    // localStorage에서 Supabase로 데이터 마이그레이션
    try {
      await migrateDataFromLocalStorage(userId, inputUsername);
      toast.success('데이터 동기화 완료');
    } catch (error) {
      console.error('데이터 마이그레이션 실패:', error);
      toast.error('데이터 동기화 중 오류 발생');
    }
    
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboardUsername');
    localStorage.removeItem('dashboardUserId');
    setUsername('');
    setIsLoggedIn(false);
    toast.success('로그아웃 되었습니다');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={(username, userId) => handleLogin(username, userId)} />;
  }

  return (
    <DashboardProvider username={username}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab} username={username} onLogout={handleLogout}>
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'finance' && <FinancePage />}
        {activeTab === 'projects' && <ProjectsPage />}
        {activeTab === 'lectures' && <LecturesPage />}
      </Layout>
    </DashboardProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <DashboardApp />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
