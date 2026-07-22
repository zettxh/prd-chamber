import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StructureNodeData } from '../../stores/structure';

interface RootNodeProps extends NodeProps {
  data: StructureNodeData;
}

export const RootNode = memo(function RootNode({ data, selected }: RootNodeProps) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 cursor-pointer"
      style={{
        background: 'var(--bg-panel)',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
        transition: 'all 200ms ease',
        minWidth: 200,
      }}
    >
      <Handle type="source" position={Position.Right} style={{
        background: 'var(--accent)', width: 10, height: 10, border: '2px solid var(--bg-panel)',
      }} />
      <div
        className="w-9 h-9 flex items-center justify-center text-lg shrink-0"
        style={{ color: 'var(--accent)' }}
      >
        {data.icon}
      </div>
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {data.label}
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{data.subtitle}</p>
      </div>
    </div>
  );
});
