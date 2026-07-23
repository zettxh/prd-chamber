import { useMemo } from 'react';

interface DiffItem {
  type: 'unchanged' | 'added' | 'removed' | 'changed';
  label: string;
  oldValue?: string;
  newValue?: string;
}

interface Props {
  oldLabel: string;
  newLabel: string;
  oldContent: string;
  newContent: string;
}

// Simple section-based diff (no library needed for mockup)
function computeSectionDiff(oldText: string, newText: string): DiffItem[] {
  const oldSections = oldText.split(/^##\s/m).filter(Boolean);
  const newSections = newText.split(/^##\s/m).filter(Boolean);

  const result: DiffItem[] = [];
  const allHeaders = new Set([
    ...oldSections.map(s => s.split('\n')[0].trim()),
    ...newSections.map(s => s.split('\n')[0].trim()),
  ]);

  allHeaders.forEach(header => {
    const oldSection = oldSections.find(s => s.startsWith(header));
    const newSection = newSections.find(s => s.startsWith(header));

    if (!oldSection && newSection) {
      result.push({ type: 'added', label: header, newValue: newSection.trim() });
    } else if (oldSection && !newSection) {
      result.push({ type: 'removed', label: header, oldValue: oldSection.trim() });
    } else if (oldSection && newSection && oldSection.trim() !== newSection.trim()) {
      result.push({ type: 'changed', label: header, oldValue: oldSection.trim(), newValue: newSection.trim() });
    } else {
      result.push({ type: 'unchanged', label: header });
    }
  });

  return result;
}

export default function DiffView({ oldLabel, newLabel, oldContent, newContent }: Props) {
  const diff = useMemo(() => computeSectionDiff(oldContent, newContent), [oldContent, newContent]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const changed = diff.filter(d => d.type === 'changed').length;
    return { added, removed, changed };
  }, [diff]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, fontSize: 10, fontFamily: 'var(--font-mono)', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: '#6B8C63' }}>+{stats.added} added</span>
        <span style={{ color: '#C46262' }}>-{stats.removed} removed</span>
        <span style={{ color: '#D4A843' }}>~{stats.changed} changed</span>
      </div>

      {/* Version labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          padding: '8px 14px',
          background: 'rgba(196,98,98,0.08)',
          border: '1px solid rgba(196,98,98,0.3)',
          borderRadius: 6,
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: '#C46262',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          ← {oldLabel}
        </div>
        <div style={{
          padding: '8px 14px',
          background: 'rgba(107,140,99,0.08)',
          border: '1px solid rgba(107,140,99,0.3)',
          borderRadius: 6,
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: '#6B8C63',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          → {newLabel}
        </div>
      </div>

      {/* Diff sections */}
      {diff.map((item, i) => (
        <div key={i} style={{
          border: '1px solid var(--border)',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          {/* Section header */}
          <div style={{
            padding: '6px 14px',
            background: 'var(--bg-panel)',
            borderBottom: '1px solid var(--border)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {item.label}
          </div>

          {/* Section body */}
          {item.type === 'unchanged' && (
            <div style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontStyle: 'italic' }}>
              No changes
            </div>
          )}

          {item.type === 'removed' && (
            <div style={{
              padding: '10px 14px',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: '#C46262',
              background: 'rgba(196,98,98,0.04)',
              textDecoration: 'line-through',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}>
              {item.oldValue}
            </div>
          )}

          {item.type === 'added' && (
            <div style={{
              padding: '10px 14px',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: '#6B8C63',
              background: 'rgba(107,140,99,0.04)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}>
              {item.newValue}
            </div>
          )}

          {item.type === 'changed' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div style={{
                padding: '10px 14px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: '#C46262',
                background: 'rgba(196,98,98,0.04)',
                borderRight: '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Before</div>
                {item.oldValue}
              </div>
              <div style={{
                padding: '10px 14px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: '#6B8C63',
                background: 'rgba(107,140,99,0.04)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>After</div>
                {item.newValue}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
