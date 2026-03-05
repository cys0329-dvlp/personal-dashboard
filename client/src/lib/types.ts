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
  projectId: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  category?: string;
  detail?: string;
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

// ---- Calendar ----
export interface CalendarEvent {
  id: string;
  sourceType: 'transaction' | 'task';
  sourceId: string;
  date: string;
  title: string;
  color: string;
  amount?: number;
  transactionType?: TransactionType;
}
