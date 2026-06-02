import { TrendingUp, TrendingDown, PiggyBank, Bell, Plus } from 'lucide-react';
import { useFinanceStore, selectMonthlyIncome, selectMonthlyExpenses } from '../store/useFinanceStore';
import { CurrencySelect } from '../components/CurrencySelect';
import { fmt, fmtDate } from '../utils/format';
import { EXPENSE_CATEGORIES, type Currency } from '../types';
import { useT } from '../i18n';
import type { LangCode } from '../i18n';

const LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
];

export function Dashboard() {
  const t = useT();
  const currency = useFinanceStore((s) => s.currency);
  const setCurrency = useFinanceStore((s) => s.setCurrency);
  const language = useFinanceStore((s) => s.language);
  const setLanguage = useFinanceStore((s) => s.setLanguage);
  const expenses = useFinanceStore((s) => s.expenses);
  const savingsPlans = useFinanceStore((s) => s.savingsPlans);
  const alerts = useFinanceStore((s) => s.alerts);
  const setActiveTab = useFinanceStore((s) => s.setActiveTab);
  const monthlyIncome = useFinanceStore(selectMonthlyIncome);
  const monthlyExpenses = useFinanceStore(selectMonthlyExpenses);

  const balance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryInfo = (id: string) =>
    EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

  return (
    <div className="flex flex-col gap-4 pb-6 slide-up sm:max-w-3xl">
      {/* Header */}
      <div className="px-5 pt-5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-hint">{t('dash_balance')}</p>
          <h1 className="text-4xl font-bold mt-1" style={{ color: balance >= 0 ? '#27AE60' : '#E74C3C' }}>
            {balance >= 0 ? '+' : ''}{fmt(balance, currency)}
          </h1>
          <p className="text-sm text-hint mt-1">
            {savingsRate >= 0 ? `${t('dash_saving')} ${savingsRate}${t('dash_of_income')}` : t('dash_overspending')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <CurrencySelect value={currency as Currency} onChange={(c) => setCurrency(c)} className="w-20 text-sm" />
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                style={{
                  backgroundColor: language === l.code ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color)',
                  color: language === l.code ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-hint-color)',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={t('dash_monthly_income')}
          value={fmt(monthlyIncome, currency)}
          icon={<TrendingUp size={18} />}
          color="#27AE60"
          onClick={() => setActiveTab('income')}
        />
        <StatCard
          label={t('dash_monthly_expenses')}
          value={fmt(monthlyExpenses, currency)}
          icon={<TrendingDown size={18} />}
          color="#E74C3C"
          onClick={() => setActiveTab('expenses')}
        />
        <StatCard
          label={t('dash_savings_goals')}
          value={`${savingsPlans.length} ${t('dash_active')}`}
          icon={<PiggyBank size={18} />}
          color="#9B59B6"
          onClick={() => setActiveTab('plans')}
        />
        <StatCard
          label={t('dash_active_alerts')}
          value={`${triggeredAlerts.length} ${t('dash_triggered')}`}
          icon={<Bell size={18} />}
          color={triggeredAlerts.length > 0 ? '#E74C3C' : '#999'}
          onClick={() => setActiveTab('alerts')}
        />
      </div>

      {/* Triggered alerts banner */}
      {triggeredAlerts.length > 0 && (
        <div className="mx-5 rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: '#FFF3F3', border: '1px solid #FFD5D5' }}>
          <Bell size={18} className="mt-0.5 shrink-0" style={{ color: '#E74C3C' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#E74C3C' }}>
              {triggeredAlerts.length} {t('dash_alerts_banner')}
            </p>
            <p className="text-xs mt-0.5 text-hint">{t('dash_alerts_tap')}</p>
          </div>
        </div>
      )}

      {/* Savings plans progress */}
      {savingsPlans.length > 0 && (
        <div className="px-5">
          <p className="section-title">{t('dash_savings_progress')}</p>
          <div className="flex flex-col gap-2">
            {savingsPlans.slice(0, 3).map((plan) => {
              const pct = plan.targetAmount > 0 ? Math.min(100, Math.round((plan.savedAmount / plan.targetAmount) * 100)) : 0;
              return (
                <div key={plan.id} className="card">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{plan.name}</span>
                    <span className="text-sm font-semibold" style={{ color: plan.color }}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: plan.color }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-hint">{fmt(plan.savedAmount, plan.currency)}</span>
                    <span className="text-xs text-hint">{fmt(plan.targetAmount, plan.currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-2">
          <p className="section-title mb-0">{t('dash_recent')}</p>
          <button className="text-xs font-medium text-link" onClick={() => setActiveTab('expenses')}>{t('dash_view_all')}</button>
        </div>
        {recentExpenses.length === 0 ? (
          <div className="card flex flex-col items-center py-8 gap-2">
            <span className="text-3xl">📊</span>
            <p className="text-sm text-hint">{t('dash_no_expenses')}</p>
            <button className="btn-primary mt-2 flex items-center gap-1" onClick={() => setActiveTab('expenses')}>
              <Plus size={14} /> {t('dash_add_expense')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentExpenses.map((exp) => {
              const cat = getCategoryInfo(exp.category);
              return (
                <div key={exp.id} className="card flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{exp.title}</p>
                    <p className="text-xs text-hint">{fmtDate(exp.date)} · {cat.label}</p>
                  </div>
                  <span className="font-semibold text-sm shrink-0" style={{ color: '#E74C3C' }}>
                    -{fmt(exp.amount, exp.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, onClick }: {
  label: string; value: string; icon: React.ReactNode; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card text-left active:opacity-70 transition-opacity">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-hint">{label}</span>
      </div>
      <p className="font-bold text-base">{value}</p>
    </button>
  );
}
