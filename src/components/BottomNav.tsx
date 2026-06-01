import { LayoutDashboard, TrendingUp, CreditCard, PiggyBank, BarChart2, Bell } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import type { TabId } from '../types';

const TABS: { id: TabId; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
  { id: 'income', label: 'Income', Icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', Icon: CreditCard },
  { id: 'plans', label: 'Plans', Icon: PiggyBank },
  { id: 'analysis', label: 'Analysis', Icon: BarChart2 },
  { id: 'alerts', label: 'Alerts', Icon: Bell },
];

export function BottomNav() {
  const activeTab = useFinanceStore((s) => s.activeTab);
  const setActiveTab = useFinanceStore((s) => s.setActiveTab);
  const alerts = useFinanceStore((s) => s.alerts);
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center border-t z-50"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color, #fff)',
        borderColor: 'rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        const showBadge = id === 'alerts' && triggeredCount > 0;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 relative"
            style={{ color: active ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-hint-color, #999)' }}
          >
            <span className="relative">
              <Icon size={20} />
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {triggeredCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium ${active ? '' : ''}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
