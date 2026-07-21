export default function AssistantPanel() {
  const items = ['Executive Summary', 'Problem Statement', 'Core Features', 'User Flow', 'Requirements', 'Architecture', 'DB Schema'];
  return (
    <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
      <h3 className="font-heading text-sm font-bold" style={{ color: 'var(--text-primary)' }}>🤖 AI Assistant</h3>
      <div className="flex flex-col gap-2">
        {items.map((s, i) => (
          <div key={s} className="flex items-center gap-2 text-xs">
            <span style={{ color: i < 7 ? 'var(--success)' : 'var(--text-secondary)' }}>✓</span>
            <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 pt-3" style={{ boxShadow: 'var(--divider-light), var(--divider-dark)' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Progress: <strong style={{ color: 'var(--accent)' }}>7/7</strong> selesai</p>
      </div>
    </div>
  );
}
