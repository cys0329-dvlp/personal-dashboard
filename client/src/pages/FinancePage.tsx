// ============================================================
// Finance Page - 가계부
// Design: 웜 어스톤 생산성 대시보드
// Features: 수입/지출 등록/수정/삭제, 카테고리별 월 요약
// ============================================================

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, X } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, TransactionType } from '@/lib/types';
import { formatCurrency, formatDisplayDate, getCategoryColor, MONTH_NAMES, today } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// ---- Transaction Form Modal ----
interface TransactionFormProps {
  initial?: Transaction;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function TransactionForm({ initial, onSave, onClose }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense');
  const [title, setTitle] = useState(initial?.title || '');
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : '');
  const [date, setDate] = useState(initial?.date || today());
  const [category, setCategory] = useState(initial?.category || '');
  const [detail, setDetail] = useState(initial?.detail || '');
  const [account, setAccount] = useState(initial?.account || '');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !date || !category) return;
    onSave({ type, title: title.trim(), amount: Number(amount), date, category: category as any, detail: detail.trim(), account: account.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="warm-card w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
            {initial ? '내역 수정' : '내역 등록'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold transition-colors",
                type === 'income' ? "bg-green-500 text-white" : "bg-transparent text-muted-foreground hover:bg-secondary"
              )}
            >
              수입
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold transition-colors",
                type === 'expense' ? "bg-red-500 text-white" : "bg-transparent text-muted-foreground hover:bg-secondary"
              )}
            >
              지출
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">제목 *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="내역 제목" required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">금액 *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₩</span>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0" required min="0"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">날짜 *</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">카테고리 *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat} type="button" onClick={() => setCategory(cat)}
                  className={cn(
                    "py-1.5 px-2 text-xs rounded-lg border transition-all font-medium",
                    category === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 hover:bg-secondary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">계좌/결제수단</label>
            <input
              type="text" value={account} onChange={e => setAccount(e.target.value)}
              placeholder="예: 신한카드, 현금"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">상세 내용</label>
            <textarea
              value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="메모를 입력하세요" rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
              취소
            </button>
            <button
              type="submit" disabled={!title || !amount || !category}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {initial ? '수정 완료' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Finance Page ----
export default function FinancePage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useDashboard();
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const monthTransactions = useMemo(() =>
    transactions.filter(t => t.date.startsWith(monthKey))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, monthKey]
  );

  const filtered = useMemo(() =>
    filterType === 'all' ? monthTransactions : monthTransactions.filter(t => t.type === filterType),
    [monthTransactions, filterType]
  );

  const totalIncome = useMemo(() => monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTransactions]);
  const totalExpense = useMemo(() => monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTransactions]);
  const balance = totalIncome - totalExpense;

  const categoryExpense = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  const categoryIncome = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  // 6-month trend
  const trendData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = viewMonth - i;
      let y = viewYear;
      if (m < 0) { m += 12; y -= 1; }
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      const monthT = transactions.filter(t => t.date.startsWith(key));
      result.push({
        name: `${m + 1}월`,
        수입: monthT.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        지출: monthT.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }, [transactions, viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleSave = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editTarget) {
      updateTransaction(editTarget.id, data);
    } else {
      addTransaction(data);
    }
    setShowForm(false);
    setEditTarget(null);
  };

  const handleEdit = (t: Transaction) => {
    setEditTarget(t);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 내역을 삭제하시겠습니까?')) {
      deleteTransaction(id);
    }
  };

  // Group transactions by date for list display
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="p-6 space-y-5">
      {/* Month navigation */}
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
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          내역 등록
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="warm-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">총 수입</span>
          </div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <div className="text-xs text-muted-foreground mt-1">{monthTransactions.filter(t => t.type === 'income').length}건</div>
        </div>
        <div className="warm-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-500" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">총 지출</span>
          </div>
          <div className="text-xl font-bold text-red-500">{formatCurrency(totalExpense)}</div>
          <div className="text-xs text-muted-foreground mt-1">{monthTransactions.filter(t => t.type === 'expense').length}건</div>
        </div>
        <div className="warm-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Wallet size={16} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">잔액</span>
          </div>
          <div className={cn("text-xl font-bold", balance >= 0 ? "text-amber-600" : "text-red-500")}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">수입 - 지출</div>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {(['list', 'summary'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === tab ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === 'list' ? '내역 목록' : '카테고리 요약'}
          </button>
        ))}
      </div>

      {activeTab === 'list' ? (
        <div className="warm-card p-4">
          {/* Filter */}
          <div className="flex gap-2 mb-4 items-center">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                  filterType === f
                    ? f === 'income' ? "bg-green-500 text-white border-green-500"
                      : f === 'expense' ? "bg-red-500 text-white border-red-500"
                      : "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-secondary"
                )}
              >
                {f === 'all' ? '전체' : f === 'income' ? '수입' : '지출'}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length}건</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-3xl mb-2">💸</div>
              <p className="text-sm">이 달의 내역이 없습니다</p>
              <p className="text-xs mt-1">내역 등록 버튼을 눌러 추가하세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByDate.map(([date, dayTransactions]) => {
                const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                return (
                  <div key={date}>
                    {/* Date header */}
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/50">
                      <span className="text-sm font-bold" style={{ color: 'oklch(0.22 0.04 50)' }}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </span>
                      <div className="flex gap-3 text-xs">
                        {dayIncome > 0 && <span className="text-green-600 font-semibold">+{formatCurrency(dayIncome)}</span>}
                        {dayExpense > 0 && <span className="text-red-500 font-semibold">-{formatCurrency(dayExpense)}</span>}
                      </div>
                    </div>
                    {/* Transactions */}
                    <div className="space-y-1.5">
                      {dayTransactions.map(t => (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors group"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: getCategoryColor(t.category) }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">{t.title}</span>
                              <span
                                className="text-xs px-1.5 py-0.5 rounded-md shrink-0 font-medium"
                                style={{
                                  background: getCategoryColor(t.category) + '20',
                                  color: getCategoryColor(t.category)
                                }}
                              >
                                {t.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              {t.account && <span>{t.account}</span>}
                              {t.detail && <span className="truncate">· {t.detail}</span>}
                            </div>
                          </div>
                          <div className={cn(
                            "text-base font-bold shrink-0",
                            t.type === 'income' ? "text-green-600" : "text-red-500"
                          )}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* 6-month trend chart */}
          <div className="warm-card p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: 'oklch(0.22 0.04 50)' }}>
              최근 6개월 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 75)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="수입" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="지출" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Expense by category */}
            <div className="warm-card p-5">
              <h3 className="font-bold text-base mb-4" style={{ color: 'oklch(0.22 0.04 50)' }}>
                지출 카테고리
              </h3>
              {categoryExpense.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">지출 내역이 없습니다</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={categoryExpense} dataKey="value" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                        {categoryExpense.map((entry) => (
                          <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {categoryExpense.map(({ name, value }) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getCategoryColor(name) }} />
                        <span className="text-sm flex-1 truncate">{name}</span>
                        <span className="text-sm font-semibold text-red-500 shrink-0">{formatCurrency(value)}</span>
                        <span className="text-xs text-muted-foreground w-9 text-right shrink-0">
                          {totalExpense > 0 ? Math.round(value / totalExpense * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Income by category */}
            <div className="warm-card p-5">
              <h3 className="font-bold text-base mb-4" style={{ color: 'oklch(0.22 0.04 50)' }}>
                수입 카테고리
              </h3>
              {categoryIncome.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">수입 내역이 없습니다</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={categoryIncome} dataKey="value" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                        {categoryIncome.map((entry) => (
                          <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {categoryIncome.map(({ name, value }) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getCategoryColor(name) }} />
                        <span className="text-sm flex-1 truncate">{name}</span>
                        <span className="text-sm font-semibold text-green-600 shrink-0">{formatCurrency(value)}</span>
                        <span className="text-xs text-muted-foreground w-9 text-right shrink-0">
                          {totalIncome > 0 ? Math.round(value / totalIncome * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <TransactionForm
          initial={editTarget || undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
