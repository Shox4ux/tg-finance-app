export type Currency = 'USD' | 'EUR' | 'UZS' | 'RUB' | 'CNY';

export type IncomeFrequency = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  frequency: IncomeFrequency;
  color: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'education'
  | 'utilities'
  | 'travel'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export interface SavingsPlan {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: Currency;
  deadline?: string;
  color: string;
  createdAt: string;
}

export interface IncomeGrowthPlan {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  currency: Currency;
  targetDate: string;
  steps: string[];
  createdAt: string;
}

export interface Alert {
  id: string;
  category?: ExpenseCategory;
  threshold: number;
  currency: Currency;
  period: 'daily' | 'weekly' | 'monthly';
  triggered: boolean;
  triggeredAmount?: number;
  createdAt: string;
}

export type TabId = 'dashboard' | 'income' | 'expenses' | 'plans' | 'analysis' | 'alerts';

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { id: 'food', label: 'Food', icon: '🍔', color: '#FF6B6B' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#45B7D1' },
  { id: 'health', label: 'Health', icon: '💊', color: '#96CEB4' },
  { id: 'entertainment', label: 'Fun', icon: '🎮', color: '#FFEAA7' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#DDA0DD' },
  { id: 'education', label: 'Education', icon: '📚', color: '#98D8C8' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#F7DC6F' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#85C1E9' },
  { id: 'other', label: 'Other', icon: '📦', color: '#BDC3C7' },
];

export const INCOME_COLORS = [
  '#2481cc', '#27AE60', '#E67E22', '#9B59B6', '#E74C3C',
  '#1ABC9C', '#F39C12', '#3498DB', '#E91E63', '#00BCD4',
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  UZS: "so'm",
  RUB: '₽',
  CNY: '¥',
};
