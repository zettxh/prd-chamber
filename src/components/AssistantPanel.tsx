export default function AssistantPanel() {
  return (
    <div className="p-4 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
      <h3 className="font-heading text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        🤖 AI Assistant
      </h3>
      <div className="space-y-2">
        {['Executive Summary', 'Problem Statement', 'Core Features', 'User Flow', 'Functional Requirements', 'Architecture', 'Database Schema'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 text-xs">
            <span style={{ color: i < 7 ? 'var(--success)' : 'var(--text-secondary)' }}>✓</span>
            <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
        Progress: 7/7 section selesai
      </p>
    </div>
  );
}
