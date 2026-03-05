// ============================================================
// Layout Component - Sidebar + Main Content
// Design: 웜 어스톤 생산성 대시보드
// Sidebar: Deep brown background, amber active state
// ============================================================

import { useState } from 'react';
import { CalendarDays, Wallet, FolderKanban, Mic, Menu, X, BookOpen, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'calendar' | 'finance' | 'projects' | 'lectures';

interface LayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
  username?: string;
  onLogout?: () => void;
}

const navItems = [
  { id: 'calendar' as TabType, label: '캘린더', icon: CalendarDays },
  { id: 'finance' as TabType, label: '가계부', icon: Wallet },
  { id: 'projects' as TabType, label: '프로젝트', icon: FolderKanban },
  { id: 'lectures' as TabType, label: '강의 관리', icon: BookOpen },
];

export default function Layout({ activeTab, onTabChange, children, username, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ 
          background: 'oklch(0.22 0.04 50)',
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663405978811/Uuc98AdMPub5tEMfmpprzc/dashboard-sidebar-bg-UzAgr68SQP6U4bqjTAZrXj.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'oklch(0.55 0.15 55)' }}
          >
            MY
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">My Dashboard</div>
            <div className="text-white/40 text-xs">개인 생산성 플래너</div>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <div className="text-white/30 text-xs font-semibold px-3 mb-3 uppercase tracking-wider">메뉴</div>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onTabChange(id); setSidebarOpen(false); }}
              className={cn(
                "nav-item w-full text-left",
                activeTab === id && "active"
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        {username && (
          <div className="px-5 py-4 border-t border-white/10 space-y-3">
            <div>
              <p className="text-white/50 text-xs">로그인됨</p>
              <p className="text-white font-semibold text-sm mt-1">{username}</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            )}
          </div>
        )}

        {/* Bottom info */}
        <div className={cn("px-5 py-4 border-t border-white/10", username && "hidden")}>
          <div className="text-white/30 text-xs text-center">
            {new Date().getFullYear()}년 개인 대시보드
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b border-border/60 bg-card/80 backdrop-blur-sm"
          style={{ boxShadow: '0 1px 4px oklch(0.55 0.15 55 / 0.08)' }}
        >
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl" style={{ color: 'oklch(0.22 0.04 50)' }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
