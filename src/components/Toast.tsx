import { useEffect } from 'react';

interface Props {
  type: 'error' | 'warning' | 'success';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
  onDismiss: () => void;
}

const durations: Record<string, number> = { error: 6000, warning: 5000, success: 4000 };
const colors: Record<string, string> = { error: 'var(--error)', warning: 'var(--warning)', success: 'var(--success)' };
const icons: Record<string, string> = { error: '❌', warning: '⚠️', success: '✅' };

export default function Toast({ type, title, description, action, duration, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration || durations[type]);
    return () => clearTimeout(timer);
  }, [type, duration, onDismiss]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 p-4 rounded-md max-w-sm"
      style={{
        background: 'var(--bg-card)',
        borderLeft: `4px solid ${colors[type]}`,
        boxShadow: 'var(--shadow-card)',
        animation: 'slideIn 0.2s ease-out',
      }}
    >
      <div className="flex items-start gap-2">
        <span>{icons[type]}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
          {description && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
          {action && (
            <button onClick={action.onClick} className="text-xs font-medium mt-2" style={{ color: 'var(--accent-primary)' }}>
              {action.label}
            </button>
          )}
        </div>
        <button onClick={onDismiss} className="text-xs" style={{ color: 'var(--text-secondary)' }}>✕</button>
      </div>
    </div>
  );
}
