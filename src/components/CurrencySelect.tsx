import type { Currency } from '../types';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'UZS', 'RUB', 'CNY'];

interface Props {
  value: Currency;
  onChange: (c: Currency) => void;
  className?: string;
}

export function CurrencySelect({ value, onChange, className = '' }: Props) {
  return (
    <select
      className={`input-field ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
