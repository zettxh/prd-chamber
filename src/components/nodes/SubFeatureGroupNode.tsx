import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { SubGroupIcon } from './icons';

interface SubFeatureGroupData {
  features: { name: string; description: string }[];
}

export const SubFeatureGroupNode = memo(function SubFeatureGroupNode({ data, selected }: NodeProps) {
  const typedData = data as unknown as SubFeatureGroupData;

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
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

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border)',
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

      {/* Feature List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {typedData.features.map((f, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 10,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: 'var(--accent-dim)', fontSize: 7, flexShrink: 0 }}>●</span>
            <span>{f.name}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 6,
          borderTop: '1px solid var(--border)',
          fontSize: 9,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 4,
        }}
      >
        Lihat semua ({typedData.features.length}) <span>›</span>
      </div>
    </div>
  );
});
