// ============================================================
// Todo Calendar - 할 일 캘린더
// 프로젝트 할 일 + 임의 추가 할 일 표시
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
    priority: 'medium' as const,
  });

  const todayStr = today();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // 날짜별 할 일
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

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

  const dateStr = (day: number) => {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleAddTask = () => {
    if (!formData.title || !selectedDate) {
      alert('제목과 날짜를 선택해주세요');
      return;
    }

    addTask({
      title: formData.title,
      dueDate: selectedDate,
      priority: formData.priority,
      completed: false,
      projectId: undefined,
    });

    setFormData({ title: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const cells = [];
  // 이전 달 빈 칸
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-gray-50 p-2"></div>);
  }
  // 현재 달 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dateStr(day);
    const isToday = date === todayStr;
    const dayTasks = tasksByDate[date] || [];
    const completedCount = dayTasks.filter(t => t.completed).length;

    cells.push(
      <div
        key={day}
        onClick={() => setSelectedDate(date)}
        className={cn(
          'p-2 border rounded cursor-pointer transition-all min-h-24',
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
                  className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(task.priority || 'medium')}`}
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
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
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
          {tasksByDate[selectedDate]?.length === 0 ? (
            <p className="text-gray-500 text-sm">이 날짜에 할 일이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {tasksByDate[selectedDate]?.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 p-2 bg-white rounded border-l-4 ${getPriorityColor(task.priority || 'medium')}`}
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
