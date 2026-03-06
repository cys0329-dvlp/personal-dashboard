// App.tsx - Main application entry
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { useState } from "react";
import Layout, { TabType } from "./components/Layout";
import CalendarPage from "./pages/CalendarPage";
import FinancePage from "./pages/FinancePage";
import ProjectsPage from "./pages/ProjectsPage";
import LecturesPage from "./pages/LecturesPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster as SonnerToaster } from "sonner";

function DashboardApp() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  return (
    <DashboardProvider username="User">
      <Layout activeTab={activeTab} onTabChange={setActiveTab} username="User" onLogout={() => {}}>
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
          <SonnerToaster />
          <DashboardApp />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
