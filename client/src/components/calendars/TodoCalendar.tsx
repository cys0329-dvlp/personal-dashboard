// Todo Calendar - 할 일 캘린더
// 프로젝트 할 일 + 임의 추가 할 일 표시
// 기간 기반 할 일은 캘린더 그리드 내에 가로 바로 표시
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
    const ranged: any[] = [];
    const single: Record<string, typeof tasks> = {};

    tasks.forEach(t => {
      if (t.dueDate) {
        // detail에서 기간 정보 추출 (예: "2026-03-10부터 2026-03-12까지")
        const match = t.detail?.match(/(\d{4}-\d{2}-\d{2})부터\s+(\d{4}-\d{2}-\d{2})까지/);
        if (match) {
          const startDate = match[1];
          const endDate = match[2];
          if (startDate !== endDate) {
            ranged.push({ ...t, startDate, endDate });
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
      const taskStart = task.startDate;
      const taskEnd = task.endDate;
      // 현재 월과 겹치는 기간만 표시
      return taskStart <= monthEnd && taskEnd >= monthStart;
    });
  }, [rangedTasks, viewYear, viewMonth, daysInMonth]);

  // 기간 할 일의 시작 위치 계산 (0-6, 요일 기준)
  const getTaskStartCol = (startDate: string) => {
    const taskDate = new Date(startDate);
    const monthStart = new Date(dateStr(1));
    
    // 월의 첫 날이 어느 요일인지 확인
    const firstDayOfWeek = firstDay;
    
    // 기간 할 일의 시작일이 이번 달인지 확인
    if (startDate < dateStr(1)) {
      // 지난 달에서 시작하는 경우, 월의 첫 날부터 시작
      return 0;
    }
    
    const dayOfMonth = parseInt(startDate.split('-')[2]);
    return (firstDayOfWeek + dayOfMonth - 1) % 7;
  };

  // 기간 할 일의 너비 계산 (칸 수)
  const getTaskWidth = (startDate: string, endDate: string) => {
    const monthStart = dateStr(1);
    const monthEnd = dateStr(daysInMonth);
    
    // 현재 월 범위 내에서의 시작일과 종료일
    const actualStart = startDate < monthStart ? monthStart : startDate;
    const actualEnd = endDate > monthEnd ? monthEnd : endDate;
    
    return getDaysBetween(actualStart, actualEnd);
  };

  // 기간 할 일이 어느 행에 표시될지 결정
  const getTaskRow = (taskIndex: number) => {
    return Math.floor(taskIndex / 2); // 한 행에 최대 2개 기간 할 일
  };

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

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with ranged tasks */}
      <div className="space-y-2">
        {/* Ranged tasks rows */}
        {visibleRangedTasks.length > 0 && (
          <div className="space-y-1">
            {visibleRangedTasks.map((task, idx) => {
              const startCol = getTaskStartCol(task.startDate);
              const width = getTaskWidth(task.startDate, task.endDate);
              
              return (
                <div
                  key={`ranged-${idx}`}
                  className="grid grid-cols-7 gap-1 h-8"
                >
                  {/* 시작 전 빈 칸 */}
                  {Array.from({ length: startCol }).map((_, i) => (
                    <div key={`spacer-${i}`}></div>
                  ))}
                  
                  {/* 기간 바 */}
                  <div
                    className={cn(
                      'col-span-1 rounded px-2 py-1 text-xs font-semibold text-white truncate flex items-center',
                      task.completed ? 'bg-gray-400 opacity-60' : 'bg-pink-300 hover:bg-pink-400'
                    )}
                    style={{
                      gridColumn: `span ${Math.min(width, 7 - startCol)}`,
                    }}
                    title={`${task.title} (${task.startDate} ~ ${task.endDate})`}
                  >
                    {task.completed ? '✓' : '○'} {task.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {cells}
        </div>
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
