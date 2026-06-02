import { LayoutDashboard, TrendingUp, CreditCard, PiggyBank, BarChart2, Bell } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useT } from '../i18n';
import type { TabId } from '../types';

export function SideNav() {
  const t = useT();
  const activeTab = useFinanceStore((s) => s.activeTab);
  const setActiveTab = useFinanceStore((s) => s.setActiveTab);
  const alerts = useFinanceStore((s) => s.alerts);
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  const TABS: { id: TabId; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { id: 'dashboard', label: t('nav_dashboard'), Icon: LayoutDashboard },
    { id: 'income', label: t('nav_income'), Icon: TrendingUp },
    { id: 'expenses', label: t('nav_expenses'), Icon: CreditCard },
    { id: 'plans', label: t('nav_plans'), Icon: PiggyBank },
    { id: 'analysis', label: t('nav_analysis'), Icon: BarChart2 },
    { id: 'alerts', label: t('nav_alerts'), Icon: Bell },
  ];

  return (
    <aside
      className="flex flex-col gap-1 py-6 px-3 shrink-0"
      style={{
        width: 200,
        borderRight: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #f1f1f1)',
        minHeight: '100dvh',
      }}
    >
      <div className="px-3 mb-4">
        <p className="font-bold text-base">💰 Finteg</p>
      </div>

      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        const showBadge = id === 'alerts' && triggeredCount > 0;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative text-left"
            style={{
              backgroundColor: active ? 'var(--tg-theme-button-color, #2481cc)20' : 'transparent',
              color: active ? 'var(--tg-theme-button-color, #2481cc)' : 'var(--tg-theme-text-color)',
              fontWeight: active ? 600 : 400,
            }}
          >
            <span className="relative shrink-0">
              <Icon size={18} />
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {triggeredCount}
                </span>
              )}
            </span>
            {label}
          </button>
        );
      })}
    </aside>
  );
}
