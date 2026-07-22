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
  const onConnect = useCallback(() => {}, []);

  return (
    <Layout showBack>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>FEATURE MAP — INTERACTIVE NODE GRAPH
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>click node → detail | dbl-click → edit label</span>
      </div>

      <div className="term-panel" style={{ height: 550, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onConnect={onConnect}
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

      {/* Detail panel */}
      {selectedNode && !selectedNode.data.isRoot && (
        <div className="term-accent-panel" style={{ marginTop: 12, padding: '14px 18px', fontSize: 11, color: 'var(--text-secondary)' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 6 }}>◈ {selectedNode.data.label} — Sub-features</div>
          <ul style={{ paddingLeft: 14, margin: 0 }}>
            {subFeatures.map((sf: { name: string; description: string }, i: number) => (
              <li key={i} style={{ marginBottom: 2 }}>{sf.name}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={() => navigate(-1)} className="term-btn">← KEMBALI</button>
        <button onClick={() => navigate('/project/dummy-1/generate')} className="term-btn-accent">{'>'} MULAI GENERATE PRD</button>
      </div>
    </Layout>
  );
}
