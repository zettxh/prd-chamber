import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { SubGroupIcon } from './icons';
import { useStructureStore } from '../../stores/structure';

interface SubFeatureGroupData {
  features: { name: string; description: string }[];
  phaseId: string;
}

// ============================================================
// SubFeatureItem — editable name + expandable description
// ============================================================

function SubFeatureItem({
  name,
  description,
  index,
  phaseId,
  expanded,
}: {
  name: string;
  description: string;
  index: number;
  phaseId: string;
  expanded: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateSubFeature = useStructureStore((s) => s.updateSubFeature);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      updateSubFeature(phaseId, index, trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(name);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="nodrag" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
        <span style={{ color: 'var(--accent-dim)', fontSize: 7, flexShrink: 0 }}>●</span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--accent-dim)',
            borderBottom: '2px solid var(--accent)',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            padding: '1px 4px',
            width: '100%',
            borderRadius: 3,
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className="nodrag"
        onDoubleClick={() => setEditing(true)}
        title="Double-click untuk edit"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          padding: '1px 4px',
          margin: '0 -4px',
          border: '1px solid transparent',
          borderRadius: 3,
          transition: 'all 100ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'rgba(138,155,174,0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ color: 'var(--accent-dim)', fontSize: 7, flexShrink: 0 }}>●</span>
        <span>{name}</span>
      </div>

      {/* Description — visible when expanded */}
      {expanded && (
        <p
          style={{
            margin: '3px 0 0 17px',
            fontSize: 8,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ============================================================
// SubFeatureGroupNode — toggle deskripsi + Part B future support
// ============================================================

export const SubFeatureGroupNode = memo(function SubFeatureGroupNode({ data }: NodeProps) {
  const typedData = data as unknown as SubFeatureGroupData;
  const [expanded, setExpanded] = useState(false);
  const DISPLAY_LIMIT = 3;
  const displayFeatures = typedData.features.slice(0, DISPLAY_LIMIT);
  const totalCount = typedData.features.length;

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 230,
        maxWidth: 260,
        transition: 'all 200ms ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'var(--accent-dim)',
          width: 8,
          height: 8,
          border: '2px solid var(--bg-panel)',
        }}
      />

      {/* Header — drag handle */}
      <div
        className="drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border)',
          cursor: 'grab',
        }}
      >
        <SubGroupIcon size={14} color="var(--accent-dim)" />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          SUB FITUR
        </span>
      </div>

      {/* Feature List — capped at 3 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {displayFeatures.map((f, i) => (
          <SubFeatureItem
            key={`${typedData.phaseId}-sub-${i}`}
            name={f.name}
            description={f.description}
            index={i}
            phaseId={typedData.phaseId}
            expanded={expanded}
          />
        ))}
      </div>

      {/* Footer — clickable toggle */}
      <div
        className="nodrag"
        onClick={() => setExpanded((prev) => !prev)}
        title={expanded ? 'Sembunyikan deskripsi' : 'Lihat deskripsi'}
        style={{
          marginTop: 8,
          paddingTop: 6,
          borderTop: '1px solid var(--border)',
          fontSize: 9,
          color: expanded ? 'var(--accent)' : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          transition: 'color 120ms',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = expanded ? 'var(--accent)' : 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = expanded ? 'var(--accent)' : 'var(--text-muted)';
        }}
      >
        {expanded ? 'Sembunyikan' : 'Lihat deskripsi'} ({totalCount})
        <span style={{ fontSize: 11 }}>{expanded ? '⌄' : '›'}</span>
      </div>
    </div>
  );
});
