import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StructureNodeData } from '../../stores/structure';

interface PhaseNodeProps extends NodeProps {
  data: StructureNodeData;
}

export const PhaseNode = memo(function PhaseNode({ data, selected }: PhaseNodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);
  useEffect(() => { setLabel(data.label); }, [data.label]);

  const commit = useCallback(() => { setEditing(false); }, []);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-panel)',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        transition: 'all 200ms ease',
        minWidth: 280,
      }}
    >
      <Handle type="target" position={Position.Left} style={{
        background: 'var(--accent)', width: 10, height: 10, border: '2px solid var(--bg-panel)',
      }} />

      <div className="w-9 h-9 flex items-center justify-center text-lg shrink-0" style={{ color: 'var(--accent)' }}>
        {data.icon}
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={e => setLabel(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setLabel(data.label); setEditing(false); } }}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--accent-dim)', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
              padding: '2px 6px', width: '100%',
            }}
            autoFocus
          />
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}
          </p>
        )}
        <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{data.subtitle}</p>
      </div>

      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
        color: 'var(--accent)', border: '1px solid var(--accent-dim)',
        padding: '1px 8px',
      }}>
        FASE {data.faseNumber}
      </span>

      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>›</span>
    </div>
  );
});
