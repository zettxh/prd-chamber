const sections = [
  { id: 'executive-summary', label: 'Executive Summary' },
  { id: 'problem-statement', label: 'Problem Statement' },
  { id: 'core-features', label: 'Core Features' },
  { id: 'user-flow', label: 'User Flow / Journey' },
  { id: 'functional-requirements', label: 'Functional Requirements' },
  { id: 'architecture', label: 'System Architecture' },
  { id: 'database-schema', label: 'Database Schema' },
];

interface Props {
  activeSection: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ activeSection, onSelect }: Props) {
  return (
    <nav className="w-56 shrink-0 p-3 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
      <ul className="space-y-1">
        {sections.map(s => (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s.id)}
              className="w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background: activeSection === s.id ? 'var(--chip-selected)' : 'transparent',
                color: activeSection === s.id ? 'var(--chip-text-selected)' : 'var(--text-secondary)',
              }}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
