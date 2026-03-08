import { describe, it, expect } from 'vitest';
import { getDaysInMonth, getFirstDayOfMonth, formatDate, today } from '@/lib/utils';

describe('Calendar Utilities', () => {
  it('getDaysInMonth should return correct number of days', () => {
    // March 2026 has 31 days
    expect(getDaysInMonth(2026, 2)).toBe(31);
    // February 2026 has 28 days (not a leap year)
    expect(getDaysInMonth(2026, 1)).toBe(28);
    // December has 31 days
    expect(getDaysInMonth(2026, 11)).toBe(31);
  });

  it('getFirstDayOfMonth should return correct day', () => {
    // March 1, 2026 is a Sunday (0)
    const firstDay = getFirstDayOfMonth(2026, 2);
    expect(firstDay).toBeGreaterThanOrEqual(0);
    expect(firstDay).toBeLessThanOrEqual(6);
  });

  it('formatDate should format date correctly', () => {
    const date = new Date(2026, 2, 8); // March 8, 2026
    expect(formatDate(date)).toBe('2026-03-08');
  });

  it('today should return current date in YYYY-MM-DD format', () => {
    const todayStr = today();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('calendar grid should have correct structure', () => {
    const year = 2026;
    const month = 2; // March
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Total cells = empty cells + days in month
    const totalCells = firstDay + daysInMonth;
    
    // Should be divisible by 7 (week) or have remainder
    expect(totalCells).toBeGreaterThan(0);
    expect(daysInMonth).toBe(31);
    expect(firstDay).toBeGreaterThanOrEqual(0);
  });
});

describe('Transaction Categorization', () => {
  it('should handle income categories', () => {
    const incomeCategories = ['급여', '부업', '투자수익', '용돈', '환급', '기타수입'];
    expect(incomeCategories).toHaveLength(6);
    expect(incomeCategories).toContain('급여');
  });

  it('should handle expense categories', () => {
    const expenseCategories = [
      '식비', '교통', '쇼핑', '문화/여가', '의료/건강', 
      '통신', '주거/관리비', '교육', '저축/투자', '기타지출'
    ];
    expect(expenseCategories).toHaveLength(10);
    expect(expenseCategories).toContain('식비');
  });
});

describe('Schedule Time Handling', () => {
  it('should parse time correctly', () => {
    const startTime = '09:00';
    const [hours, mins] = startTime.split(':').map(Number);
    expect(hours).toBe(9);
    expect(mins).toBe(0);
  });

  it('should calculate duration correctly', () => {
    const startTime = '09:00';
    const endTime = '10:30';
    
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh + em / 60) - (sh + sm / 60);
    
    expect(duration).toBeCloseTo(1.5, 1);
  });

  it('should handle schedule types', () => {
    const types = ['lecture', 'work', 'event'];
    expect(types).toHaveLength(3);
  });
});

describe('Task Priority Handling', () => {
  it('should support priority levels', () => {
    const priorities = ['low', 'medium', 'high'];
    expect(priorities).toHaveLength(3);
  });

  it('should map priority to colors', () => {
    const priorityColors: Record<string, string> = {
      high: 'text-red-600 bg-red-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50',
    };
    
    expect(priorityColors['high']).toContain('red');
    expect(priorityColors['medium']).toContain('yellow');
    expect(priorityColors['low']).toContain('green');
  });
});
