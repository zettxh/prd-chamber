import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopStepper from './TopStepper';

interface Props {
  children: ReactNode;
  showBack?: boolean;
  showStepper?: boolean;
  continueLabel?: string;
  onContinue?: () => void;
}

export default function Layout({
  children,
  showBack = false,
  showStepper = true,
  continueLabel,
  onContinue,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  const hideStepper = ['/', '/settings', '/login'].includes(location.pathname)
    || location.pathname.startsWith('/share')
    || location.pathname.includes('/versions')
    || location.pathname.includes('/tasks');

  const shouldShowStepper = showStepper && !hideStepper;

  return (
    <div className="min-h-screen flex flex-col term-screen" style={{ position: 'relative', zIndex: 1 }}>
      {/* ═══ Navbar ═══ */}
      <nav
        className="flex items-center justify-between px-5 py-2.5"
        style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30 }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="term-btn" style={{ fontSize: 10 }}>
              ← BACK
            </button>
          )}
          <span
            className="cursor-pointer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
            onClick={() => navigate('/')}
          >
            ◈ PRD Chamber
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {continueLabel && onContinue && (
            <button onClick={onContinue} className="term-btn-accent" style={{ fontSize: 10 }}>
              {continueLabel} →
            </button>
          )}
          {!isDashboard && (
            <button onClick={() => navigate('/')} className="term-btn" style={{ fontSize: 10 }}>
              DASHBOARD
            </button>
          )}
        </div>
      </nav>

      {shouldShowStepper && <TopStepper />}

      <main className="flex-1 p-5 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
