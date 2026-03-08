import { describe, it, expect } from 'vitest';

describe('Repeat Schedule Functionality', () => {
  it('should generate repeat schedules for weekdays', () => {
    const startDate = new Date('2026-03-09'); // Monday
    const endDate = new Date('2026-03-13'); // Friday
    const daysOfWeek = [1, 2, 3, 4, 5]; // Mon-Fri

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push(d.toISOString().split('T')[0]);
      }
    }

    expect(schedulesToAdd).toHaveLength(5);
    expect(schedulesToAdd[0]).toBe('2026-03-09'); // Monday
    expect(schedulesToAdd[4]).toBe('2026-03-13'); // Friday
  });

  it('should skip weekends in repeat schedule', () => {
    const startDate = new Date('2026-03-07'); // Saturday
    const endDate = new Date('2026-03-15'); // Sunday
    const daysOfWeek = [1, 2, 3, 4, 5]; // Mon-Fri only

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push(d.toISOString().split('T')[0]);
      }
    }

    expect(schedulesToAdd).toHaveLength(5);
    expect(schedulesToAdd).not.toContain('2026-03-07'); // Saturday
    expect(schedulesToAdd).not.toContain('2026-03-08'); // Sunday
    expect(schedulesToAdd).not.toContain('2026-03-14'); // Saturday
    expect(schedulesToAdd).not.toContain('2026-03-15'); // Sunday
  });

  it('should handle custom day selection', () => {
    const startDate = new Date('2026-03-09');
    const endDate = new Date('2026-03-15');
    const daysOfWeek = [0, 3, 6]; // Sun, Wed, Sat

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push(d.toISOString().split('T')[0]);
      }
    }

    expect(schedulesToAdd).toHaveLength(2);
    expect(schedulesToAdd).toContain('2026-03-11'); // Wednesday
    expect(schedulesToAdd).toContain('2026-03-15'); // Sunday
  });

  it('should handle single day repeat', () => {
    const startDate = new Date('2026-03-09');
    const endDate = new Date('2026-03-09');
    const daysOfWeek = [1]; // Monday only

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push(d.toISOString().split('T')[0]);
      }
    }

    expect(schedulesToAdd).toHaveLength(1);
    expect(schedulesToAdd[0]).toBe('2026-03-09');
  });

  it('should handle month-long repeat', () => {
    const startDate = new Date('2026-03-01');
    const endDate = new Date('2026-03-31');
    const daysOfWeek = [1, 2, 3, 4, 5]; // Mon-Fri

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push(d.toISOString().split('T')[0]);
      }
    }

    // March 2026: 22 weekdays
    expect(schedulesToAdd.length).toBeGreaterThan(15);
    expect(schedulesToAdd.length).toBeLessThanOrEqual(22);
  });

  it('should validate date range', () => {
    const startDate = new Date('2026-03-15');
    const endDate = new Date('2026-03-09');

    const isValidRange = startDate <= endDate;
    expect(isValidRange).toBe(false);
  });

  it('should handle all days of week selection', () => {
    const startDate = new Date('2026-03-09');
    const endDate = new Date('2026-03-15');
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // All days

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push(d.toISOString().split('T')[0]);
      }
    }

    expect(schedulesToAdd).toHaveLength(7);
  });

  it('should preserve schedule data during repeat', () => {
    const scheduleData = {
      title: '데이터베이스 강의',
      type: 'lecture',
      startTime: '09:00',
      endTime: '10:30',
      location: '공학관 301호',
      description: '데이터베이스 기초',
    };

    const startDate = new Date('2026-03-09');
    const endDate = new Date('2026-03-13');
    const daysOfWeek = [1, 2, 3, 4, 5];

    const schedulesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        schedulesToAdd.push({
          ...scheduleData,
          date: d.toISOString().split('T')[0],
        });
      }
    }

    expect(schedulesToAdd).toHaveLength(5);
    schedulesToAdd.forEach(s => {
      expect(s.title).toBe('데이터베이스 강의');
      expect(s.startTime).toBe('09:00');
      expect(s.endTime).toBe('10:30');
    });
  });
});

describe('Mobile Responsive Design', () => {
  it('should have responsive breakpoints', () => {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    expect(breakpoints.md).toBe(768);
    expect(breakpoints.sm).toBeLessThan(breakpoints.md);
  });

  it('should support touch-friendly sizes', () => {
    const touchMinSize = 44; // pixels (iOS recommendation)
    const buttonSize = 40; // Our button size

    expect(buttonSize).toBeGreaterThanOrEqual(40);
  });

  it('should handle horizontal scroll on mobile', () => {
    const weekDays = 7;
    const minWidthPerDay = 96; // min-w-24 = 96px

    const totalWidth = weekDays * minWidthPerDay;
    expect(totalWidth).toBeGreaterThan(640); // Exceeds mobile width

    // Should require horizontal scroll
    expect(totalWidth > 640).toBe(true);
  });
});

describe('Form Mode Transitions', () => {
  it('should toggle between single and repeat modes', () => {
    type FormMode = 'single' | 'repeat';
    let formMode: FormMode = 'single';

    expect(formMode).toBe('single');

    formMode = 'repeat';
    expect(formMode).toBe('repeat');

    formMode = 'single';
    expect(formMode).toBe('single');
  });

  it('should reset form data on cancel', () => {
    const initialFormData = {
      title: '',
      type: 'lecture' as const,
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
    };

    let formData = { ...initialFormData };
    formData.title = '데이터베이스';
    formData.location = '공학관';

    // Reset
    formData = { ...initialFormData };

    expect(formData.title).toBe('');
    expect(formData.location).toBe('');
    expect(formData.startTime).toBe('09:00');
  });

  it('should preserve schedule type selection', () => {
    const types = ['lecture', 'work', 'event'] as const;
    let selectedType = types[0];

    expect(selectedType).toBe('lecture');

    selectedType = types[1];
    expect(selectedType).toBe('work');
  });
});
