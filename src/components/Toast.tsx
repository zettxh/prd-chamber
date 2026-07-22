import { useEffect } from 'react';

interface Props {
  type: 'error' | 'warning' | 'success';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
  onDismiss?: () => void;
}

const borderColors = { error: 'var(--error)', warning: 'var(--warning)', success: 'var(--success)' };

export default function Toast({ type, title, description, action, duration = 5000, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="term-panel" style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 10000,
      borderLeft: `3px solid ${borderColors[type]}`,
      padding: '12px 18px', fontSize: 11, minWidth: 260, maxWidth: 360,
      animation: 'term-fadein 0.3s ease-out',
    }}>
      <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2 }}>{title}</div>
      {description && <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{description}</div>}
      {action && (
        <button onClick={action.onClick} className="term-btn-accent" style={{ fontSize: 9, marginTop: 8, padding: '3px 10px' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
