import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useFinanceStore, selectMonthlyIncome, selectMonthlyExpenses } from '../store/useFinanceStore';
import { fmt } from '../utils/format';
import { EXPENSE_CATEGORIES } from '../types';
import { useT } from '../i18n';

type Period = '7d' | '30d' | '90d' | 'all';

const CUSTOM_TOOLTIP = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: 'var(--tg-theme-bg-color)', border: '1px solid rgba(0,0,0,0.1)' }}>
        <p className="font-semibold">{payload[0].name}</p>
        <p style={{ color: '#E74C3C' }}>{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function Analysis() {
  const t = useT();
  const expenses = useFinanceStore((s) => s.expenses);
  const currency = useFinanceStore((s) => s.currency);
  const monthlyIncome = useFinanceStore(selectMonthlyIncome);
  const monthlyExpenses = useFinanceStore(selectMonthlyExpenses);

  const PERIOD_LABELS: Record<Period, string> = {
    '7d': t('an_7d'), '30d': t('an_30d'), '90d': t('an_90d'), all: t('an_all'),
  };

  const [period, setPeriod] = useState<Period>('30d');

  const cutoff = useMemo(() => {
    const d = new Date();
    if (period === '7d') d.setDate(d.getDate() - 7);
    else if (period === '30d') d.setDate(d.getDate() - 30);
    else if (period === '90d') d.setDate(d.getDate() - 90);
    else return new Date(0);
    return d;
  }, [period]);

  const filtered = useMemo(() => expenses.filter((e) => new Date(e.date) >= cutoff), [expenses, cutoff]);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    return EXPENSE_CATEGORIES
      .map((cat) => ({ name: cat.label, value: map[cat.id] ?? 0, color: cat.color, icon: cat.icon }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.date] = (map[e.date] ?? 0) + e.amount; });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount: Math.round(amount),
      }));
  }, [filtered]);

  const topExpenses = useMemo(() => [...filtered].sort((a, b) => b.amount - a.amount).slice(0, 5), [filtered]);

  const savingsRate = monthlyIncome > 0
    ? Math.max(0, Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-5 pb-6 slide-up w-full">
      <div className="px-5 pt-5">
        <h2 className="text-2xl font-bold">{t('an_title')}</h2>
      </div>

      <div className="px-5">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: period === p ? 'var(--tg-theme-bg-color, #fff)' : 'transparent',
                color: period === p ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-hint-color)',
                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-5 card flex flex-col items-center py-10 gap-2">
          <span className="text-4xl">📊</span>
          <p className="text-sm text-hint text-center" style={{ whiteSpace: 'pre-line' }}>{t('an_empty')}</p>
        </div>
      ) : (
        <>
          <div className="px-5 grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xs text-hint mb-1">{t('an_total')}</p>
              <p className="font-bold text-sm" style={{ color: '#E74C3C' }}>{fmt(total, currency)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-hint mb-1">{t('an_avg')}</p>
              <p className="font-bold text-sm">
                {fmt(total / Math.max(1, (period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : filtered.length)), currency)}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-hint mb-1">{t('an_savings_rate')}</p>
              <p className="font-bold text-sm" style={{ color: savingsRate > 20 ? '#27AE60' : savingsRate > 0 ? '#E67E22' : '#E74C3C' }}>
                {savingsRate}%
              </p>
            </div>
          </div>

          <div className="px-5">
            <p className="section-title">{t('an_monthly_balance')}</p>
            <div className="card">
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-xs text-hint">{t('an_income')}</p>
                  <p className="font-bold" style={{ color: '#27AE60' }}>{fmt(monthlyIncome, currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-hint">{t('an_expenses')}</p>
                  <p className="font-bold" style={{ color: '#E74C3C' }}>{fmt(monthlyExpenses, currency)}</p>
                </div>
              </div>
              {monthlyIncome > 0 && (
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-3 rounded-full" style={{ width: `${Math.min(100, (monthlyExpenses / monthlyIncome) * 100)}%`, backgroundColor: monthlyExpenses > monthlyIncome ? '#E74C3C' : '#E67E22' }} />
                </div>
              )}
            </div>
          </div>

          {categoryData.length > 0 && (
            <div className="px-5">
              <p className="section-title">{t('an_by_cat')}</p>
              <div className="card">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm flex-1">{cat.icon} {cat.name}</span>
                      <span className="text-sm font-semibold">{fmt(cat.value, currency)}</span>
                      <span className="text-xs text-hint w-8 text-right">{Math.round((cat.value / total) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {dailyData.length > 1 && (
            <div className="px-5">
              <p className="section-title">{t('an_daily')}</p>
              <div className="card">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--tg-theme-hint-color, #999)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--tg-theme-hint-color, #999)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Bar dataKey="amount" name="Spent" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {topExpenses.length > 0 && (
            <div className="px-5">
              <p className="section-title">{t('an_top')}</p>
              <div className="flex flex-col gap-2">
                {topExpenses.map((exp, i) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.id === exp.category)!;
                  return (
                    <div key={exp.id} className="card flex items-center gap-3">
                      <span className="font-bold text-sm text-hint w-5 shrink-0">#{i + 1}</span>
                      <span className="text-xl">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{exp.title}</p>
                        <p className="text-xs text-hint">{cat.label}</p>
                      </div>
                      <span className="font-bold text-sm" style={{ color: '#E74C3C' }}>{fmt(exp.amount, exp.currency)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
