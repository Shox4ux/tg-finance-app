import { useState } from 'react';
import { Plus, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Sheet } from '../components/Sheet';
import { fmt, uid, todayISO, fmtDate } from '../utils/format';
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory, type Currency } from '../types';
import { useT } from '../i18n';

const defaultForm = (currency: Currency): Omit<Expense, 'id'> => ({
  title: '', amount: 0, currency, category: 'food', date: todayISO(), note: '',
});

export function Expenses() {
  const t = useT();
  const expenses = useFinanceStore((s) => s.expenses);
  const addExpense = useFinanceStore((s) => s.addExpense);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);
  const defaultCurrency = useFinanceStore((s) => s.currency);
  const checkAlerts = useFinanceStore((s) => s.checkAlerts);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(() => defaultForm(defaultCurrency));
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const openAdd = () => { setForm(defaultForm(defaultCurrency)); setSheetOpen(true); };

  const save = () => {
    if (!form.title.trim() || form.amount <= 0) return;
    addExpense({ id: uid(), ...form });
    checkAlerts();
    setSheetOpen(false);
  };

  const filtered = expenses
    .filter((e) => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const getCat = (id: string) => EXPENSE_CATEGORIES.find((c) => c.id === id)!;

  const grouped: Record<string, Expense[]> = {};
  filtered.forEach((e) => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });
  const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="flex flex-col gap-4 pb-6 slide-up">
      <div className="px-5 pt-5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('exp_title')}</h2>
          {filtered.length > 0 && (
            <p className="text-sm text-hint mt-0.5">
              {filtered.length} {t('exp_items')} · <span style={{ color: '#E74C3C' }}>{fmt(totalFiltered, defaultCurrency)}</span>
            </p>
          )}
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1">
          <Plus size={16} /> {t('add')}
        </button>
      </div>

      <div className="px-5 flex gap-2">
        <div className="flex-1 flex items-center gap-2 input-field rounded-xl">
          <Search size={15} className="shrink-0 text-hint" />
          <input className="bg-transparent flex-1 text-sm outline-none" placeholder={t('exp_search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters((v) => !v)} className="input-field rounded-xl px-3 flex items-center gap-1 shrink-0" style={{ color: showFilters ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}>
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {showFilters && (
        <div className="px-5 flex gap-2 overflow-x-auto pb-1">
          <CategoryChip active={filterCategory === 'all'} label={t('al_all_cats')} icon="📋" onClick={() => setFilterCategory('all')} />
          {EXPENSE_CATEGORIES.map((cat) => (
            <CategoryChip key={cat.id} active={filterCategory === cat.id} label={cat.label} icon={cat.icon} onClick={() => setFilterCategory(cat.id)} />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mx-5 card flex flex-col items-center py-10 gap-3">
          <span className="text-4xl">💳</span>
          <p className="text-sm text-hint text-center" style={{ whiteSpace: 'pre-line' }}>{t('exp_empty')}</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1">
            <Plus size={14} /> {t('exp_add')}
          </button>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-4">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <p className="section-title mb-0">{fmtDate(date)}</p>
                <p className="text-xs text-hint">{fmt(grouped[date].reduce((s, e) => s + e.amount, 0), defaultCurrency)}</p>
              </div>
              <div className="flex flex-col gap-2">
                {grouped[date].map((exp) => {
                  const cat = getCat(exp.category);
                  return (
                    <div key={exp.id} className="card flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: `${cat.color}20` }}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{exp.title}</p>
                        <p className="text-xs text-hint">{cat.label}{exp.note ? ` · ${exp.note}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm shrink-0" style={{ color: '#E74C3C' }}>-{fmt(exp.amount, exp.currency)}</span>
                        <button onClick={() => deleteExpense(exp.id)} className="p-1.5 rounded-lg active:opacity-60 shrink-0" style={{ color: 'var(--tg-theme-hint-color)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('exp_add')}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="section-title block">{t('exp_name')}</label>
            <input className="input-field" placeholder={t('exp_name_ph')} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="section-title block">{t('exp_amount')}</label>
            <input className="input-field" type="number" placeholder="0" value={form.amount || ''} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="section-title block">{t('exp_category')}</label>
            <div className="grid grid-cols-5 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all"
                  style={{ backgroundColor: form.category === cat.id ? `${cat.color}30` : 'var(--tg-theme-secondary-bg-color)', border: form.category === cat.id ? `2px solid ${cat.color}` : '2px solid transparent' }}>
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-title block">{t('exp_date')}</label>
            <input className="input-field" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="section-title block">{t('exp_note')}</label>
            <input className="input-field" placeholder={t('exp_note_ph')} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
          <button onClick={save} className="btn-primary w-full mt-2">{t('exp_add')}</button>
        </div>
      </Sheet>
    </div>
  );
}

function CategoryChip({ active, label, icon, onClick }: { active: boolean; label: string; icon: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all"
      style={{ backgroundColor: active ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color)', color: active ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color)' }}>
      {icon} {label}
    </button>
  );
}
