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

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  const commit = useCallback(() => {
    setEditing(false);
    // Store update via StructurePage callbacks
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Left} style={{
        background: 'var(--accent)', width: 12, height: 12, border: '3px solid var(--bg)',
        boxShadow: 'var(--shadow-L1)',
      }} />

      <div
        className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
        onDoubleClick={() => setEditing(true)}
        style={{
          background: 'var(--bg)',
          boxShadow: selected
            ? 'var(--shadow-D1)'
            : 'var(--shadow-L1)',
          border: selected ? '2px solid var(--accent)' : '2px solid transparent',
          minWidth: 260,
          transition: 'all 250ms ease',
        }}
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
        >
          {data.icon}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') { setLabel(data.label); setEditing(false); }
              }}
              className="text-sm font-semibold w-full"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                borderBottom: '1px dashed var(--accent)',
                padding: '2px 0',
              }}
              autoFocus
            />
          ) : (
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {label}
            </p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {data.subtitle}
          </p>
        </div>

        {/* Fase badge */}
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
          style={{
            background: 'var(--bg)',
            color: 'var(--accent)',
            boxShadow: 'var(--shadow-D1)',
          }}
        >
          FASE {data.faseNumber}
        </span>

        {/* Chevron */}
        <span style={{ color: 'var(--text-secondary)', fontSize: 14, opacity: 0.3 }}>›</span>
      </div>
    </>
  );
});
