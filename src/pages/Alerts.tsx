import { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, AlertTriangle } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Sheet } from '../components/Sheet';
import { fmt, uid } from '../utils/format';
import { EXPENSE_CATEGORIES, type Alert, type ExpenseCategory, type Currency } from '../types';

const PERIOD_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' } as const;

const defaultForm = (currency: Currency): Omit<Alert, 'id' | 'triggered' | 'triggeredAmount' | 'createdAt'> => ({
  category: undefined,
  threshold: 0,
  currency,
  period: 'monthly',
});

export function Alerts() {
  const alerts = useFinanceStore((s) => s.alerts);
  const addAlert = useFinanceStore((s) => s.addAlert);
  const deleteAlert = useFinanceStore((s) => s.deleteAlert);
  const checkAlerts = useFinanceStore((s) => s.checkAlerts);
  const defaultCurrency = useFinanceStore((s) => s.currency);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(() => defaultForm(defaultCurrency));

  useEffect(() => { checkAlerts(); }, []);

  const openAdd = () => {
    setForm(defaultForm(defaultCurrency));
    setSheetOpen(true);
  };

  const save = () => {
    if (form.threshold <= 0) return;
    addAlert({
      id: uid(),
      ...form,
      triggered: false,
      createdAt: new Date().toISOString(),
    });
    checkAlerts();
    setSheetOpen(false);
  };

  const triggered = alerts.filter((a) => a.triggered);
  const ok = alerts.filter((a) => !a.triggered);

  const getCat = (id?: string) =>
    id ? EXPENSE_CATEGORIES.find((c) => c.id === id) : null;

  return (
    <div className="flex flex-col gap-4 pb-6 slide-up">
      <div className="px-5 pt-5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Spending Alerts</h2>
          <p className="text-sm text-hint mt-0.5">Get notified when spending exceeds limits</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1">
          <Plus size={16} /> Add
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="mx-5 card flex flex-col items-center py-10 gap-3">
          <span className="text-4xl">🔔</span>
          <p className="text-sm text-hint text-center">No alerts set up.<br />Add alerts to track overspending.</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1">
            <Plus size={14} /> Add Alert
          </button>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-4">
          {triggered.length > 0 && (
            <div>
              <p className="section-title text-red-500">Triggered Alerts</p>
              <div className="flex flex-col gap-2">
                {triggered.map((alert) => {
                  const cat = getCat(alert.category);
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      catInfo={cat}
                      onDelete={() => deleteAlert(alert.id)}
                      triggered
                    />
                  );
                })}
              </div>
            </div>
          )}

          {ok.length > 0 && (
            <div>
              <p className="section-title">Active Alerts</p>
              <div className="flex flex-col gap-2">
                {ok.map((alert) => {
                  const cat = getCat(alert.category);
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      catInfo={cat}
                      onDelete={() => deleteAlert(alert.id)}
                      triggered={false}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="New Spending Alert">
        <div className="flex flex-col gap-3">
          <div>
            <label className="section-title block">Category (optional)</label>
            <div className="grid grid-cols-5 gap-2 mb-1">
              <button
                onClick={() => setForm((f) => ({ ...f, category: undefined }))}
                className="flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all"
                style={{
                  backgroundColor: !form.category ? 'var(--tg-theme-button-color)20' : 'var(--tg-theme-secondary-bg-color)',
                  border: !form.category ? '2px solid var(--tg-theme-button-color)' : '2px solid transparent',
                }}
              >
                <span className="text-lg">📋</span>
                <span className="text-[10px] font-medium">All</span>
              </button>
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setForm((f) => ({ ...f, category: cat.id as ExpenseCategory }))}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all"
                  style={{
                    backgroundColor: form.category === cat.id ? `${cat.color}30` : 'var(--tg-theme-secondary-bg-color)',
                    border: form.category === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
                  }}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="section-title block">Threshold Amount</label>
            <input
              className="input-field"
              type="number"
              placeholder="0"
              value={form.threshold || ''}
              onChange={(e) => setForm((f) => ({ ...f, threshold: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <label className="section-title block">Time Period</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PERIOD_LABELS) as Array<keyof typeof PERIOD_LABELS>).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm((f) => ({ ...f, period: p }))}
                  className="py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: form.period === p ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-secondary-bg-color)',
                    color: form.period === p ? 'var(--tg-theme-button-text-color, #fff)' : 'var(--tg-theme-text-color)',
                  }}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {form.threshold > 0 && (
            <div className="rounded-xl p-3 text-sm text-center" style={{ backgroundColor: 'rgba(36,129,204,0.1)' }}>
              Alert when{form.category ? ` ${getCat(form.category)?.label}` : ''} spending exceeds{' '}
              <strong>{fmt(form.threshold, form.currency as Currency)}</strong> per {form.period.replace('ly', '')}
            </div>
          )}

          <button onClick={save} className="btn-primary w-full mt-2">Create Alert</button>
        </div>
      </Sheet>
    </div>
  );
}

function AlertCard({
  alert, catInfo, onDelete, triggered,
}: {
  alert: Alert;
  catInfo: typeof EXPENSE_CATEGORIES[0] | null | undefined;
  onDelete: () => void;
  triggered: boolean;
}) {
  const pct = alert.triggeredAmount && alert.threshold > 0
    ? Math.round((alert.triggeredAmount / alert.threshold) * 100)
    : 0;

  return (
    <div
      className="card"
      style={triggered ? { border: '1.5px solid #FFCCCC', backgroundColor: '#FFF8F8' } : {}}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {triggered ? (
            <AlertTriangle size={16} style={{ color: '#E74C3C' }} />
          ) : (
            <Bell size={16} style={{ color: 'var(--tg-theme-hint-color)' }} />
          )}
          <div>
            <p className="font-semibold text-sm">
              {catInfo ? `${catInfo.icon} ${catInfo.label}` : '📋 All Categories'}
            </p>
            <p className="text-xs text-hint">
              {PERIOD_LABELS[alert.period]} limit: {fmt(alert.threshold, alert.currency)}
            </p>
          </div>
        </div>
        <button onClick={onDelete} className="p-1.5 rounded-lg active:opacity-60" style={{ color: '#E74C3C' }}>
          <Trash2 size={14} />
        </button>
      </div>

      {alert.triggeredAmount !== undefined && (
        <>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-hint">Spent: <span className="font-medium" style={{ color: triggered ? '#E74C3C' : 'inherit' }}>
              {fmt(alert.triggeredAmount, alert.currency)}
            </span></span>
            <span style={{ color: triggered ? '#E74C3C' : 'var(--tg-theme-hint-color)' }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(100, pct)}%`,
                backgroundColor: triggered ? '#E74C3C' : pct > 80 ? '#E67E22' : '#27AE60',
              }}
            />
          </div>
        </>
      )}

      {triggered && (
        <p className="text-xs font-semibold mt-2" style={{ color: '#E74C3C' }}>
          ⚠️ Limit exceeded by {fmt((alert.triggeredAmount ?? 0) - alert.threshold, alert.currency)}
        </p>
      )}
    </div>
  );
}
