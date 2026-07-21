interface Props { title: string; description: string; action: { label: string; onClick: () => void }; secondaryAction?: { label: string; onClick: () => void }; }

export default function ErrorBanner({ title, description, action, secondaryAction }: Props) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 px-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <div className="w-full max-w-2xl p-4 rounded-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L2)', borderLeft: '4px solid var(--error)' }}>
        <p className="text-sm font-bold" style={{ color: 'var(--error)' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={action.onClick} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--accent)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-L1)' }}>{action.label}</button>
          {secondaryAction && <button onClick={secondaryAction.onClick} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-L1)' }}>{secondaryAction.label}</button>}
        </div>
      </div>
    </div>
  );
}
