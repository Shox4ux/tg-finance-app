import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  IncomeSource, Expense, SavingsPlan, IncomeGrowthPlan, Alert, Currency, TabId,
} from '../types';
import type { LangCode } from '../i18n';

interface FinanceState {
  currency: Currency;
  language: LangCode;
  tgUserId: string | null;
  activeTab: TabId;
  incomeSources: IncomeSource[];
  expenses: Expense[];
  savingsPlans: SavingsPlan[];
  growthPlans: IncomeGrowthPlan[];
  alerts: Alert[];

  setCurrency: (c: Currency) => void;
  setLanguage: (l: LangCode) => void;
  setTgUserId: (id: string) => void;
  loadFromServer: (userId: string) => Promise<void>;
  saveToServer: (userId: string) => Promise<void>;
  setActiveTab: (tab: TabId) => void;

  // Income
  addIncomeSource: (src: IncomeSource) => void;
  updateIncomeSource: (id: string, patch: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;

  // Expenses
  addExpense: (exp: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Savings
  addSavingsPlan: (plan: SavingsPlan) => void;
  updateSavingsPlan: (id: string, patch: Partial<SavingsPlan>) => void;
  deleteSavingsPlan: (id: string) => void;

  // Growth plans
  addGrowthPlan: (plan: IncomeGrowthPlan) => void;
  updateGrowthPlan: (id: string, patch: Partial<IncomeGrowthPlan>) => void;
  deleteGrowthPlan: (id: string) => void;

  // Alerts
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, patch: Partial<Alert>) => void;
  deleteAlert: (id: string) => void;
  checkAlerts: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      language: 'en',
      tgUserId: null,
      activeTab: 'dashboard',
      incomeSources: [],
      expenses: [],
      savingsPlans: [],
      growthPlans: [],
      alerts: [],

      setCurrency: (c) => set((s) => ({
        currency: c,
        incomeSources: s.incomeSources.map((x) => ({ ...x, currency: c })),
        expenses: s.expenses.map((x) => ({ ...x, currency: c })),
        savingsPlans: s.savingsPlans.map((x) => ({ ...x, currency: c })),
        growthPlans: s.growthPlans.map((x) => ({ ...x, currency: c })),
        alerts: s.alerts.map((x) => ({ ...x, currency: c })),
      })),
      setLanguage: (l) => set({ language: l }),
      setTgUserId: (id) => set({ tgUserId: id }),

      loadFromServer: async (userId) => {
        try {
          const res = await fetch(`/api/data/${userId}`);
          const data = await res.json();
          if (data) {
            set({
              currency: data.currency ?? 'USD',
              language: data.language ?? 'en',
              incomeSources: data.incomeSources ?? [],
              expenses: data.expenses ?? [],
              savingsPlans: data.savingsPlans ?? [],
              growthPlans: data.growthPlans ?? [],
              alerts: data.alerts ?? [],
            });
          }
        } catch { /* keep local data */ }
      },

      saveToServer: async (userId) => {
        const s = get();
        try {
          await fetch(`/api/data/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currency: s.currency,
              language: s.language,
              incomeSources: s.incomeSources,
              expenses: s.expenses,
              savingsPlans: s.savingsPlans,
              growthPlans: s.growthPlans,
              alerts: s.alerts,
            }),
          });
        } catch { /* ignore */ }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      addIncomeSource: (src) => set((s) => ({ incomeSources: [...s.incomeSources, src] })),
      updateIncomeSource: (id, patch) =>
        set((s) => ({ incomeSources: s.incomeSources.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteIncomeSource: (id) =>
        set((s) => ({ incomeSources: s.incomeSources.filter((x) => x.id !== id) })),

      addExpense: (exp) => set((s) => ({ expenses: [...s.expenses, exp] })),
      updateExpense: (id, patch) =>
        set((s) => ({ expenses: s.expenses.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),

      addSavingsPlan: (plan) => set((s) => ({ savingsPlans: [...s.savingsPlans, plan] })),
      updateSavingsPlan: (id, patch) =>
        set((s) => ({ savingsPlans: s.savingsPlans.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteSavingsPlan: (id) =>
        set((s) => ({ savingsPlans: s.savingsPlans.filter((x) => x.id !== id) })),

      addGrowthPlan: (plan) => set((s) => ({ growthPlans: [...s.growthPlans, plan] })),
      updateGrowthPlan: (id, patch) =>
        set((s) => ({ growthPlans: s.growthPlans.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteGrowthPlan: (id) =>
        set((s) => ({ growthPlans: s.growthPlans.filter((x) => x.id !== id) })),

      addAlert: (alert) => set((s) => ({ alerts: [...s.alerts, alert] })),
      updateAlert: (id, patch) =>
        set((s) => ({ alerts: s.alerts.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((x) => x.id !== id) })),

      checkAlerts: () => {
        const { expenses, alerts, currency } = get();
        const now = new Date();

        const updatedAlerts = alerts.map((alert) => {
          const start = new Date(now);
          if (alert.period === 'daily') start.setDate(start.getDate() - 1);
          else if (alert.period === 'weekly') start.setDate(start.getDate() - 7);
          else start.setMonth(start.getMonth() - 1);

          const relevant = expenses.filter((e) => {
            const d = new Date(e.date);
            const matchCurrency = e.currency === (alert.currency || currency);
            const matchCategory = !alert.category || e.category === alert.category;
            return d >= start && d <= now && matchCurrency && matchCategory;
          });

          const total = relevant.reduce((sum, e) => sum + e.amount, 0);
          return { ...alert, triggered: total >= alert.threshold, triggeredAmount: total };
        });

        set({ alerts: updatedAlerts });
      },
    }),
    { name: 'finance-store-v1' }
  )
);

// Selectors
export const selectMonthlyIncome = (s: FinanceState): number => {
  return s.incomeSources.reduce((sum, src) => {
    const multipliers: Record<string, number> = {
      'one-time': 0,
      daily: 30,
      weekly: 4.33,
      monthly: 1,
      yearly: 1 / 12,
    };
    return sum + src.amount * (multipliers[src.frequency] ?? 1);
  }, 0);
};

export const selectMonthlyExpenses = (s: FinanceState): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return s.expenses
    .filter((e) => new Date(e.date) >= start)
    .reduce((sum, e) => sum + e.amount, 0);
};
