interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-lg font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-4 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px" style={{ background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))', color: '#fff', boxShadow: 'var(--shadow-button)' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
