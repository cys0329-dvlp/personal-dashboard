// Schedule Calendar - 컴팩트 모바일 시간표 뷰
// 작은 칸 크기로 모바일 한 화면에 모든 시간대 표시
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Repeat2, X } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { DAY_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { SCHEDULE_COLOR_PRESETS, Schedule } from '@/lib/types';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 ~ 24:00 (17시간)
const HOUR_HEIGHT = 40; // 작은 칸 크기 (px)
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ScheduleCalendar() {
  const { schedules, addSchedule, addRepeatSchedule, deleteSchedule, updateSchedule } = useDashboard();
  
  // 상태
  const [weekStartDate, setWeekStartDate] = useState(today());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(SCHEDULE_COLOR_PRESETS[0]);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState<string>('#3b82f6');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 반복 옵션 상태
  const [repeatType, setRepeatType] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]); // 기본값: 월-금

  const [formData, setFormData] = useState({
    title: '',
      type: 'lecture' as 'lecture' | 'work' | 'event',
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

  // 주간 날짜 계산 (월요일부터 일요일까지)
  const getWeekDates = (dateStr: string): string[] => {
    const date = new Date(dateStr);
    const day = date.getDay();
    // 월요일(1)을 기준으로 계산
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    const weekStart = new Date(date.setDate(diff));
    
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
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

  // 오늘로 이동 (월요일 기준)
  const goToToday = () => {
    const todayDate = today();
    const d = new Date(todayDate);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const weekStart = new Date(d.setDate(diff));
    setWeekStartDate(weekStart.toISOString().split('T')[0]);
  };

  // 색상 선택
  const getFinalColor = () => {
    return useCustomColor ? customColor : selectedColor;
  };

  // 요일 토글
  const toggleRepeatDay = (dayNum: number) => {
    setRepeatDays(prev =>
      prev.includes(dayNum)
        ? prev.filter(d => d !== dayNum)
        : [...prev, dayNum].sort()
    );
  };

  // 일정 추가
  const handleAddSchedule = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    if (repeatType !== 'none' && !repeatEndDate) {
      alert('반복 종료일을 입력해주세요');
      return;
    }

    const finalColor = getFinalColor();

    const scheduleData = {
      ...formData,
      date: weekStartDate,
      color: finalColor,
      repeatType,
      repeatEndDate: repeatType !== 'none' ? repeatEndDate : undefined,
      repeatDays: repeatType !== 'none' ? repeatDays : undefined,
    };

    if (repeatType === 'none') {
      addSchedule(scheduleData);
    } else {
      addRepeatSchedule(scheduleData);
    }

    resetForm();
  };

  // 일정 수정
  const handleEditSchedule = () => {
    if (!editingSchedule || !formData.title || !formData.startTime || !formData.endTime) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    const finalColor = getFinalColor();
    const updatedSchedule = {
      ...editingSchedule,
      ...formData,
      color: finalColor,
    };

    updateSchedule(editingSchedule.id, updatedSchedule);
    closeEditModal();
  };

  // 수정 모달 열기
  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      type: (schedule.type || 'lecture') as 'lecture' | 'work' | 'event',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location || '',
      description: schedule.description || '',
    });
    const scheduleColor = (schedule.color || SCHEDULE_COLOR_PRESETS[0]) as typeof SCHEDULE_COLOR_PRESETS[number];
    setSelectedColor(scheduleColor);
    setUseCustomColor(!SCHEDULE_COLOR_PRESETS.includes(scheduleColor));
    setCustomColor(schedule.color || SCHEDULE_COLOR_PRESETS[0]);
    setShowEditModal(true);
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSchedule(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
        type: 'lecture' as 'lecture' | 'work' | 'event',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
    });
    setSelectedColor(SCHEDULE_COLOR_PRESETS[0]);
    setUseCustomColor(false);
    setCustomColor('#3b82f6');
    setRepeatType('none');
    setRepeatEndDate('');
    setRepeatDays([1, 2, 3, 4, 5]);
    setShowAddForm(false);
  };

  // 위치/높이 계산
  const getSchedulePosition = (startTime: string) => {
    const [hours, mins] = startTime.split(':').map(Number);
    return (hours - 8 + mins / 60) * HOUR_HEIGHT;
  };

  const getScheduleHeight = (startTime: string, endTime: string) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    return Math.max(duration * HOUR_HEIGHT, 20);
  };

  // 현재 시간 위치 (절대값, 08:00 기준)
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const mins = currentTime.getMinutes();
    return (hours - 8 + mins / 60) * HOUR_HEIGHT;
  };

  // 마른 시간이 08:00-24:00 단위 내에 있는지 확인
  const isCurrentTimeInRange = () => {
    const hour = currentTime.getHours();
    return hour >= 8 && hour < 24;
  };

  // 현재 시간 포맷
  const getCurrentTimeString = () => {
    return `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
  };

  // 주 표시 (예: 3월 17-23일)
  const getWeekDisplay = () => {
    const startD = new Date(weekDates[0]);
    const endD = new Date(weekDates[6]);
    const startMonth = startD.getMonth() + 1;
    const endMonth = endD.getMonth() + 1;
    const startDate = startD.getDate();
    const endDate = endD.getDate();
    
    if (startMonth === endMonth) {
      return `${startMonth}월 ${startDate}-${endDate}일`;
    } else {
      return `${startMonth}월 ${startDate}-${endMonth}월 ${endDate}일`;
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
              <div className={cn(
                'text-xs font-bold',
                isToday ? 'w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto' : 'text-gray-700'
              )}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- 시간표 그리드 ---- */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="flex">
          {/* 시간 라벨 */}
          <div className="w-10 flex-shrink-0 border-r border-gray-200">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="text-xs text-gray-500 text-center font-semibold"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* 일정 그리드 */}
          <div className="flex-1 flex">
            {weekDates.map((date, dayIdx) => (
              <div
                key={date}
                className="flex-1 border-r border-gray-200 relative"
              >
                {/* 시간 구분선 */}
                {HOURS.map(hour => (
                  <div
                    key={`${date}-${hour}`}
                    className="border-b border-gray-100"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* 일정 렌더링 */}
                {weekSchedules
                  .filter(s => s.date === date)
                  .map(schedule => (
                    <div
                      key={schedule.id}
                      className="absolute left-0 right-0 mx-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        top: getSchedulePosition(schedule.startTime),
                        height: getScheduleHeight(schedule.startTime, schedule.endTime),
                        backgroundColor: schedule.color,
                        zIndex: 5,
                      }}
                      onClick={() => openEditModal(schedule)}
                    >
                      <div className="p-1 text-white text-xs font-semibold truncate">
                        {schedule.title}
                      </div>
                      <div className="px-1 text-white text-xs truncate">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* 현재 시간 표시 (빨간 선) */}
        {isCurrentTimeInRange() && (
          <div
            className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
            style={{
              top: getCurrentTimePosition() + 12,
            }}
          >
            <div className="absolute -left-10 -top-2.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              {getCurrentTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* 추가 버튼 */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ---- 일정 추가 모달 ---- */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">일정 추가</h2>

            {/* 제목 */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="강의명, 업무 등"
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">시작 시간 *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">종료 시간 *</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 색상 선택 */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">색상</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {SCHEDULE_COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full border-2',
                      !useCustomColor && selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setUseCustomColor(false);
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setUseCustomColor(true);
                  }}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-500 self-center">커스텀 색상</span>
              </div>
            </div>

            {/* 반복 옵션 */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">반복</label>
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as 'none' | 'weekly' | 'monthly')}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">반복 없음</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>

            {/* 반복 종료일 */}
            {repeatType !== 'none' && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700">반복 종료일 *</label>
                <input
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 요일 선택 */}
            {repeatType === 'weekly' && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700">요일 선택</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5, 6, 0].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleRepeatDay(day)}
                      className={cn(
                        'w-8 h-8 rounded text-xs font-bold',
                        repeatDays.includes(day)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      )}
                    >
                      {['일', '월', '화', '수', '목', '금', '토'][day]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddSchedule}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- 일정 수정 모달 ---- */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">일정 수정</h2>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 제목 */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">시작 시간 *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">종료 시간 *</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 색상 선택 */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">색상</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {SCHEDULE_COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full border-2',
                      !useCustomColor && selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setUseCustomColor(false);
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setUseCustomColor(true);
                  }}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-500 self-center">커스텀 색상</span>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deleteSchedule(editingSchedule.id);
                  closeEditModal();
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleEditSchedule}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
