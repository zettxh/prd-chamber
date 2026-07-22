export default function AssistantPanel() {
  return (
    <div className="term-accent-panel" style={{ padding: '14px 16px', fontSize: 10, color: 'var(--text-muted)' }}>
      <div style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 8 }}>◈ AI ASSISTANT</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ padding: '3px 0' }}>✓ Executive Summary</div>
        <div style={{ padding: '3px 0' }}>✓ Problem Statement</div>
        <div style={{ padding: '3px 0' }}>✓ Core Features</div>
        <div style={{ padding: '3px 0', color: 'var(--accent)' }}>◉ Generating User Flow...</div>
        <div style={{ padding: '3px 0' }}>○ Functional Reqs</div>
        <div style={{ padding: '3px 0' }}>○ Architecture</div>
        <div style={{ padding: '3px 0' }}>○ Database Schema</div>
      </div>
      <div className="term-divider" style={{ margin: '8px 0' }} />
      <div style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 4 }}>Next step:</div>
      <button className="term-btn-accent" style={{ fontSize: 9, width: '100%', justifyContent: 'center' }}>
        {'>'} REGENERATE SECTION
      </button>
    </div>
  );
}
