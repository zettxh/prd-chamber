const sections = [
  { key: 'executive-summary', label: 'Executive Summary' },
  { key: 'problem-statement', label: 'Problem Statement' },
  { key: 'core-features', label: 'Core Features' },
  { key: 'user-flow', label: 'User Flow' },
  { key: 'functional-requirements', label: 'Functional Reqs' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'database-schema', label: 'Database Schema' },
];

interface Props {
  activeSection: string;
  onSelect: (key: string) => void;
}

export default function Sidebar({ activeSection, onSelect }: Props) {
  return (
    <div className="term-panel" style={{ padding: '8px 0', minWidth: 160, height: 'fit-content' }}>
      {sections.map(s => (
        <div
          key={s.key}
          onClick={() => onSelect(s.key)}
          style={{
            padding: '6px 14px', fontSize: 10, cursor: 'pointer',
            color: activeSection === s.key ? 'var(--accent)' : 'var(--text-muted)',
            borderLeft: activeSection === s.key ? '2px solid var(--accent)' : '2px solid transparent',
            background: activeSection === s.key ? 'rgba(138,155,174,0.06)' : 'transparent',
            transition: 'all 120ms',
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}
