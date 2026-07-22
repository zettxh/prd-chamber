import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Layout from '../components/Layout';
import { nodeTypes } from '../components/nodes';
import { useStructureStore, type StructureNodeData } from '../stores/structure';

export default function StructurePage() {
  const navigate = useNavigate();
  const { nodes, edges, selectedPhaseId, setSelectedPhase } = useStructureStore();

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedPhaseId) || null,
    [nodes, selectedPhaseId],
  );
  const subFeatures = selectedNode?.data?.subFeatures || [];

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<StructureNodeData>) => {
      if (node.data.isRoot) setSelectedPhase(null);
      else setSelectedPhase(node.id);
    },
    [setSelectedPhase],
  );

  const onPaneClick = useCallback(() => setSelectedPhase(null), [setSelectedPhase]);

  return (
    <Layout showBack>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
          ingin membuat web app yang dimanfaatkan untuk...
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>click node → detail | dbl-click → edit label</span>
      </div>

      {/* ═══ Split layout: Canvas + Detail Panel ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 260px' : '1fr', gap: 12, transition: 'all 250ms' }}>
        {/* LEFT: React Flow Canvas */}
        <div className="term-panel" style={{ height: 520, overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={null}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnScroll
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(138,155,174,0.12)" />
          </ReactFlow>
        </div>

        {/* RIGHT: Detail Panel */}
        {selectedNode && !selectedNode.data.isRoot && (
          <div className="term-panel" style={{ height: 520, overflow: 'auto', animation: 'term-fadein 0.25s ease-out' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{selectedNode.data.icon}</span>
                <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  SUB FITUR
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {selectedNode.data.label}
              </div>
            </div>

            {/* Sub-feature list */}
            <div style={{ padding: '8px 0' }}>
              {subFeatures.map((sf, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid rgba(58,58,54,0.4)',
                    cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,200,190,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-dim)', fontSize: 11, marginTop: 1 }}>●</span>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {sf.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {sf.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, color: 'var(--accent)', cursor: 'pointer' }}>
                Lihat semua ({subFeatures.length}) ›
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Bottom Buttons ═══ */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={() => navigate(-1)} className="term-btn">← KEMBALI</button>
        <button onClick={() => navigate('/project/dummy-1/generate')} className="term-btn-accent">{'>'} MULAI GENERATE PRD</button>
      </div>
    </Layout>
  );
}
