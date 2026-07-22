interface Props {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message = '$ no data found', actionLabel, onAction }: Props) {
  return (
    <div className="term-panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 12 }}>
      <span>{message}</span>
      {actionLabel && onAction && (
        <button onClick={onAction} className="term-btn-accent" style={{ display: 'block', margin: '14px auto 0', fontSize: 10 }}>
          {actionLabel}
        </button>
      )}
      <span style={{ display: 'inline-block', width: 8, height: 16, background: 'var(--accent)', marginLeft: 4, verticalAlign: 'middle', animation: 'term-blink 1.5s step-end infinite' }} />
    </div>
  );
}
