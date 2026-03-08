// ============================================================
// Schedule Calendar - 사진 기반 디자인
// 구글 캘린더 스타일의 시간표 뷰
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Search, Menu } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { DAY_NAMES, MONTH_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { SCHEDULE_COLOR_PRESETS } from '@/lib/types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ScheduleCalendar() {
  const { schedules, addSchedule, deleteSchedule } = useDashboard();
  
  // 상태
  const [currentDate, setCurrentDate] = useState(today());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(SCHEDULE_COLOR_PRESETS[0]);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState<string>('#3b82f6');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'lecture' as const,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
  });

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 주간 날짜 계산
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

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // 주간 일정 필터링
  const weekSchedules = useMemo(() => {
    return schedules
      .filter(s => weekDates.includes(s.date))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [schedules, weekDates]);

  // 월 변경
  const changeMonth = (offset: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(today());
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
      date: currentDate,
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
    return (hours + mins / 60) * 60;
  };

  const getScheduleHeight = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    return Math.max(duration * 60, 30);
  };

  // 현재 시간 위치
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const mins = currentTime.getMinutes();
    return (hours + mins / 60) * 60;
  };

  // 월 표시
  const getMonthDisplay = () => {
    const d = new Date(currentDate);
    return `${d.getMonth() + 1}월`;
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* ---- 헤더 ---- */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 md:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        {/* 좌측: 뒤로가기 + 월 선택 */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 hover:bg-gray-100 rounded text-sm md:text-base font-semibold text-gray-800"
          >
            {getMonthDisplay()}
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* 우측: 검색 + 오늘 + 메뉴 */}
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>

          <button
            onClick={goToToday}
            className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            오늘
          </button>

          <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* ---- 요일 헤더 ---- */}
      <div className="flex border-b border-gray-200 bg-blue-50 sticky top-14 md:top-16 z-10">
        <div className="w-12 md:w-16 flex-shrink-0"></div>
        {weekDates.map((date, idx) => {
          const d = new Date(date);
          const isToday = date === today();
          return (
            <div
              key={date}
              className="flex-1 min-w-0 text-center py-2 md:py-3 border-r border-gray-200"
            >
              <div className="text-xs md:text-sm font-semibold text-gray-600">
                {DAY_NAMES[d.getDay()]}
              </div>
              <div
                className={cn(
                  'text-sm md:text-lg font-bold mt-1',
                  isToday
                    ? 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto'
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
          <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-4 md:p-6 max-h-96 md:max-h-auto overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">일정 추가</h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="일정 제목"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
              />

              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
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
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm md:text-base"
              />

              {/* 색상 선택 */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  색상
                </label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {SCHEDULE_COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setUseCustomColor(false);
                      }}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded border-2 transition-all ${
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
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm md:text-base"
                >
                  저장
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold text-sm md:text-base"
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
          <div className="w-12 md:w-16 flex-shrink-0 bg-white border-r border-gray-200">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-16 md:h-20 border-b border-gray-200 flex items-start justify-center pt-1 text-xs md:text-sm font-semibold text-gray-500"
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* 요일별 시간표 */}
          <div className="flex flex-1">
            {weekDates.map((date, dateIdx) => (
              <div
                key={date}
                className="flex-1 min-w-0 border-r border-gray-200 relative"
              >
                {/* 시간 그리드 */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="h-16 md:h-20 border-b border-gray-100 relative cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setFormData({ ...formData, startTime: `${String(hour).padStart(2, '0')}:00` });
                      setShowAddForm(true);
                    }}
                  >
                    {/* 현재 시간 표시 */}
                    {date === today() && (
                      <div
                        className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                        style={{ top: `${getCurrentTimePosition() % 60}px` }}
                      >
                        <div className="absolute -left-8 md:-left-12 -top-2 bg-red-500 text-white text-xs font-bold px-1 rounded">
                          {currentTime.getHours().toString().padStart(2, '0')}:
                          {currentTime.getMinutes().toString().padStart(2, '0')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 일정 렌더링 */}
                {weekSchedules
                  .filter(s => s.date === date)
                  .map(schedule => (
                    <div
                      key={schedule.id}
                      className="absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded p-1 text-white text-xs font-semibold group hover:shadow-lg transition-shadow"
                      style={{
                        backgroundColor: schedule.color || '#6b7280',
                        top: `${getSchedulePosition(schedule.startTime)}px`,
                        height: `${getScheduleHeight(schedule.startTime, schedule.endTime)}px`,
                      }}
                    >
                      <div className="truncate text-xs">{schedule.title}</div>
                      <div className="text-xs opacity-90">{schedule.startTime}</div>
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
        </div>
      </div>

      {/* ---- 플로팅 추가 버튼 ---- */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center z-40 transition-all hover:scale-110"
      >
        <Plus className="w-7 h-7 md:w-8 md:h-8" />
      </button>
    </div>
  );
}
