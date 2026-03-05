// ============================================================
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
import RecordingsPage from "./pages/RecordingsPage";
import ErrorBoundary from "./components/ErrorBoundary";

function DashboardApp() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'finance' && <FinancePage />}
      {activeTab === 'projects' && <ProjectsPage />}
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
