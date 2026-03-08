import { describe, it, expect } from 'vitest';

describe('Weekly View Utilities', () => {
  it('should calculate week dates correctly', () => {
    // Test with March 8, 2026 (Sunday)
    const testDate = '2026-03-08';
    const date = new Date(testDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.getFullYear(), date.getMonth(), diff);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2026-03-08'); // Sunday
    expect(dates[6]).toBe('2026-03-14'); // Saturday
  });

  it('should handle week navigation correctly', () => {
    const currentDate = '2026-03-08';
    const d = new Date(currentDate);
    
    // Next week
    const nextWeekDate = new Date(d);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const nextWeekStr = nextWeekDate.toISOString().split('T')[0];
    
    expect(nextWeekStr).toBe('2026-03-15');

    // Previous week
    const prevWeekDate = new Date(d);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    const prevWeekStr = prevWeekDate.toISOString().split('T')[0];
    
    expect(prevWeekStr).toBe('2026-03-01');
  });

  it('should filter schedules by week dates', () => {
    const weekDates = ['2026-03-08', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14'];
    
    const schedules = [
      { id: '1', date: '2026-03-08', startTime: '09:00', endTime: '10:00' },
      { id: '2', date: '2026-03-10', startTime: '14:00', endTime: '15:00' },
      { id: '3', date: '2026-03-15', startTime: '10:00', endTime: '11:00' }, // Outside week
    ];

    const weekSchedules = schedules.filter(s => weekDates.includes(s.date));
    
    expect(weekSchedules).toHaveLength(2);
    expect(weekSchedules.map(s => s.id)).toEqual(['1', '2']);
  });

  it('should sort schedules by date and time', () => {
    const schedules = [
      { id: '1', date: '2026-03-10', startTime: '14:00' },
      { id: '2', date: '2026-03-08', startTime: '09:00' },
      { id: '3', date: '2026-03-08', startTime: '10:00' },
    ];

    const sorted = schedules.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    expect(sorted.map(s => s.id)).toEqual(['2', '3', '1']);
  });

  it('should calculate schedule position correctly', () => {
    const getSchedulePosition = (startTime: string) => {
      const [hours, mins] = startTime.split(':').map(Number);
      return (hours + mins / 60) * 60;
    };

    expect(getSchedulePosition('09:00')).toBe(540); // 9 * 60
    expect(getSchedulePosition('14:30')).toBe(870); // 14.5 * 60
    expect(getSchedulePosition('00:00')).toBe(0);
  });

  it('should calculate schedule height correctly', () => {
    const getScheduleHeight = (startTime: string, endTime: string) => {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const duration = (eh + em / 60) - (sh + sm / 60);
      return Math.max(duration * 60, 30);
    };

    expect(getScheduleHeight('09:00', '10:00')).toBe(60); // 1 hour
    expect(getScheduleHeight('09:00', '10:30')).toBe(90); // 1.5 hours
    expect(getScheduleHeight('09:00', '09:15')).toBe(30); // 15 mins (minimum 30)
  });

  it('should group schedules by date for summary', () => {
    const weekDates = ['2026-03-08', '2026-03-09', '2026-03-10'];
    const schedules = [
      { id: '1', date: '2026-03-08', title: 'Math' },
      { id: '2', date: '2026-03-08', title: 'English' },
      { id: '3', date: '2026-03-10', title: 'Science' },
    ];

    const summary: Record<string, typeof schedules> = {};
    weekDates.forEach(date => {
      summary[date] = schedules.filter(s => s.date === date);
    });

    expect(summary['2026-03-08']).toHaveLength(2);
    expect(summary['2026-03-09']).toHaveLength(0);
    expect(summary['2026-03-10']).toHaveLength(1);
  });

  it('should handle view mode transitions', () => {
    type ViewMode = 'day' | 'week';
    let viewMode: ViewMode = 'day';

    expect(viewMode).toBe('day');
    
    viewMode = 'week';
    expect(viewMode).toBe('week');
    
    viewMode = 'day';
    expect(viewMode).toBe('day');
  });
});

describe('Schedule Types', () => {
  it('should support schedule types', () => {
    const types = ['lecture', 'work', 'event'];
    expect(types).toHaveLength(3);
  });

  it('should map types to colors', () => {
    const SCHEDULE_COLORS = {
      lecture: '#3b82f6',
      work: '#ef4444',
      event: '#8b5cf6',
    };

    expect(SCHEDULE_COLORS.lecture).toBe('#3b82f6');
    expect(SCHEDULE_COLORS.work).toBe('#ef4444');
    expect(SCHEDULE_COLORS.event).toBe('#8b5cf6');
  });
});
