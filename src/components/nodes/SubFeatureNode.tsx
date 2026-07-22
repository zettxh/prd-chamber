import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface SubFeatureData {
  name: string;
  description: string;
}

export const SubFeatureNode = memo(function SubFeatureNode({ data }: NodeProps) {
  const typedData = data as unknown as SubFeatureData;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(typedData.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer"
      onDoubleClick={() => setEditing(true)}
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        minWidth: 180,
        maxWidth: 220,
      }}
    >
      <Handle type="target" position={Position.Left} style={{
        background: 'var(--accent-dim)', width: 7, height: 7, border: '2px solid var(--bg-panel)',
      }} />

      <span style={{ color: 'var(--accent-dim)', fontSize: 8, flexShrink: 0 }}>●</span>

      {editing ? (
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={e => {
            if (e.key === 'Enter') setEditing(false);
            if (e.key === 'Escape') { setName(typedData.name); setEditing(false); }
          }}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--accent-dim)', outline: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11,
            padding: '1px 4px', width: '100%', borderRadius: 3,
          }}
          autoFocus
        />
      ) : (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {name}
        </span>
      )}
    </div>
  );
});
