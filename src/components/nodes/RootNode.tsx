import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StructureNodeData } from '../../stores/structure';

interface RootNodeProps extends NodeProps {
  data: StructureNodeData;
}

export const RootNode = memo(function RootNode({ data, selected }: RootNodeProps) {
  return (
    <>
      <Handle type="source" position={Position.Right} style={{
        background: 'var(--accent)', width: 12, height: 12, border: '3px solid var(--bg)',
        boxShadow: 'var(--shadow-L1)',
      }} />
      <div
        className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer"
        style={{
          background: 'var(--bg)',
          boxShadow: selected
            ? 'var(--shadow-D1)'
            : 'var(--shadow-L2)',
          border: selected ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'all 250ms ease',
          minWidth: 200,
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
        >
          {data.icon}
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{
              color: 'var(--text-primary)',
              fontFamily: '"Playfair Display", serif',
              letterSpacing: -0.2,
            }}
          >
            {data.label}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {data.subtitle}
          </p>
        </div>
      </div>
    </>
  );
});
