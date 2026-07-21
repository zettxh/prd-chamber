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

  const isDashboard = location.pathname === '/';
  const hideStepper = ['/', '/settings', '/login'].includes(location.pathname)
    || location.pathname.startsWith('/share')
    || location.pathname.includes('/versions')
    || location.pathname.includes('/tasks');

  const shouldShowStepper = showStepper && !hideStepper;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-5 py-3 sticky top-0 z-30"
        style={{
          background: 'var(--bg)',
          boxShadow: 'var(--shadow-nav)',
        }}
      >
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: 'var(--bg)',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-L1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'box-shadow 200ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1)')}
            >
              ← Kembali
            </button>
          )}
          <span
            className="font-heading text-base font-bold cursor-pointer"
            style={{ color: 'var(--text-primary)', letterSpacing: -0.3 }}
            onClick={() => navigate('/')}
          >
            PRD Chamber
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isDashboard && (
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: 'var(--bg)',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-L1)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>
          )}
          <ThemeToggle />
        </div>
      </nav>

      {shouldShowStepper && <TopStepper />}

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
