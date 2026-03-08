import { describe, it, expect } from 'vitest';
import { DEFAULT_SCHEDULE_COLORS, ScheduleCategory } from '@/lib/types';

describe('Schedule Category Colors', () => {
  it('should have default colors for all schedule types', () => {
    expect(DEFAULT_SCHEDULE_COLORS.lecture).toBe('#3b82f6');
    expect(DEFAULT_SCHEDULE_COLORS.work).toBe('#ef4444');
    expect(DEFAULT_SCHEDULE_COLORS.event).toBe('#8b5cf6');
  });

  it('should have 3 default colors', () => {
    const colors = Object.values(DEFAULT_SCHEDULE_COLORS);
    expect(colors).toHaveLength(3);
  });

  it('should validate category color format', () => {
    const isValidHexColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);
    
    Object.values(DEFAULT_SCHEDULE_COLORS).forEach(color => {
      expect(isValidHexColor(color)).toBe(true);
    });
  });

  it('should create schedule category with custom color', () => {
    const category: ScheduleCategory = {
      id: 'cat-1',
      name: '중요한 강의',
      color: '#ff6b6b',
      type: 'lecture',
    };

    expect(category.name).toBe('중요한 강의');
    expect(category.color).toBe('#ff6b6b');
    expect(category.type).toBe('lecture');
  });

  it('should support category without type', () => {
    const category: ScheduleCategory = {
      id: 'cat-2',
      name: '커스텀 카테고리',
      color: '#4ecdc4',
    };

    expect(category.type).toBeUndefined();
  });

  it('should filter categories by type', () => {
    const categories: ScheduleCategory[] = [
      { id: '1', name: '데이터베이스', color: '#3b82f6', type: 'lecture' },
      { id: '2', name: '알고리즘', color: '#3b82f6', type: 'lecture' },
      { id: '3', name: '편의점 알바', color: '#ef4444', type: 'work' },
      { id: '4', name: '생일파티', color: '#8b5cf6', type: 'event' },
    ];

    const lectureCategories = categories.filter(c => c.type === 'lecture');
    const workCategories = categories.filter(c => c.type === 'work');
    const eventCategories = categories.filter(c => c.type === 'event');

    expect(lectureCategories).toHaveLength(2);
    expect(workCategories).toHaveLength(1);
    expect(eventCategories).toHaveLength(1);
  });

  it('should handle category color updates', () => {
    let category: ScheduleCategory = {
      id: 'cat-1',
      name: '강의',
      color: '#3b82f6',
      type: 'lecture',
    };

    // Update color
    category = { ...category, color: '#ff6b6b' };

    expect(category.color).toBe('#ff6b6b');
    expect(category.id).toBe('cat-1');
    expect(category.name).toBe('강의');
  });

  it('should handle category name updates', () => {
    let category: ScheduleCategory = {
      id: 'cat-1',
      name: '강의',
      color: '#3b82f6',
      type: 'lecture',
    };

    // Update name
    category = { ...category, name: '중요한 강의' };

    expect(category.name).toBe('중요한 강의');
    expect(category.color).toBe('#3b82f6');
  });

  it('should create category map from array', () => {
    const categories: ScheduleCategory[] = [
      { id: '1', name: '강의1', color: '#3b82f6', type: 'lecture' },
      { id: '2', name: '강의2', color: '#3b82f6', type: 'lecture' },
    ];

    const categoryMap: Record<string, ScheduleCategory> = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat;
    });

    expect(categoryMap['1'].name).toBe('강의1');
    expect(categoryMap['2'].name).toBe('강의2');
    expect(Object.keys(categoryMap)).toHaveLength(2);
  });

  it('should delete category from map', () => {
    let categoryMap: Record<string, ScheduleCategory> = {
      '1': { id: '1', name: '강의', color: '#3b82f6', type: 'lecture' },
      '2': { id: '2', name: '알바', color: '#ef4444', type: 'work' },
    };

    delete categoryMap['1'];

    expect(categoryMap['1']).toBeUndefined();
    expect(categoryMap['2']).toBeDefined();
    expect(Object.keys(categoryMap)).toHaveLength(1);
  });

  it('should apply category color to schedule', () => {
    const category: ScheduleCategory = {
      id: 'cat-1',
      name: '데이터베이스',
      color: '#ff6b6b',
      type: 'lecture',
    };

    const schedule = {
      id: 'sched-1',
      title: '데이터베이스 강의',
      type: 'lecture' as const,
      date: '2026-03-09',
      startTime: '09:00',
      endTime: '10:30',
      color: category.color,
      category: category.id,
    };

    expect(schedule.color).toBe('#ff6b6b');
    expect(schedule.category).toBe('cat-1');
  });

  it('should handle default category ID format', () => {
    const defaultCategoryId = 'default_lecture';
    const isDefaultCategory = defaultCategoryId.startsWith('default_');

    expect(isDefaultCategory).toBe(true);
  });

  it('should extract type from default category ID', () => {
    const defaultCategoryId = 'default_lecture';
    const type = defaultCategoryId.replace('default_', '');

    expect(type).toBe('lecture');
  });

  it('should support 10 preset colors', () => {
    const presetColors = [
      '#3b82f6', // Blue
      '#ef4444', // Red
      '#10b981', // Green
      '#f59e0b', // Amber
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#6b7280', // Gray
      '#14b8a6', // Teal
      '#f97316', // Orange
    ];

    expect(presetColors).toHaveLength(10);
    presetColors.forEach(color => {
      expect(/^#[0-9A-F]{6}$/i.test(color)).toBe(true);
    });
  });

  it('should validate category name is not empty', () => {
    const isValidName = (name: string) => name.trim().length > 0;

    expect(isValidName('강의')).toBe(true);
    expect(isValidName('')).toBe(false);
    expect(isValidName('   ')).toBe(false);
  });

  it('should maintain category uniqueness by ID', () => {
    const categoryMap: Record<string, ScheduleCategory> = {};

    const cat1: ScheduleCategory = { id: '1', name: '강의', color: '#3b82f6', type: 'lecture' };
    const cat2: ScheduleCategory = { id: '2', name: '알바', color: '#ef4444', type: 'work' };

    categoryMap[cat1.id] = cat1;
    categoryMap[cat2.id] = cat2;

    // Try to add duplicate ID
    categoryMap[cat1.id] = { ...cat1, name: '수정된 강의' };

    expect(Object.keys(categoryMap)).toHaveLength(2);
    expect(categoryMap['1'].name).toBe('수정된 강의');
  });
});
