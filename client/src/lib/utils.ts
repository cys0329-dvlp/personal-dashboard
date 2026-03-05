import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (Korean Won)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format datetime to YYYY-MM-DDTHH:mm
export function formatDateTime(date: Date): string {
  return `${formatDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Parse YYYY-MM-DD to Date
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Get days in month
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0=Sun, 1=Mon, ...)
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Korean month names
export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Get today's date string
export function today(): string {
  return formatDate(new Date());
}

// Format display date (M월 D일)
export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// Format datetime display
export function formatDisplayDateTime(datetimeStr: string): string {
  const d = new Date(datetimeStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Category color mapping
export const CATEGORY_COLORS: Record<string, string> = {
  '급여': '#D97706',
  '부업': '#F59E0B',
  '투자수익': '#10B981',
  '용돈': '#F97316',
  '환급': '#84CC16',
  '기타수입': '#6B7280',
  '식비': '#EF4444',
  '교통': '#3B82F6',
  '쇼핑': '#EC4899',
  '문화/여가': '#8B5CF6',
  '의료/건강': '#14B8A6',
  '통신': '#6366F1',
  '주거/관리비': '#78716C',
  '교육': '#0EA5E9',
  '저축/투자': '#22C55E',
  '기타지출': '#9CA3AF',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#9CA3AF';
}
