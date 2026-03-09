// ============================================================
// Schedule Calendar - 컴팩트 모바일 시간표 뷰
// 작은 칸 크기로 모바일 한 화면에 모든 시간대 표시
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { DAY_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { SCHEDULE_COLOR_PRESETS } from '@/lib/types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 40; // 작은 칸 크기 (px)

export default function ScheduleCalendar() {
  const { schedules, addSchedule, deleteSchedule } = useDashboard();
  
  // 상태
  const [weekStartDate, setWeekStartDate] = useState(today());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(SCHEDULE_COLOR_PRESETS[0]);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState<string>('#3b82f6');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState({
    title: '',
    type: 'lecture' as const,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
  });

  // 현재 시간 업데이트 (1분마다)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 주간 날짜 계산 (weekStartDate부터 7일)
  const getWeekDates = (dateStr: string): string[] => {
    const date = new Date(dateStr);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(weekStartDate), [weekStartDate]);

  // 주간 일정 필터링
  const weekSchedules = useMemo(() => {
    return schedules
      .filter(s => weekDates.includes(s.date))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [schedules, weekDates]);

  // 주 변경
  const changeWeek = (offset: number) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + offset * 7);
    setWeekStartDate(d.toISOString().split('T')[0]);
  };

  // 오늘로 이동
  const goToToday = () => {
    const todayDate = today();
    const d = new Date(todayDate);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    setWeekStartDate(weekStart.toISOString().split('T')[0]);
  };

  // 색상 선택
  const getFinalColor = () => {
    return useCustomColor ? customColor : selectedColor;
  };

  // 일정 추가
  const handleAddSchedule = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    const finalColor = getFinalColor();

    addSchedule({
      ...formData,
      date: weekStartDate,
      color: finalColor,
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
    setSelectedColor(SCHEDULE_COLOR_PRESETS[0]);
    setUseCustomColor(false);
    setCustomColor('#3b82f6');
    setShowAddForm(false);
  };

  // 위치/높이 계산
  const getSchedulePosition = (startTime: string) => {
    const [hours, mins] = startTime.split(':').map(Number);
    return (hours + mins / 60) * HOUR_HEIGHT;
  };

  const getScheduleHeight = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    return Math.max(duration * HOUR_HEIGHT, 20);
  };

  // 현재 시간 위치 (절대값)
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const mins = currentTime.getMinutes();
    return (hours + mins / 60) * HOUR_HEIGHT;
  };

  // 현재 시간 포맷
  const getCurrentTimeString = () => {
    return `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
  };

  // 주 표시 (예: 3월 8-14주)
  const getWeekDisplay = () => {
    const startD = new Date(weekDates[0]);
    const endD = new Date(weekDates[6]);
    const startMonth = startD.getMonth() + 1;
    const endMonth = endD.getMonth() + 1;
    const startDate = startD.getDate();
    const endDate = endD.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth}월 ${startDate}-${endDate}주`;
    } else {
      return `${startMonth}월 ${startDate}-${endMonth}월 ${endDate}주`;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* ---- 헤더 ---- */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeWeek(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <span className="text-sm font-semibold text-gray-800 min-w-24">
            {getWeekDisplay()}
          </span>

          <button
            onClick={() => changeWeek(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded"
        >
          오늘
        </button>
      </div>

      {/* ---- 요일 헤더 ---- */}
      <div className="flex border-b border-gray-200 bg-blue-50 sticky top-12 z-10">
        <div className="w-10 flex-shrink-0"></div>
        {weekDates.map((date, idx) => {
          const d = new Date(date);
          const isToday = date === today();
          return (
            <div
              key={date}
              className="flex-1 text-center py-1.5 border-r border-gray-200 text-xs"
            >
              <div className="font-semibold text-gray-600">
                {DAY_NAMES[d.getDay()]}
              </div>
              <div
                className={cn(
                  'text-sm font-bold mt-0.5',
                  isToday
                    ? 'w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto'
                    : 'text-gray-900'
                )}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- 일정 추가 폼 (모달) ---- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">일정 추가</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="일정 제목"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />

              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="lecture">강의</option>
                <option value="work">알바/일</option>
                <option value="event">이벤트</option>
              </select>

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
                placeholder="장소"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />

              {/* 색상 선택 */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  색상
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SCHEDULE_COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setUseCustomColor(false);
                      }}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        !useCustomColor && selectedColor === color
                          ? 'border-gray-800 ring-2 ring-offset-1'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setUseCustomColor(true);
                    }}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setUseCustomColor(true);
                    }}
                    placeholder="#3b82f6"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddSchedule}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm"
                >
                  저장
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- 시간표 ---- */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex">
          {/* 시간 레이블 */}
          <div className="w-10 flex-shrink-0 bg-white border-r border-gray-200">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-10 border-b border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500"
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* 요일별 시간표 */}
          <div className="flex flex-1 relative">
            {weekDates.map((date, dateIdx) => (
              <div
                key={date}
                className="flex-1 border-r border-gray-200 relative"
              >
                {/* 시간 그리드 */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="h-10 border-b border-gray-100 relative cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setFormData({ ...formData, startTime: `${String(hour).padStart(2, '0')}:00` });
                      setShowAddForm(true);
                    }}
                  />
                ))}

                {/* 일정 렌더링 */}
                {weekSchedules
                  .filter(s => s.date === date)
                  .map(schedule => (
                    <div
                      key={schedule.id}
                      className="absolute left-0.5 right-0.5 rounded p-0.5 text-white text-xs font-semibold group hover:shadow-lg transition-shadow overflow-hidden"
                      style={{
                        backgroundColor: schedule.color || '#6b7280',
                        top: `${getSchedulePosition(schedule.startTime)}px`,
                        height: `${getScheduleHeight(schedule.startTime, schedule.endTime)}px`,
                      }}
                    >
                      <div className="truncate text-xs leading-tight">{schedule.title}</div>
                      <div className="text-xs opacity-90 leading-tight">{schedule.startTime}</div>
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

            {/* 현재 시간 표시 (빨간 선) - 오늘 날짜에만 */}
            {weekDates.includes(today()) && (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="absolute -left-10 -top-2 bg-red-500 text-white text-xs font-bold px-1 rounded whitespace-nowrap">
                  {getCurrentTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- 플로팅 추가 버튼 ---- */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center z-40 transition-all hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
