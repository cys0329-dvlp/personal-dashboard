// ============================================================
// Schedule Calendar - 일정 시간표 캘린더 (일간/주간 뷰)
// 강의, 알바 등 시간 정보를 시간표 형식으로 표시
// ============================================================

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { DAY_NAMES, MONTH_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SCHEDULE_COLORS = {
  lecture: '#3b82f6',
  work: '#ef4444',
  event: '#8b5cf6',
};

type ViewMode = 'day' | 'week';

export default function ScheduleCalendar() {
  const { schedules, addSchedule, deleteSchedule } = useDashboard();
  const [viewDate, setViewDate] = useState(today());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'lecture' as const,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
  });

  // ---- 날짜 계산 함수 ----
  const getWeekDates = (dateStr: string): string[] => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day; // 일요일로 이동
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
  const daySchedules = useMemo(() => {
    return schedules.filter(s => s.date === viewDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, viewDate]);

  const weekSchedules = useMemo(() => {
    return schedules.filter(s => weekDates.includes(s.date)).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedules, weekDates]);

  // ---- 네비게이션 ----
  const prevDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const nextDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    setViewDate(d.toISOString().split('T')[0]);
  };

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

  // ---- 일정 추가 ----
  const handleAddSchedule = (targetDate?: string) => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    addSchedule({
      ...formData,
      date: targetDate || viewDate,
      color: SCHEDULE_COLORS[formData.type],
    });

    setFormData({
      title: '',
      type: 'lecture',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
    });
    setShowAddForm(false);
    setSelectedDateForAdd(null);
  };

  // ---- 위치/높이 계산 ----
  const getSchedulePosition = (startTime: string) => {
    const [hours, mins] = startTime.split(':').map(Number);
    return (hours + mins / 60) * 60; // pixels
  };

  const getScheduleHeight = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    return Math.max(duration * 60, 30); // pixels
  };

  const dateObj = new Date(viewDate);
  const dayName = DAY_NAMES[dateObj.getDay()];
  const displayDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

  // ---- 주간 뷰 헤더 ----
  const getWeekHeader = () => {
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
  };

  return (
    <div>
      {/* ---- 뷰 모드 토글 ---- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'day'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            📅 일간
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            📆 주간
          </button>
        </div>

        {/* ---- 네비게이션 ---- */}
        <div className="flex items-center gap-4">
          <button
            onClick={viewMode === 'day' ? prevDay : prevWeek}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-6 h-6 text-blue-700" />
          </button>

          <div className="text-center min-w-48">
            {viewMode === 'day' ? (
              <div>
                <h2 className="text-2xl font-bold text-blue-900">{dayName}</h2>
                <p className="text-blue-700">{displayDate}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-blue-900">주간 일정</h2>
                <p className="text-blue-700">{getWeekHeader()}</p>
              </div>
            )}
          </div>

          <button
            onClick={viewMode === 'day' ? nextDay : nextWeek}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-6 h-6 text-blue-700" />
          </button>
        </div>

        {/* ---- 오늘 버튼 ---- */}
        <button
          onClick={() => setViewDate(today())}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
        >
          오늘
        </button>
      </div>

      {/* ---- 일간 뷰 ---- */}
      {viewMode === 'day' && (
        <>
          {/* Add Schedule Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            일정 추가
          </button>

          {/* Add Schedule Form */}
          {showAddForm && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="일정 제목"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="lecture">강의</option>
                  <option value="work">알바/일</option>
                  <option value="event">이벤트</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <input
                  type="text"
                  placeholder="장소 (선택)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <textarea
                  placeholder="설명 (선택)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSchedule()}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Day Time Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="relative">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="flex border-t border-gray-200"
                  style={{ height: '60px' }}
                >
                  <div className="w-16 flex-shrink-0 text-xs font-semibold text-gray-500 p-2 bg-gray-50 border-r border-gray-200">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 relative">
                    {daySchedules
                      .filter(s => {
                        const [h] = s.startTime.split(':').map(Number);
                        return h === hour;
                      })
                      .map(schedule => (
                        <div
                          key={schedule.id}
                          className="absolute left-2 right-2 rounded p-2 text-white text-xs font-semibold cursor-pointer hover:opacity-80 group"
                          style={{
                            backgroundColor: schedule.color,
                            top: `${getSchedulePosition(schedule.startTime) % 60}px`,
                            height: `${getScheduleHeight(schedule.startTime, schedule.endTime)}px`,
                          }}
                        >
                          <div className="truncate">{schedule.title}</div>
                          <div className="text-xs opacity-90">{schedule.startTime}-{schedule.endTime}</div>
                          {schedule.location && <div className="text-xs opacity-90">{schedule.location}</div>}
                          <button
                            onClick={() => deleteSchedule(schedule.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day Schedule List */}
          {daySchedules.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">오늘 일정</h3>
              <div className="space-y-2">
                {daySchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 bg-white rounded border-l-4"
                    style={{ borderLeftColor: schedule.color }}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{schedule.title}</div>
                      <div className="text-sm text-gray-600">
                        {schedule.startTime}-{schedule.endTime}
                        {schedule.location && ` · ${schedule.location}`}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ---- 주간 뷰 ---- */}
      {viewMode === 'week' && (
        <>
          {/* Add Schedule Button for Week */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            일정 추가
          </button>

          {/* Add Schedule Form for Week */}
          {showAddForm && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <div className="space-y-3">
                <select
                  value={selectedDateForAdd || viewDate}
                  onChange={(e) => setSelectedDateForAdd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
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
                <input
                  type="text"
                  placeholder="일정 제목"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="lecture">강의</option>
                  <option value="work">알바/일</option>
                  <option value="event">이벤트</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <input
                  type="text"
                  placeholder="장소 (선택)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSchedule(selectedDateForAdd || viewDate)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedDateForAdd(null);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Week Time Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <div className="min-w-full">
              {/* Week Header */}
              <div className="flex border-b border-gray-200">
                <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div>
                {weekDates.map((date, idx) => {
                  const d = new Date(date);
                  const isToday = date === today();
                  return (
                    <div
                      key={date}
                      className={cn(
                        'flex-1 min-w-32 text-center py-3 border-r border-gray-200 font-semibold',
                        isToday ? 'bg-blue-100 text-blue-900' : 'bg-gray-50 text-gray-700'
                      )}
                    >
                      <div className="text-sm">{DAY_NAMES[d.getDay()]}</div>
                      <div className="text-lg">{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Hours */}
              {HOURS.map(hour => (
                <div key={hour} className="flex border-t border-gray-200" style={{ height: '60px' }}>
                  <div className="w-16 flex-shrink-0 text-xs font-semibold text-gray-500 p-2 bg-gray-50 border-r border-gray-200">
                    {String(hour).padStart(2, '0')}:00
                  </div>

                  {/* Days */}
                  {weekDates.map(date => (
                    <div
                      key={date}
                      className="flex-1 min-w-32 relative border-r border-gray-200"
                      onClick={() => {
                        setSelectedDateForAdd(date);
                        setShowAddForm(true);
                      }}
                    >
                      {/* Schedules for this hour and date */}
                      {weekSchedules
                        .filter(s => s.date === date && s.startTime.startsWith(String(hour).padStart(2, '0')))
                        .map(schedule => (
                          <div
                            key={schedule.id}
                            className="absolute left-1 right-1 rounded p-1 text-white text-xs font-semibold cursor-pointer hover:opacity-80 group"
                            style={{
                              backgroundColor: schedule.color,
                              top: `${getSchedulePosition(schedule.startTime) % 60}px`,
                              height: `${getScheduleHeight(schedule.startTime, schedule.endTime)}px`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="truncate">{schedule.title}</div>
                            <div className="text-xs opacity-90">{schedule.startTime}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSchedule(schedule.id);
                              }}
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition"
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

          {/* Week Schedule Summary */}
          {weekSchedules.length > 0 && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">주간 일정 요약</h3>
              <div className="space-y-3">
                {weekDates.map(date => {
                  const daySchedules = weekSchedules.filter(s => s.date === date);
                  if (daySchedules.length === 0) return null;

                  const d = new Date(date);
                  return (
                    <div key={date} className="bg-white p-3 rounded border-l-4 border-blue-400">
                      <div className="font-semibold text-gray-800 mb-2">
                        {DAY_NAMES[d.getDay()]} {d.getMonth() + 1}월 {d.getDate()}일
                      </div>
                      <div className="space-y-1">
                        {daySchedules.map(schedule => (
                          <div key={schedule.id} className="text-sm text-gray-700 flex justify-between">
                            <span>
                              <span
                                className="inline-block w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: schedule.color }}
                              ></span>
                              {schedule.startTime}-{schedule.endTime} {schedule.title}
                            </span>
                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="text-red-500 hover:text-red-700"
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
        </>
      )}
    </div>
  );
}
