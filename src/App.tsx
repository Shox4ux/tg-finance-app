import { useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { Plans } from './pages/Plans';
import { Analysis } from './pages/Analysis';
import { Alerts } from './pages/Alerts';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme?: 'light' | 'dark';
      };
    };
  }
}

function applyTelegramTheme() {
  const tg = window.Telegram?.WebApp;
  if (!tg?.themeParams) return;
  const p = tg.themeParams;
  const root = document.documentElement;
  if (p.bg_color) root.style.setProperty('--tg-theme-bg-color', p.bg_color);
  if (p.text_color) root.style.setProperty('--tg-theme-text-color', p.text_color);
  if (p.hint_color) root.style.setProperty('--tg-theme-hint-color', p.hint_color);
  if (p.link_color) root.style.setProperty('--tg-theme-link-color', p.link_color);
  if (p.button_color) root.style.setProperty('--tg-theme-button-color', p.button_color);
  if (p.button_text_color) root.style.setProperty('--tg-theme-button-text-color', p.button_text_color);
  if (p.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color);
}

const PAGE_MAP = {
  dashboard: Dashboard,
  income: Income,
  expenses: Expenses,
  plans: Plans,
  analysis: Analysis,
  alerts: Alerts,
} as const;

export default function App() {
  const activeTab = useFinanceStore((s) => s.activeTab);
  const checkAlerts = useFinanceStore((s) => s.checkAlerts);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      applyTelegramTheme();
    }
    checkAlerts();
  }, []);

  const Page = PAGE_MAP[activeTab];

  return (
    <div className="flex flex-col flex-1">
      {/* Page content with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 72 }}>
        <Page />
      </main>
      <BottomNav />
    </div>
  );
}
