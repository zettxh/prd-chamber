const sections = [
  { id: 'executive-summary', label: 'Executive Summary' },
  { id: 'problem-statement', label: 'Problem Statement' },
  { id: 'core-features', label: 'Core Features' },
  { id: 'user-flow', label: 'User Flow / Journey' },
  { id: 'functional-requirements', label: 'Requirements' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'database-schema', label: 'Database Schema' },
];

interface Props { activeSection: string; onSelect: (id: string) => void; }

export default function Sidebar({ activeSection, onSelect }: Props) {
  return (
    <nav className="w-52 shrink-0 p-4 rounded-2xl flex flex-col gap-1" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1 px-2" style={{ color: 'var(--text-secondary)' }}>Sections</p>
      {sections.map(s => (
        <button
          key={s.id} onClick={() => onSelect(s.id)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'var(--bg)',
            color: activeSection === s.id ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: activeSection === s.id ? 600 : 500,
            boxShadow: activeSection === s.id ? 'var(--shadow-D1)' : 'none',
            border: 'none', cursor: 'pointer',
          }}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
