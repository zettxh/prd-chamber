interface Props {
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export default function ErrorBanner({ title, description, action, secondaryAction }: Props) {
  return (
    <div className="term-accent-panel" style={{
      padding: '14px 18px', fontSize: 11, marginBottom: 14,
      border: '1px solid var(--accent-dim)',
    }}>
      <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>⚠ {title}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 10, marginBottom: 10 }}>{description}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={action.onClick} className="term-btn-accent" style={{ fontSize: 9, padding: '4px 12px' }}>{action.label}</button>
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="term-btn" style={{ fontSize: 9, padding: '4px 12px' }}>{secondaryAction.label}</button>
        )}
      </div>
    </div>
  );
}
