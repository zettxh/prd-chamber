import { memo } from 'react';

interface Section {
  id: string;
  label: string;
}

interface NavLink {
  label: string;
  onClick: () => void;
  icon?: string;
}

interface Props {
  sections: Section[];
  activeSection: string;
  onSelect: (id: string) => void;
  sidebarId?: string;
  bottomNav?: NavLink[];
}

const PrdSidebar = memo(function PrdSidebar({ sections, activeSection, onSelect, sidebarId, bottomNav }: Props) {
  return (
    <div className="term-panel" id={sidebarId} style={{
      padding: '8px 0',
      position: 'sticky',
      top: 80,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Section TOC */}
      {sections.map(({ id, label }) => (
        <div
          key={id}
          data-section={id}
          onClick={() => onSelect(id)}
          title={label}
          style={{
            padding: '7px 14px',
            fontSize: 11,
            cursor: 'pointer',
            color: activeSection === id ? 'var(--accent)' : 'var(--text-muted)',
            borderLeft: activeSection === id ? '2px solid var(--accent)' : '2px solid transparent',
            background: activeSection === id ? 'rgba(138,155,174,0.06)' : 'transparent',
            transition: 'color 120ms, background 120ms',
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

      {/* Bottom nav links */}
      {bottomNav && bottomNav.length > 0 && (
        <>
          <div style={{
            borderTop: '1px solid var(--border)',
            margin: '6px 0',
          }} />
          {bottomNav.map((link, i) => (
            <div
              key={i}
              onClick={link.onClick}
              title={link.label}
              style={{
                padding: '7px 14px',
                fontSize: 11,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'color 120ms',
                userSelect: 'none',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {link.icon && <span style={{ fontSize: 10 }}>{link.icon}</span>}
              <span>{link.label}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
});

export default PrdSidebar;
