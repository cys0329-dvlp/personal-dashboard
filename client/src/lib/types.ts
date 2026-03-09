// ============================================================
// Data Types for Personal Dashboard
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

// ---- Finance (가계부) ----
export type TransactionType = 'income' | 'expense';

export const INCOME_CATEGORIES = [
  '급여', '부업', '투자수익', '용돈', '환급', '기타수입'
] as const;

export const EXPENSE_CATEGORIES = [
  '식비', '교통', '쇼핑', '문화/여가', '의료/건강', '통신', '주거/관리비', '교육', '저축/투자', '기타지출'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: TransactionCategory;
  detail?: string;
  account?: string;
  createdAt: string;
}

// ---- Project & Tasks ----
export type ProjectStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  category?: string;
  detail?: string;
  showInCalendar?: boolean; // 캘린더에 표시할지 여부
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;   // YYYY-MM-DDTHH:mm
  endDate: string;     // YYYY-MM-DDTHH:mm
  color?: string;
  createdAt: string;
  deletedAt?: string;  // soft delete for 완료 복구
}

// ---- Category Colors ----
export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  // Income
  '급여': '#10b981',
  '부업': '#06b6d4',
  '투자수익': '#f59e0b',
  '용돈': '#8b5cf6',
  '환급': '#ec4899',
  '기타수입': '#6b7280',
  // Expense
  '식비': '#ef4444',
  '교통': '#f97316',
  '쇼핑': '#ec4899',
  '문화/여가': '#8b5cf6',
  '의료/건강': '#06b6d4',
  '통신': '#3b82f6',
  '주거/관리비': '#f59e0b',
  '교육': '#10b981',
  '저축/투자': '#06b6d4',
  '기타지출': '#6b7280',
};

// ---- Schedule (일정) ----
export type ScheduleType = 'lecture' | 'work' | 'event';

export interface Schedule {
  id: string;
  title: string;
  type: ScheduleType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  description?: string;
  color?: string; // 사용자가 직접 지정한 색상
  repeatType?: 'none' | 'weekly' | 'monthly'; // 반복 타입
  repeatEndDate?: string; // YYYY-MM-DD (반복 종료일)
  repeatDays?: number[]; // 0-6 (일-토)
  parentId?: string; // 원본 반복 일정 ID
  createdAt: string;
}

// ---- Schedule Color Presets ----
export const SCHEDULE_COLOR_PRESETS = [
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
] as const;

export const DEFAULT_SCHEDULE_COLORS: Record<ScheduleType, string> = {
  'lecture': '#3b82f6',  // Blue
  'work': '#ef4444',     // Red
  'event': '#8b5cf6',    // Purple
};

// ---- Income Allocation (월별 수입 배분) ----
export interface IncomeAllocation {
  id: string;
  month: string; // YYYY-MM
  categories: {
    [key: string]: number; // 카테고리: 퍼센테이지
  };
  createdAt: string;
  updatedAt: string;
}

// ---- Calendar ----
export interface CalendarEvent {
  id: string;
  sourceType: 'transaction' | 'task' | 'schedule';
  sourceId: string;
  date: string;
  title: string;
  color: string;
  amount?: number;
  transactionType?: TransactionType;
  startTime?: string;
  endTime?: string;
}
