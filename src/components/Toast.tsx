import { useEffect } from 'react';

interface Props {
  type: 'error' | 'warning' | 'success';
  title: string; description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number; onDismiss: () => void;
}

const durations: Record<string, number> = { error: 6000, warning: 5000, success: 4000 };
const icons: Record<string, string> = { error: '❌', warning: '⚠️', success: '✅' };

export default function Toast({ type, title, description, action, duration, onDismiss }: Props) {
  useEffect(() => { const t = setTimeout(onDismiss, duration || durations[type]); return () => clearTimeout(t); }, [type, duration, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl max-w-sm flex items-start gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L2-hover)', animation: 'slideIn 0.3s ease-out' }}>
      <span>{icons[type]}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {description && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
        {action && <button onClick={action.onClick} className="text-xs font-semibold mt-2" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>{action.label}</button>}
      </div>
      <button onClick={onDismiss} className="w-6 h-6 flex items-center justify-center rounded-lg text-xs" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
    </div>
  );
}
