import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useFinanceStore, selectMonthlyIncome } from '../store/useFinanceStore';
import { Sheet } from '../components/Sheet';
import { fmt, uid } from '../utils/format';
import { INCOME_COLORS, type IncomeSource, type IncomeFrequency } from '../types';
import { useT } from '../i18n';

const MONTHLY_MULTIPLIER: Record<IncomeFrequency, number> = {
  'one-time': 0, daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12,
};

const defaultForm = (): Omit<IncomeSource, 'id' | 'createdAt'> => ({
  name: '', amount: 0, currency: 'USD', frequency: 'monthly', color: INCOME_COLORS[0],
});

export function Income() {
  const t = useT();
  const incomeSources = useFinanceStore((s) => s.incomeSources);
  const addIncomeSource = useFinanceStore((s) => s.addIncomeSource);
  const updateIncomeSource = useFinanceStore((s) => s.updateIncomeSource);
  const deleteIncomeSource = useFinanceStore((s) => s.deleteIncomeSource);
  const monthlyIncome = useFinanceStore(selectMonthlyIncome);
  const defaultCurrency = useFinanceStore((s) => s.currency);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const FREQ_LABELS: Record<IncomeFrequency, string> = {
    'one-time': t('freq_one_time'), daily: t('freq_daily'), weekly: t('freq_weekly'),
    monthly: t('freq_monthly'), yearly: t('freq_yearly'),
  };

  const openAdd = () => {
    setForm({ ...defaultForm(), currency: defaultCurrency });
    setEditId(null);
    setSheetOpen(true);
  };

  const openEdit = (src: IncomeSource) => {
    setForm({ name: src.name, amount: src.amount, currency: src.currency, frequency: src.frequency, color: src.color });
    setEditId(src.id);
    setSheetOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || form.amount <= 0) return;
    if (editId) {
      updateIncomeSource(editId, form);
    } else {
      const colorIdx = incomeSources.length % INCOME_COLORS.length;
      addIncomeSource({ id: uid(), ...form, color: INCOME_COLORS[colorIdx], createdAt: new Date().toISOString() });
    }
    setSheetOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-6 slide-up">
      <div className="px-5 pt-5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('income_title')}</h2>
          <p className="text-sm text-hint mt-0.5">
            {t('income_monthly_total')}: <span className="font-semibold" style={{ color: '#27AE60' }}>{fmt(monthlyIncome, defaultCurrency)}</span>
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1">
          <Plus size={16} /> {t('add')}
        </button>
      </div>

      {incomeSources.length === 0 ? (
        <div className="mx-5 card flex flex-col items-center py-10 gap-3">
          <span className="text-4xl">💰</span>
          <p className="text-sm text-hint text-center" style={{ whiteSpace: 'pre-line' }}>{t('income_empty')}</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1">
            <Plus size={14} /> {t('income_add')}
          </button>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3">
          {incomeSources.map((src) => {
            const monthly = src.amount * MONTHLY_MULTIPLIER[src.frequency];
            return (
              <div key={src.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold" style={{ backgroundColor: src.color }}>
                  {src.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{src.name}</p>
                  <p className="text-xs text-hint">{fmt(src.amount, src.currency)} / {FREQ_LABELS[src.frequency]}</p>
                  {src.frequency !== 'monthly' && src.frequency !== 'one-time' && (
                    <p className="text-xs" style={{ color: '#27AE60' }}>≈ {fmt(monthly, src.currency)}/{t('income_monthly_lbl')}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(src)} className="p-2 rounded-xl active:opacity-60" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteIncomeSource(src.id)} className="p-2 rounded-xl active:opacity-60" style={{ color: '#E74C3C' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editId ? t('income_edit') : t('income_add')}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="section-title block">{t('income_name')}</label>
            <input className="input-field" placeholder={t('income_name_ph')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="section-title block">{t('income_amount')}</label>
            <input className="input-field" type="number" placeholder="0" value={form.amount || ''} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="section-title block">{t('income_frequency')}</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FREQ_LABELS) as IncomeFrequency[]).map((freq) => (
                <button
                  key={freq}
                  className="rounded-xl py-2 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: form.frequency === freq ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
                    color: form.frequency === freq ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color, #000)',
                  }}
                  onClick={() => setForm((f) => ({ ...f, frequency: freq }))}
                >
                  {FREQ_LABELS[freq]}
                </button>
              ))}
            </div>
          </div>
          {form.frequency !== 'one-time' && form.amount > 0 && (
            <div className="rounded-xl p-3 text-center text-sm" style={{ backgroundColor: 'rgba(39,174,96,0.1)' }}>
              {t('income_monthly_lbl')}: <span className="font-bold" style={{ color: '#27AE60' }}>
                {fmt(form.amount * MONTHLY_MULTIPLIER[form.frequency as IncomeFrequency], defaultCurrency)}/{t('income_monthly_lbl')}
              </span>
            </div>
          )}
          <button onClick={save} className="btn-primary w-full mt-2">
            {editId ? t('income_save') : t('income_add')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
