// ============================================================
// Finance Calendar - 수입/지출 캘린더
// 각 날짜에 수입/지출 합계 표시, 카테고리별 색상
// ============================================================

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  getDaysInMonth, getFirstDayOfMonth, DAY_NAMES, MONTH_NAMES,
  formatCurrency, today
} from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function FinanceCalendar() {
  const { transactions } = useDashboard();
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = today();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // 날짜별 거래 내역
  const transactionsByDate = useMemo(() => {
    const map: Record<string, typeof transactions> = {};
    transactions.forEach(t => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [transactions]);

  // 날짜별 합계
  const summaryByDate = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    Object.entries(transactionsByDate).forEach(([date, txns]) => {
      map[date] = {
        income: txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      };
    });
    return map;
  }, [transactionsByDate]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const dateStr = (day: number) => {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const cells = [];
  // 이전 달 빈 칸
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-gray-50 p-2"></div>);
  }
  // 현재 달 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dateStr(day);
    const isToday = date === todayStr;
    const summary = summaryByDate[date] || { income: 0, expense: 0 };
    const dayTxns = transactionsByDate[date] || [];

    cells.push(
      <div
        key={day}
        onClick={() => setSelectedDate(date)}
        className={cn(
          'p-2 border rounded cursor-pointer transition-all min-h-24',
          isToday ? 'bg-yellow-100 border-yellow-400 font-semibold' : 'bg-white border-gray-200 hover:bg-gray-50',
          selectedDate === date ? 'ring-2 ring-amber-500' : ''
        )}
      >
        <div className="text-sm font-semibold text-gray-700 mb-1">{day}</div>
        
        {/* 수입 */}
        {summary.income > 0 && (
          <div className="text-xs text-green-600 font-semibold mb-1">
            +{formatCurrency(summary.income)}
          </div>
        )}
        
        {/* 지출 */}
        {summary.expense > 0 && (
          <div className="text-xs text-red-600 font-semibold mb-1">
            -{formatCurrency(summary.expense)}
          </div>
        )}

        {/* 카테고리별 색상 표시 */}
        {dayTxns.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dayTxns.slice(0, 3).map((txn, idx) => (
              <div
                key={idx}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[txn.category] }}
                title={txn.category}
              />
            ))}
            {dayTxns.length > 3 && (
              <div className="text-xs text-gray-500">+{dayTxns.length - 3}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-6 h-6 text-amber-700" />
        </button>
        <h2 className="text-2xl font-bold text-amber-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
          <ChevronRight className="w-6 h-6 text-amber-700" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {cells}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3">
            {selectedDate} 상세 내역
          </h3>
          
          {transactionsByDate[selectedDate]?.length === 0 ? (
            <p className="text-gray-500">이 날짜에 거래 내역이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {transactionsByDate[selectedDate]?.map(txn => (
                <div key={txn.id} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-800">{txn.title}</div>
                    <div className="text-xs text-gray-500">{txn.category}</div>
                  </div>
                  <div className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
