import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BrightnessSlider from './BrightnessSlider';
import TopStepper from './TopStepper';

interface Props {
  children: ReactNode;
  showBack?: boolean;
  showStepper?: boolean;
}

function useClock() {
  const [time] = (() => {
    const t = new Date().toTimeString().split(' ')[0];
    return [t] as const;
  })();

  useEffect(() => {
    const id = setInterval(() => {
      const el = document.getElementById('sys-clock');
      if (el) el.textContent = 'SYS.TIME ' + new Date().toTimeString().split(' ')[0] + ' JKT';
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Layout({ children, showBack = false, showStepper = true }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const initTime = useClock();

  const isDashboard = location.pathname === '/';
  const hideStepper = ['/', '/settings', '/login'].includes(location.pathname)
    || location.pathname.startsWith('/share')
    || location.pathname.includes('/versions')
    || location.pathname.includes('/tasks');

  const shouldShowStepper = showStepper && !hideStepper;

  return (
    <div className="min-h-screen flex flex-col term-screen" style={{ position: 'relative', zIndex: 1 }}>
      {/* ═══ Top Status Bar ═══ */}
      <div className="status-bar">
        <div className="flex items-center gap-2">
          <span>PRD-CHAMBER</span>
          <span style={{ color: 'var(--text-muted)' }}>///</span>
          <span className="checkered" />
          <span>BOOT SEQUENCE INITIATED</span>
        </div>
        <div className="flex items-center gap-2">
          <span>SYSTEM:001</span>
          <span style={{ color: 'var(--text-muted)' }}>///</span>
          <span id="sys-clock" style={{ color: 'var(--text-secondary)' }}>SYS.TIME {initTime} JKT</span>
        </div>
      </div>

      {/* ═══ Navbar ═══ */}
      <nav
        className="flex items-center justify-between px-5 py-2.5"
        style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30 }}
      >
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

        <div className="flex items-center gap-4">
          {!isDashboard && (
            <button onClick={() => navigate('/')} className="term-btn" style={{ fontSize: 10 }}>
              DASHBOARD
            </button>
          )}
          <BrightnessSlider />
        </div>
      </nav>

      {shouldShowStepper && <TopStepper />}

      <main className="flex-1 p-5 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* ═══ Bottom Status Bar ═══ */}
      <div className="status-bar" style={{ marginTop: 'auto' }}>
        <div className="flex items-center gap-2">
          <span className="checkered" />
          <span>PRD CHAMBER v1.0</span>
          <span style={{ color: 'var(--text-muted)' }}>///</span>
          <span>NAVAL TERMINAL</span>
        </div>
        <div className="flex items-center gap-2">
          <span>STATUS: ONLINE</span>
          <span style={{ color: 'var(--text-muted)' }}>///</span>
          <span>SYSTEM NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
