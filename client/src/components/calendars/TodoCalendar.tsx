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

  // 특정 날짜에 표시될 기간 할 일 찾기
  const getRangedTasksForDay = (day: number) => {
    const date = dateStr(day);
    const monthStart = dateStr(1);
    const monthEnd = dateStr(daysInMonth);

    return rangedTasks.filter(task => {
      return task.startDate <= date && task.endDate >= date;
    });
  };

  // 기간 할 일이 이 날짜에서 시작하는지 확인
  const isRangedTaskStart = (task: any, day: number) => {
    return task.startDate === dateStr(day);
  };

  // 기간 할 일의 너비 계산 (칸 수)
  const getRangedTaskWidth = (task: any, day: number) => {
    const monthStart = dateStr(1);
    const monthEnd = dateStr(daysInMonth);
    
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    
    // 이 날짜가 기간 할 일의 시작인 경우
    if (isRangedTaskStart(task, day)) {
      const actualEnd = taskEnd > monthEnd ? monthEnd : taskEnd;
      return getDaysBetween(dateStr(day), actualEnd);
    }
    
    return 0;
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
    cells.push(<div key={`empty-${i}`} className="bg-gray-50 p-2 min-h-32"></div>);
  }
  // 현재 달 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dateStr(day);
    const isToday = date === todayStr;
    const dayTasks = singleDateTasks[date] || [];
    const rangedTasksForDay = getRangedTasksForDay(day);
    const completedCount = dayTasks.filter(t => t.completed).length;

    cells.push(
      <div
        key={day}
        onClick={() => setSelectedDate(date)}
        className={cn(
          'p-2 border rounded cursor-pointer transition-all min-h-32 relative',
          isToday ? 'bg-green-100 border-green-400 font-semibold' : 'bg-white border-gray-200 hover:bg-gray-50',
          selectedDate === date ? 'ring-2 ring-emerald-500' : ''
        )}
      >
        <div className="text-sm font-semibold text-gray-700 mb-1">{day}</div>
        
        {/* 기간 할 일 표시 */}
        <div className="space-y-1 mb-2">
          {rangedTasksForDay.map((task, idx) => {
            if (isRangedTaskStart(task, day)) {
              const width = getRangedTaskWidth(task, day);
              return (
                <div
                  key={`ranged-${idx}`}
                  className="text-xs px-2 py-1 rounded bg-pink-200 text-pink-800 truncate"
                  title={task.title}
                  style={{ gridColumn: `span ${Math.min(width, 7)}` }}
                >
                  {task.title}
                </div>
              );
            }
            return null;
          })}
        </div>
        
        {/* 단일 날짜 할 일 표시 */}
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
    <div className="p-4">
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {cells}
      </div>

      {/* Add task form */}
      {showAddForm && (
        <div className="bg-white border rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">할 일 추가</h3>
          <input
            type="text"
            placeholder="할 일 제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="flex-1 bg-emerald-600 text-white rounded px-3 py-2 hover:bg-emerald-700"
            >
              추가
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 rounded px-3 py-2 hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="flex items-center gap-2 bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700"
      >
        <Plus className="w-5 h-5" />
        할 일 추가
      </button>
    </div>
  );
}
