import { useState } from 'react';
import { Plus, Trash2, Pencil, PlusCircle, Target, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Sheet } from '../components/Sheet';
import { CurrencySelect } from '../components/CurrencySelect';
import { fmt, uid, fmtDate } from '../utils/format';
import { INCOME_COLORS, type SavingsPlan, type IncomeGrowthPlan, type Currency } from '../types';

type PlanTab = 'savings' | 'growth';

// ── Savings Plans ──────────────────────────────────────────────────────────

const defaultSavingsForm = (currency: Currency): Omit<SavingsPlan, 'id' | 'createdAt'> => ({
  name: '',
  targetAmount: 0,
  savedAmount: 0,
  currency,
  deadline: '',
  color: INCOME_COLORS[2],
});

function SavingsPlans() {
  const plans = useFinanceStore((s) => s.savingsPlans);
  const addPlan = useFinanceStore((s) => s.addSavingsPlan);
  const updatePlan = useFinanceStore((s) => s.updateSavingsPlan);
  const deletePlan = useFinanceStore((s) => s.deleteSavingsPlan);
  const defaultCurrency = useFinanceStore((s) => s.currency);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [depositSheet, setDepositSheet] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultSavingsForm(defaultCurrency));

  const openAdd = () => {
    setForm({ ...defaultSavingsForm(defaultCurrency), color: INCOME_COLORS[plans.length % INCOME_COLORS.length] });
    setEditId(null);
    setSheetOpen(true);
  };

  const openEdit = (p: SavingsPlan) => {
    setForm({ name: p.name, targetAmount: p.targetAmount, savedAmount: p.savedAmount, currency: p.currency, deadline: p.deadline ?? '', color: p.color });
    setEditId(p.id);
    setSheetOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || form.targetAmount <= 0) return;
    if (editId) {
      updatePlan(editId, form);
    } else {
      addPlan({ id: uid(), ...form, createdAt: new Date().toISOString() });
    }
    setSheetOpen(false);
  };

  const deposit = (planId: string) => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    const plan = plans.find((p) => p.id === planId);
    if (plan) updatePlan(planId, { savedAmount: plan.savedAmount + amount });
    setDepositSheet(null);
    setDepositAmount('');
  };

  return (
    <div className="flex flex-col gap-3">
      {plans.length === 0 ? (
        <div className="card flex flex-col items-center py-10 gap-3">
          <span className="text-4xl">🐷</span>
          <p className="text-sm text-hint text-center">No savings goals yet.<br />Start saving for something you love.</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1">
            <Plus size={14} /> New Goal
          </button>
        </div>
      ) : (
        <>
          {plans.map((plan) => {
            const pct = plan.targetAmount > 0
              ? Math.min(100, Math.round((plan.savedAmount / plan.targetAmount) * 100))
              : 0;
            const remaining = Math.max(0, plan.targetAmount - plan.savedAmount);
            return (
              <div key={plan.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    {plan.deadline && (
                      <p className="text-xs text-hint">Deadline: {fmtDate(plan.deadline)}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg active:opacity-60" style={{ color: 'var(--tg-theme-hint-color)' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg active:opacity-60" style={{ color: '#E74C3C' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{fmt(plan.savedAmount, plan.currency)}</span>
                  <span className="text-sm font-bold" style={{ color: plan.color }}>{pct}%</span>
                </div>
                <div className="w-full h-3 rounded-full mb-1" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: plan.color }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-hint">
                    {remaining > 0 ? `${fmt(remaining, plan.currency)} remaining` : '🎉 Goal reached!'}
                  </span>
                  <span className="text-xs text-hint">Goal: {fmt(plan.targetAmount, plan.currency)}</span>
                </div>
                <button
                  onClick={() => { setDepositSheet(plan.id); setDepositAmount(''); }}
                  className="mt-3 w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:opacity-70"
                  style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                >
                  <PlusCircle size={15} /> Add Money
                </button>
              </div>
            );
          })}
          <button onClick={openAdd} className="btn-primary w-full flex items-center justify-center gap-1">
            <Plus size={16} /> New Savings Goal
          </button>
        </>
      )}

      {/* Add/Edit sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editId ? 'Edit Goal' : 'New Savings Goal'}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="section-title block">Goal Name</label>
            <input className="input-field" placeholder="e.g. Emergency Fund, New Laptop..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title block">Target Amount</label>
              <input className="input-field" type="number" placeholder="0" value={form.targetAmount || ''} onChange={(e) => setForm((f) => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="section-title block">Currency</label>
              <CurrencySelect value={form.currency as Currency} onChange={(c) => setForm((f) => ({ ...f, currency: c }))} />
            </div>
          </div>
          <div>
            <label className="section-title block">Already Saved</label>
            <input className="input-field" type="number" placeholder="0" value={form.savedAmount || ''} onChange={(e) => setForm((f) => ({ ...f, savedAmount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="section-title block">Deadline (optional)</label>
            <input className="input-field" type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          </div>
          <button onClick={save} className="btn-primary w-full mt-2">{editId ? 'Save Changes' : 'Create Goal'}</button>
        </div>
      </Sheet>

      {/* Deposit sheet */}
      <Sheet open={!!depositSheet} onClose={() => setDepositSheet(null)} title="Add Money">
        <div className="flex flex-col gap-3">
          <input className="input-field text-lg text-center" type="number" placeholder="0" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} autoFocus />
          <button onClick={() => depositSheet && deposit(depositSheet)} className="btn-primary w-full">Add to Savings</button>
        </div>
      </Sheet>
    </div>
  );
}

// ── Growth Plans ──────────────────────────────────────────────────────────

const defaultGrowthForm = (currency: Currency): Omit<IncomeGrowthPlan, 'id' | 'createdAt'> => ({
  title: '',
  currentAmount: 0,
  targetAmount: 0,
  currency,
  targetDate: '',
  steps: [''],
});

function GrowthPlans() {
  const plans = useFinanceStore((s) => s.growthPlans);
  const addPlan = useFinanceStore((s) => s.addGrowthPlan);
  const updatePlan = useFinanceStore((s) => s.updateGrowthPlan);
  const deletePlan = useFinanceStore((s) => s.deleteGrowthPlan);
  const defaultCurrency = useFinanceStore((s) => s.currency);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultGrowthForm(defaultCurrency));

  const openAdd = () => {
    setForm(defaultGrowthForm(defaultCurrency));
    setEditId(null);
    setSheetOpen(true);
  };

  const openEdit = (p: IncomeGrowthPlan) => {
    setForm({ title: p.title, currentAmount: p.currentAmount, targetAmount: p.targetAmount, currency: p.currency, targetDate: p.targetDate, steps: [...p.steps] });
    setEditId(p.id);
    setSheetOpen(true);
  };

  const save = () => {
    if (!form.title.trim() || form.targetAmount <= 0) return;
    const cleanSteps = form.steps.filter((s) => s.trim());
    if (editId) {
      updatePlan(editId, { ...form, steps: cleanSteps });
    } else {
      addPlan({ id: uid(), ...form, steps: cleanSteps, createdAt: new Date().toISOString() });
    }
    setSheetOpen(false);
  };

  const setStep = (i: number, val: string) => {
    setForm((f) => {
      const steps = [...f.steps];
      steps[i] = val;
      return { ...f, steps };
    });
  };

  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, ''] }));
  const removeStep = (i: number) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  return (
    <div className="flex flex-col gap-3">
      {plans.length === 0 ? (
        <div className="card flex flex-col items-center py-10 gap-3">
          <span className="text-4xl">📈</span>
          <p className="text-sm text-hint text-center">No income growth plans.<br />Set goals to increase your earnings.</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1">
            <Plus size={14} /> New Plan
          </button>
        </div>
      ) : (
        <>
          {plans.map((plan) => {
            const increase = plan.targetAmount - plan.currentAmount;
            const pct = plan.currentAmount > 0 ? Math.round((increase / plan.currentAmount) * 100) : 0;
            return (
              <div key={plan.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{plan.title}</p>
                    {plan.targetDate && <p className="text-xs text-hint">By {fmtDate(plan.targetDate)}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(plan)} className="p-1.5 rounded-lg active:opacity-60" style={{ color: 'var(--tg-theme-hint-color)' }}><Pencil size={14} /></button>
                    <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg active:opacity-60" style={{ color: '#E74C3C' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 rounded-xl p-2 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    <p className="text-xs text-hint">Current</p>
                    <p className="font-bold text-sm">{fmt(plan.currentAmount, plan.currency)}</p>
                  </div>
                  <div className="flex items-center text-hint text-sm">→</div>
                  <div className="flex-1 rounded-xl p-2 text-center" style={{ backgroundColor: 'rgba(39,174,96,0.1)' }}>
                    <p className="text-xs text-hint">Target</p>
                    <p className="font-bold text-sm" style={{ color: '#27AE60' }}>{fmt(plan.targetAmount, plan.currency)}</p>
                  </div>
                </div>
                <p className="text-xs text-hint mb-2">
                  +{fmt(increase, plan.currency)} ({pct > 0 ? `+${pct}%` : '—'} increase)
                </p>
                {plan.steps.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {plan.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="shrink-0 text-hint">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={openAdd} className="btn-primary w-full flex items-center justify-center gap-1">
            <Plus size={16} /> New Growth Plan
          </button>
        </>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editId ? 'Edit Growth Plan' : 'New Income Growth Plan'}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="section-title block">Plan Title</label>
            <input className="input-field" placeholder="e.g. Get a raise, Launch SaaS..." value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title block">Current Income</label>
              <input className="input-field" type="number" placeholder="0" value={form.currentAmount || ''} onChange={(e) => setForm((f) => ({ ...f, currentAmount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="section-title block">Target Income</label>
              <input className="input-field" type="number" placeholder="0" value={form.targetAmount || ''} onChange={(e) => setForm((f) => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-title block">Currency</label>
              <CurrencySelect value={form.currency as Currency} onChange={(c) => setForm((f) => ({ ...f, currency: c }))} />
            </div>
            <div>
              <label className="section-title block">Target Date</label>
              <input className="input-field" type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="section-title mb-0">Action Steps</label>
              <button onClick={addStep} className="text-xs text-link flex items-center gap-0.5"><Plus size={12} /> Add step</button>
            </div>
            {form.steps.map((step, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className="input-field flex-1"
                  placeholder={`Step ${i + 1}...`}
                  value={step}
                  onChange={(e) => setStep(i, e.target.value)}
                />
                {form.steps.length > 1 && (
                  <button onClick={() => removeStep(i)} className="p-2 rounded-xl" style={{ color: '#E74C3C' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={save} className="btn-primary w-full mt-2">{editId ? 'Save Changes' : 'Create Plan'}</button>
        </div>
      </Sheet>
    </div>
  );
}

// ── Plans page combining both ─────────────────────────────────────────────

export function Plans() {
  const [tab, setTab] = useState<PlanTab>('savings');

  return (
    <div className="flex flex-col gap-4 pb-6 slide-up">
      <div className="px-5 pt-5">
        <h2 className="text-2xl font-bold">Plans</h2>
      </div>

      {/* Tab switcher */}
      <div className="px-5">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
          {([['savings', 'Savings Goals', <Target size={14} />], ['growth', 'Income Growth', <TrendingUp size={14} />]] as const).map(
            ([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === id ? 'var(--tg-theme-bg-color, #fff)' : 'transparent',
                  color: tab === id ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-hint-color)',
                  boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {icon} {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="px-5">
        {tab === 'savings' ? <SavingsPlans /> : <GrowthPlans />}
      </div>
    </div>
  );
}
