interface Props { title: string; description?: string; actionLabel?: string; onAction?: () => void; }

const btnStyle: React.CSSProperties = {
  background: 'var(--bg)', color: 'var(--accent)', fontWeight: 700, border: 'none', cursor: 'pointer',
  padding: '10px 22px', borderRadius: 12, fontSize: 14,
  boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
};

export default function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="text-center py-16 px-6 rounded-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}>
      <div className="text-5xl mb-4" style={{ opacity: 0.5 }}>📭</div>
      <p className="text-lg font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>}
      {actionLabel && onAction && <button onClick={onAction} style={btnStyle}>{actionLabel}</button>}
    </div>
  );
}
