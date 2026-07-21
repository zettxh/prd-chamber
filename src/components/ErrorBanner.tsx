interface Props {
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export default function ErrorBanner({ title, description, action, secondaryAction }: Props) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="w-full max-w-2xl mt-4 p-4 rounded-md mx-4" style={{ background: 'var(--error)', color: '#fff', opacity: 0.95 }}>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs mt-1 opacity-90">{description}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={action.onClick} className="px-3 py-1 rounded text-xs font-semibold" style={{ background: '#fff', color: 'var(--error)' }}>
            {action.label}
          </button>
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} className="px-3 py-1 rounded text-xs font-semibold" style={{ border: '1px solid rgba(255,255,255,0.5)', color: '#fff' }}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
