import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StructureNodeData } from '../../stores/structure';
import { ICON_MAP } from './icons';

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

  const Icon = ICON_MAP[data.icon] ?? data.icon;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg"
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-panel)',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: 10,
        transition: 'all 200ms ease',
        minWidth: 250,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{
        background: 'var(--accent)', width: 10, height: 10, border: '2px solid var(--bg-panel)',
      }} />
      <Handle type="source" position={Position.Right} style={{
        background: 'var(--accent-dim)', width: 8, height: 8, border: '2px solid var(--bg-panel)',
      }} />

      {/* Icon */}
      <div className="w-9 h-9 flex items-center justify-center text-lg shrink-0 rounded-lg"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
        {typeof Icon !== 'function' ? (
          <span style={{ fontSize: 18 }}>{Icon}</span>
        ) : (
          <Icon size={18} color="var(--text-primary)" />
        )}
      </div>

      {/* Label */}
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
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
              padding: '2px 6px', width: '100%', borderRadius: 4,
            }}
            autoFocus
          />
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {label}
          </p>
        )}
        <p style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{data.subtitle}</p>
      </div>

      {/* FASE badge */}
      <span style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.06em',
        color: '#E8A0A0', border: '1px solid rgba(232,160,160,0.4)',
        background: 'rgba(232,160,160,0.08)',
        padding: '2px 7px', borderRadius: 4,
        position: 'absolute', top: -8, right: 10,
      }}>
        FASE {data.faseNumber}
      </span>

      {/* Chevron */}
      <span style={{ color: 'var(--text-muted)', fontSize: 13, opacity: 0.4 }}>›</span>
    </div>
  );
});
