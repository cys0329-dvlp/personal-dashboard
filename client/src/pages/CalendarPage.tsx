// ============================================================
// Calendar Page - 3개 캘린더 (가계부, 일정, 할 일)
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import { useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import FinanceCalendar from '@/components/calendars/FinanceCalendar';
import ScheduleCalendar from '@/components/calendars/ScheduleCalendar';
import TodoCalendar from '@/components/calendars/TodoCalendar';

type CalendarType = 'finance' | 'schedule' | 'todo';

export default function CalendarPage() {
  const [activeCalendar, setActiveCalendar] = useState<CalendarType>('finance');

  const calendarTabs = [
    { id: 'finance', label: '💰 가계부 캘린더', color: 'from-amber-500 to-orange-500' },
    { id: 'schedule', label: '📅 일정 캘린더', color: 'from-blue-500 to-cyan-500' },
    { id: 'todo', label: '✓ 할 일 캘린더', color: 'from-emerald-500 to-green-500' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">📆 캘린더</h1>
          <p className="text-amber-700">3가지 캘린더로 일정을 관리하세요</p>
        </div>

        {/* Calendar Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {calendarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCalendar(tab.id)}
              className={`p-4 rounded-lg font-semibold transition-all ${
                activeCalendar === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-white text-amber-900 shadow hover:shadow-md'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calendar Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeCalendar === 'finance' && <FinanceCalendar />}
          {activeCalendar === 'schedule' && <ScheduleCalendar />}
          {activeCalendar === 'todo' && <TodoCalendar />}
        </div>
      </div>
    </div>
  );
}
