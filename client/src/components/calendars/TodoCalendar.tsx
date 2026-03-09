// Todo Calendar - 할 일 캘린더
// 프로젝트 할 일 + 임의 추가 할 일 표시
// 기간 기반 할 일은 가로 바로 표시
// ============================================================

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { getDaysInMonth, getFirstDayOfMonth, DAY_NAMES, MONTH_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function TodoCalendar() {
  const { tasks, addTask, toggleTask, deleteTask } = useDashboard();
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
  });

  const todayStr = today();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // 날짜 생성 헬퍼
  const dateStr = (day: number) => {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 두 날짜 사이의 일수 계산
  const getDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // 할 일을 기간 기반과 단일 날짜 기반으로 분류
  const { rangedTasks, singleDateTasks } = useMemo(() => {
    const ranged: typeof tasks = [];
    const single: Record<string, typeof tasks> = {};

    tasks.forEach(t => {
      if (t.dueDate) {
        // detail에서 기간 정보 추출 (예: "2026-03-10부터 2026-03-12까지")
        const match = t.detail?.match(/(\d{4}-\d{2}-\d{2})부터\s+(\d{4}-\d{2}-\d{2})까지/);
        if (match) {
          const startDate = match[1];
          const endDate = match[2];
          if (startDate !== endDate) {
            ranged.push({ ...t, startDate, endDate } as any);
          } else {
            if (!single[t.dueDate]) single[t.dueDate] = [];
            single[t.dueDate].push(t);
          }
        } else {
          if (!single[t.dueDate]) single[t.dueDate] = [];
          single[t.dueDate].push(t);
        }
      }
    });

    return { rangedTasks: ranged, singleDateTasks: single };
  }, [tasks]);

  // 현재 월에 표시될 기간 할 일 필터링
  const visibleRangedTasks = useMemo(() => {
    const monthStart = dateStr(1);
    const monthEnd = dateStr(daysInMonth);

    return rangedTasks.filter(task => {
      const taskStart = (task as any).startDate;
      const taskEnd = (task as any).endDate;
      // 현재 월과 겹치는 기간만 표시
      return taskStart <= monthEnd && taskEnd >= monthStart;
    });
  }, [rangedTasks, viewYear, viewMonth, daysInMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleAddTask = () => {
    if (!formData.title) {
      alert('할 일 제목을 입력해주세요');
      return;
    }

    const startDate = formData.startDate || selectedDate;
    if (!startDate) {
      alert('시작일을 선택해주세요');
      return;
    }

    // 기간이 지정된 경우 종료일, 미지정 시 시작일만 사용
    const endDate = formData.endDate || startDate;

    addTask({
      title: formData.title,
      dueDate: startDate,
      dueTime: undefined,
      completed: false,
      projectId: undefined,
      detail: `${startDate}부터 ${endDate}까지`,
    });

    setFormData({ title: '', startDate: '', endDate: '' });
    setShowAddForm(false);
  };

  // 기간 할 일의 시작 위치와 너비 계산
  const getTaskPosition = (startDate: string) => {
    const monthStart = dateStr(1);
    const taskDate = new Date(startDate);
    const monthStartDate = new Date(monthStart);
    const diffDays = Math.floor((taskDate.getTime() - monthStartDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskWidth = (startDate: string, endDate: string) => {
    return getDaysBetween(startDate, endDate);
  };

  // 캘린더 셀 생성
  const cells = [];
  // 이전 달 빈 칸
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-gray-50 p-2 min-h-24"></div>);
  }
  // 현재 달 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dateStr(day);
    const isToday = date === todayStr;
    const dayTasks = singleDateTasks[date] || [];
    const completedCount = dayTasks.filter(t => t.completed).length;

    cells.push(
      <div
        key={day}
        onClick={() => setSelectedDate(date)}
        className={cn(
          'p-2 border rounded cursor-pointer transition-all min-h-24 relative',
          isToday ? 'bg-green-100 border-green-400 font-semibold' : 'bg-white border-gray-200 hover:bg-gray-50',
          selectedDate === date ? 'ring-2 ring-emerald-500' : ''
        )}
      >
        <div className="text-sm font-semibold text-gray-700 mb-1">{day}</div>
        
        {dayTasks.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              {completedCount}/{dayTasks.length} 완료
            </div>
            <div className="flex flex-wrap gap-1">
              {dayTasks.slice(0, 2).map((task, idx) => (
                <div
                  key={idx}
                  className="text-xs px-1 py-0.5 rounded truncate bg-emerald-100 text-emerald-700"
                  title={task.title}
                >
                  {task.completed ? '✓' : '○'} {task.title}
                </div>
              ))}
              {dayTasks.length > 2 && (
                <div className="text-xs text-gray-500">+{dayTasks.length - 2}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-6 h-6 text-emerald-700" />
        </button>
        <h2 className="text-2xl font-bold text-emerald-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
          <ChevronRight className="w-6 h-6 text-emerald-700" />
        </button>
      </div>

      {/* 기간 할 일 바 표시 */}
      {visibleRangedTasks.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">기간 할 일</h3>
          <div className="space-y-2">
            {visibleRangedTasks.map((task, idx) => {
              const startDate = (task as any).startDate;
              const endDate = (task as any).endDate;
              const startPos = getTaskPosition(startDate);
              const width = getTaskWidth(startDate, endDate);
              
              return (
                <div key={idx} className="relative h-8 bg-white rounded border border-blue-200">
                  {/* 7열 그리드 배경 */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-100 last:border-r-0"></div>
                    ))}
                  </div>
                  
                  {/* 기간 바 */}
                  <div
                    className={cn(
                      'absolute top-0 bottom-0 rounded flex items-center px-2 text-white text-xs font-semibold truncate transition-all',
                      task.completed ? 'bg-gray-400 opacity-60' : 'bg-blue-500 hover:bg-blue-600'
                    )}
                    style={{
                      left: `${(startPos / 7) * 100}%`,
                      width: `${(width / 7) * 100}%`,
                      minWidth: '50px',
                    }}
                    title={`${task.title} (${startDate} ~ ${endDate})`}
                  >
                    {task.completed ? '✓' : '○'} {task.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {cells}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-emerald-900">
              {selectedDate} 할 일
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white p-3 rounded border border-emerald-200 mb-3 space-y-2">
              <input
                type="text"
                placeholder="할 일 입력"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">시작일</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">종료일</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          {(singleDateTasks[selectedDate]?.length === 0) ? (
            <p className="text-gray-500 text-sm">이 날짜에 할 일이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {singleDateTasks[selectedDate]?.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 bg-white rounded border-l-4 border-emerald-400"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.title}
                    </div>
                    {task.detail && (
                      <div className="text-xs text-gray-500">{task.detail}</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
