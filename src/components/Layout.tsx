import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import TopStepper from './TopStepper';

interface Props {
  children: ReactNode;
  showBack?: boolean;
  showStepper?: boolean;
}

export default function Layout({ children, showBack = false, showStepper = true }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Jangan tampilkan stepper di dashboard, settings, version history, dan login
  const hideStepperPaths = ['/', '/settings', '/login'];
  const isDashboard = location.pathname === '/';
  const shouldShowStepper = showStepper && !hideStepperPaths.includes(location.pathname) && !location.pathname.startsWith('/settings') && !location.pathname.startsWith('/share') && !location.pathname.includes('/versions') && !location.pathname.includes('/tasks');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              ← Kembali
            </button>
          )}
          <span
            className="font-heading text-lg font-bold cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => navigate('/')}
          >
            PRD Chamber
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isDashboard && (
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium px-2 py-1 rounded"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            >
              Dashboard
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
      {shouldShowStepper && <TopStepper />}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
