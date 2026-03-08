// ============================================================
// Schedule Calendar - 주간 시간표 (카테고리 색상 기능 포함)
// 강의, 알바 등 시간 정보를 시간표 형식으로 표시
// 모바일 최적화 완료
// ============================================================

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Repeat2, Palette } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { DAY_NAMES, MONTH_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

type FormMode = 'single' | 'repeat';

export default function ScheduleCalendar() {
  const { schedules, addSchedule, deleteSchedule, scheduleCategories } = useDashboard();
  const [viewDate, setViewDate] = useState(today());
  const [showAddForm, setShowAddForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('single');
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'lecture' as const,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
  });
  const [repeatData, setRepeatData] = useState({
    startDate: today(),
    endDate: today(),
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri by default
  });

  // Get category color
  const getCategoryColor = (categoryId?: string) => {
    if (categoryId && scheduleCategories[categoryId]) {
      return scheduleCategories[categoryId].color;
    }
    // Fallback to type-based color
    const typeColors: Record<string, string> = {
      lecture: '#3b82f6',
      work: '#ef4444',
      event: '#8b5cf6',
    };
    return typeColors[formData.type] || '#6b7280';
  };

  // ---- 날짜 계산 함수 ----
  const getWeekDates = (dateStr: string): string[] => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(viewDate), [viewDate]);

  // ---- 일정 필터링 ----
  const weekSchedules = useMemo(() => {
    return schedules
      .filter(s => weekDates.includes(s.date))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [schedules, weekDates]);

  // ---- 네비게이션 ----
  const prevWeek = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 7);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 7);
    setViewDate(d.toISOString().split('T')[0]);
  };

  // ---- 반복 일정 생성 ----
  const generateRepeatSchedules = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    const start = new Date(repeatData.startDate);
    const end = new Date(repeatData.endDate);
    const categoryColor = getCategoryColor(selectedCategoryId);

    const schedulesToAdd = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (repeatData.daysOfWeek.includes(dayOfWeek)) {
        const dateStr = d.toISOString().split('T')[0];
        schedulesToAdd.push({
          date: dateStr,
          title: formData.title,
          type: formData.type,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          description: formData.description,
          color: categoryColor,
          category: selectedCategoryId,
        });
      }
    }

    schedulesToAdd.forEach(s => addSchedule(s));
    alert(`${schedulesToAdd.length}개의 일정이 추가되었습니다.`);
    resetForm();
  };

  // ---- 단일 일정 추가 ----
  const handleAddSchedule = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    const categoryColor = getCategoryColor(selectedCategoryId);

    addSchedule({
      ...formData,
      date: selectedDateForAdd || viewDate,
      color: categoryColor,
      category: selectedCategoryId,
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'lecture',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
    });
    setRepeatData({
      startDate: today(),
      endDate: today(),
      daysOfWeek: [1, 2, 3, 4, 5],
    });
    setSelectedCategoryId('');
    setShowAddForm(false);
    setSelectedDateForAdd(null);
    setFormMode('single');
  };

  // ---- 위치/높이 계산 ----
  const getSchedulePosition = (startTime: string) => {
    const [hours, mins] = startTime.split(':').map(Number);
    return (hours + mins / 60) * 60;
  };

  const getScheduleHeight = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    return Math.max(duration * 60, 30);
  };

  // ---- 주간 뷰 헤더 ----
  const getWeekHeader = () => {
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
  };

  // Get category list for current type
  const categoriesForType = useMemo(() => {
    return Object.values(scheduleCategories).filter(
      cat => !cat.type || cat.type === formData.type
    );
  }, [scheduleCategories, formData.type]);

  return (
    <div className="w-full">
      {/* ---- 헤더 ---- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* 네비게이션 */}
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
          </button>

          <div className="text-center flex-1 md:flex-none min-w-48">
            <h2 className="text-lg md:text-2xl font-bold text-blue-900">주간 일정</h2>
            <p className="text-xs md:text-sm text-blue-700">{getWeekHeader()}</p>
          </div>

          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
          </button>
        </div>

        {/* 오늘/추가 버튼 */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewDate(today())}
            className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm md:text-base"
          >
            오늘
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">일정 추가</span>
            <span className="md:hidden">추가</span>
          </button>
        </div>
      </div>

      {/* ---- 일정 추가 폼 ---- */}
      {showAddForm && (
        <div className="bg-blue-50 p-3 md:p-4 rounded-lg mb-4 border border-blue-200 overflow-y-auto max-h-96 md:max-h-none">
          {/* 모드 선택 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFormMode('single')}
              className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-all ${
                formMode === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-700 border border-blue-300'
              }`}
            >
              한 번만
            </button>
            <button
              onClick={() => setFormMode('repeat')}
              className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                formMode === 'repeat'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-700 border border-blue-300'
              }`}
            >
              <Repeat2 className="w-4 h-4" />
              반복
            </button>
          </div>

          <div className="space-y-3">
            {/* 기본 정보 */}
            <input
              type="text"
              placeholder="일정 제목 (예: 데이터베이스 강의)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
            />

            <select
              value={formData.type}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value as any });
                setSelectedCategoryId(''); // Reset category when type changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
            >
              <option value="lecture">강의</option>
              <option value="work">알바/일</option>
              <option value="event">이벤트</option>
            </select>

            {/* 카테고리 색상 선택 */}
            {categoriesForType.length > 0 && (
              <div className="bg-white p-3 rounded border border-gray-300">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  카테고리 색상
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {categoriesForType.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`p-3 rounded border-2 transition-all ${
                        selectedCategoryId === category.id
                          ? 'border-gray-800 ring-2 ring-offset-1'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{
                        backgroundColor: category.color,
                        opacity: selectedCategoryId === category.id ? 1 : 0.7,
                      }}
                      title={category.name}
                    >
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {category.name.substring(0, 2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="장소 (선택)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
            />

            {/* 단일 모드: 날짜 선택 */}
            {formMode === 'single' && (
              <select
                value={selectedDateForAdd || viewDate}
                onChange={(e) => setSelectedDateForAdd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
              >
                {weekDates.map(date => {
                  const d = new Date(date);
                  return (
                    <option key={date} value={date}>
                      {DAY_NAMES[d.getDay()]} {d.getMonth() + 1}월 {d.getDate()}일
                    </option>
                  );
                })}
              </select>
            )}

            {/* 반복 모드: 기간 및 요일 선택 */}
            {formMode === 'repeat' && (
              <>
                <div className="bg-white p-3 rounded border border-gray-300">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={repeatData.startDate}
                    onChange={(e) =>
                      setRepeatData({ ...repeatData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="bg-white p-3 rounded border border-gray-300">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={repeatData.endDate}
                    onChange={(e) =>
                      setRepeatData({ ...repeatData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="bg-white p-3 rounded border border-gray-300">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    반복할 요일
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { day: 0, label: '일' },
                      { day: 1, label: '월' },
                      { day: 2, label: '화' },
                      { day: 3, label: '수' },
                      { day: 4, label: '목' },
                      { day: 5, label: '금' },
                      { day: 6, label: '토' },
                    ].map(({ day, label }) => (
                      <button
                        key={day}
                        onClick={() => {
                          setRepeatData(prev => ({
                            ...prev,
                            daysOfWeek: prev.daysOfWeek.includes(day)
                              ? prev.daysOfWeek.filter(d => d !== day)
                              : [...prev.daysOfWeek, day],
                          }));
                        }}
                        className={`py-2 rounded text-sm font-semibold transition-all ${
                          repeatData.daysOfWeek.includes(day)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={
                  formMode === 'single' ? handleAddSchedule : generateRepeatSchedules
                }
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm md:text-base"
              >
                {formMode === 'single' ? '저장' : '반복 생성'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-semibold text-sm md:text-base"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- 주간 시간표 ---- */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <div className="min-w-full inline-block">
          {/* 주간 헤더 */}
          <div className="flex border-b border-gray-200">
            <div className="w-12 md:w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div>
            {weekDates.map((date, idx) => {
              const d = new Date(date);
              const isToday = date === today();
              return (
                <div
                  key={date}
                  className={cn(
                    'flex-1 min-w-24 md:min-w-32 text-center py-2 md:py-3 border-r border-gray-200 font-semibold text-xs md:text-base',
                    isToday ? 'bg-blue-100 text-blue-900' : 'bg-gray-50 text-gray-700'
                  )}
                >
                  <div className="text-xs md:text-sm">{DAY_NAMES[d.getDay()]}</div>
                  <div className="text-sm md:text-lg">{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* 시간대별 행 */}
          {HOURS.map(hour => (
            <div key={hour} className="flex border-t border-gray-200" style={{ height: '50px' }}>
              <div className="w-12 md:w-16 flex-shrink-0 text-xs font-semibold text-gray-500 p-1 md:p-2 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                {String(hour).padStart(2, '0')}
              </div>

              {/* 각 요일 */}
              {weekDates.map(date => (
                <div
                  key={date}
                  className="flex-1 min-w-24 md:min-w-32 relative border-r border-gray-200"
                  onClick={() => {
                    setSelectedDateForAdd(date);
                    setShowAddForm(true);
                    setFormMode('single');
                  }}
                >
                  {/* 이 시간대의 일정들 */}
                  {weekSchedules
                    .filter(
                      s =>
                        s.date === date &&
                        s.startTime.startsWith(String(hour).padStart(2, '0'))
                    )
                    .map(schedule => (
                      <div
                        key={schedule.id}
                        className="absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded p-0.5 md:p-1 text-white text-xs font-semibold cursor-pointer hover:opacity-80 group overflow-hidden"
                        style={{
                          backgroundColor: schedule.color || '#6b7280',
                          top: `${getSchedulePosition(schedule.startTime) % 60}px`,
                          height: `${getScheduleHeight(schedule.startTime, schedule.endTime)}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="truncate text-xs">{schedule.title}</div>
                        <div className="text-xs opacity-90 hidden md:block">
                          {schedule.startTime}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSchedule(schedule.id);
                          }}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---- 주간 일정 요약 ---- */}
      {weekSchedules.length > 0 && (
        <div className="mt-4 md:mt-6 bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm md:text-base">주간 일정 요약</h3>
          <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-none overflow-y-auto md:overflow-y-visible">
            {weekDates.map(date => {
              const daySchedules = weekSchedules.filter(s => s.date === date);
              if (daySchedules.length === 0) return null;

              const d = new Date(date);
              return (
                <div key={date} className="bg-white p-2 md:p-3 rounded border-l-4 border-blue-400">
                  <div className="font-semibold text-gray-800 mb-1 md:mb-2 text-xs md:text-sm">
                    {DAY_NAMES[d.getDay()]} {d.getMonth() + 1}월 {d.getDate()}일
                  </div>
                  <div className="space-y-1">
                    {daySchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="text-xs md:text-sm text-gray-700 flex justify-between items-center gap-2"
                      >
                        <span className="flex-1 min-w-0">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: schedule.color || '#6b7280' }}
                          ></span>
                          <span className="truncate">
                            {schedule.startTime}-{schedule.endTime} {schedule.title}
                          </span>
                        </span>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
