import { memo } from 'react';

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
  activeSection: string;
  onSelect: (id: string) => void;
}

const PrdSidebar = memo(function PrdSidebar({ sections, activeSection, onSelect }: Props) {
  return (
    <div
      className="term-panel"
      style={{
        padding: '8px 0',
        position: 'sticky',
        top: 80,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      {sections.map(({ id, label }) => (
        <div
          key={id}
          onClick={() => onSelect(id)}
          title={label}
          style={{
            padding: '7px 14px',
            fontSize: 11,
            cursor: 'pointer',
            color: activeSection === id ? 'var(--accent)' : 'var(--text-muted)',
            borderLeft: activeSection === id ? '2px solid var(--accent)' : '2px solid transparent',
            background: activeSection === id ? 'rgba(138,155,174,0.06)' : 'transparent',
            transition: 'all 120ms',
            userSelect: 'none',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={(e) => {
            if (activeSection !== id) {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== id) {
              e.currentTarget.style.color = 'var(--text-muted)';
            }
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
});

export default PrdSidebar;
