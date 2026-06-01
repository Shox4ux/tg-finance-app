import { CURRENCY_SYMBOLS, type Currency } from '../types';

export const fmt = (amount: number, currency: Currency): string => {
  const sym = CURRENCY_SYMBOLS[currency];
  if (currency === 'UZS') return `${amount.toLocaleString()} ${sym}`;
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const pct = (val: number, total: number): number =>
  total === 0 ? 0 : Math.round((val / total) * 100);
