// ============================================================
// Calendar Page
// Design: 웜 어스톤 생산성 대시보드
// Shows transactions and tasks on calendar
// ============================================================

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  getDaysInMonth, getFirstDayOfMonth, DAY_NAMES, MONTH_NAMES,
  formatCurrency, today
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Transaction, Task } from '@/lib/types';

export default function CalendarPage() {
  const { transactions, tasks } = useDashboard();
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = today();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1);

  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [transactions]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: { date: string; day: number; isCurrentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth - 1 < 0 ? 11 : viewMonth - 1;
    const y = viewMonth - 1 < 0 ? viewYear - 1 : viewYear;
    cells.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth + 1 > 11 ? 0 : viewMonth + 1;
    const y = viewMonth + 1 > 11 ? viewYear + 1 : viewYear;
    cells.push({ date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, isCurrentMonth: false });
  }

  const selectedTransactions = selectedDate ? (transactionsByDate[selectedDate] || []) : [];
  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

  // Monthly stats
  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthTasks = tasks.filter(t => t.dueDate?.startsWith(monthKey));
  const completedTasks = monthTasks.filter(t => t.completed).length;

  return (
    <div className="p-6 h-full flex flex-col gap-5">
      {/* Month stats bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="warm-card px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold shrink-0">↑</div>
          <div>
            <div className="text-xs text-muted-foreground">이달 수입</div>
            <div className="text-sm font-bold text-green-600">{formatCurrency(monthIncome)}</div>
          </div>
        </div>
        <div className="warm-card px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500 text-sm font-bold shrink-0">↓</div>
          <div>
            <div className="text-xs text-muted-foreground">이달 지출</div>
            <div className="text-sm font-bold text-red-500">{formatCurrency(monthExpense)}</div>
          </div>
        </div>
        <div className="warm-card px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-bold shrink-0">±</div>
          <div>
            <div className="text-xs text-muted-foreground">잔액</div>
            <div className={cn("text-sm font-bold", monthIncome - monthExpense >= 0 ? "text-amber-600" : "text-red-500")}>
              {formatCurrency(monthIncome - monthExpense)}
            </div>
          </div>
        </div>
        <div className="warm-card px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">✓</div>
          <div>
            <div className="text-xs text-muted-foreground">할 일</div>
            <div className="text-sm font-bold text-blue-600">{completedTasks}/{monthTasks.length}개</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-9 h-9 rounded-lg border border-border hover:bg-secondary flex items-center justify-center transition-colors">
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-2xl font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {viewYear}년 {MONTH_NAMES[viewMonth]}
          </h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-lg border border-border hover:bg-secondary flex items-center justify-center transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => { setViewYear(new Date().getFullYear()); setViewMonth(new Date().getMonth()); }}
          className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors font-medium"
        >
          오늘
        </button>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Calendar grid */}
        <div className="flex-1 warm-card p-4 flex flex-col min-h-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "text-center text-xs font-bold py-2",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {cells.map((cell, idx) => {
              const dayTransactions = transactionsByDate[cell.date] || [];
              const dayTasks = tasksByDate[cell.date] || [];
              const isToday = cell.date === todayStr;
              const isSelected = cell.date === selectedDate;
              const dayOfWeek = idx % 7;

              const incomeSum = dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
              const expenseSum = dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
              const hasEvents = dayTransactions.length > 0 || dayTasks.length > 0;

              return (
                <div
                  key={cell.date}
                  onClick={() => setSelectedDate(cell.date === selectedDate ? null : cell.date)}
                  className={cn(
                    "calendar-day cursor-pointer select-none",
                    !cell.isCurrentMonth && "other-month",
                    isToday && "today",
                    isSelected && "ring-2 ring-primary/60 bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                    isToday ? "bg-primary text-white" : "",
                    !isToday && dayOfWeek === 0 ? "text-red-500" : "",
                    !isToday && dayOfWeek === 6 ? "text-blue-500" : "",
                    !isToday && dayOfWeek !== 0 && dayOfWeek !== 6 ? "text-foreground" : ""
                  )}>
                    {cell.day}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {incomeSum > 0 && (
                      <div className="badge-income text-[10px]">
                        +{(incomeSum / 10000).toFixed(0)}만
                      </div>
                    )}
                    {expenseSum > 0 && (
                      <div className="badge-expense text-[10px]">
                        -{(expenseSum / 10000).toFixed(0)}만
                      </div>
                    )}
                    {dayTasks.slice(0, 2).map(t => (
                      <div key={t.id} className={cn("badge-todo text-[10px]", t.completed && "opacity-50 line-through")}>
                        {t.title.length > 6 ? t.title.slice(0, 6) + '…' : t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-72 warm-card p-4 flex flex-col overflow-hidden">
          {selectedDate ? (
            <>
              <h3 className="font-bold text-base mb-4" style={{ color: 'oklch(0.22 0.04 50)' }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </h3>

              <div className="flex-1 overflow-auto space-y-4">
                {selectedTransactions.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">수입/지출</div>
                    <div className="space-y-2">
                      {selectedTransactions.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/60">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{t.title}</div>
                            <div className="text-xs text-muted-foreground">{t.category}{t.account ? ` · ${t.account}` : ''}</div>
                            {t.detail && <div className="text-xs text-muted-foreground truncate">{t.detail}</div>}
                          </div>
                          <div className={cn(
                            "text-sm font-bold ml-2 shrink-0",
                            t.type === 'income' ? "text-green-600" : "text-red-500"
                          )}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTasks.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">할 일</div>
                    <div className="space-y-2">
                      {selectedTasks.map(t => (
                        <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/60">
                          <div className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            t.completed ? "bg-green-500" : "bg-blue-400"
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className={cn("text-sm font-semibold", t.completed && "line-through text-muted-foreground")}>
                              {t.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {t.dueTime && <span>{t.dueTime}</span>}
                              {t.category && <span className="px-1 py-0.5 rounded bg-secondary">{t.category}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTransactions.length === 0 && selectedTasks.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <div className="text-2xl mb-2">📭</div>
                    이 날의 기록이 없습니다
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <CalendarDays size={28} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">날짜를 클릭하세요</p>
                <p className="text-xs text-muted-foreground mt-1">수입/지출 내역과<br />할 일을 확인할 수 있어요</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded" style={{ background: 'oklch(0.92 0.08 145)' }} />
          <span>수입</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded" style={{ background: 'oklch(0.93 0.06 25)' }} />
          <span>지출</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded" style={{ background: 'oklch(0.92 0.06 240)' }} />
          <span>할 일</span>
        </div>
      </div>
    </div>
  );
}
