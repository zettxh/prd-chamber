import { useCallback } from 'react';
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
  const { nodes, edges, setSelectedPhase, deselectAll, selectedPhaseId } = useStructureStore();

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<StructureNodeData>) => {
      if (node.data.isRoot) {
        deselectAll();
      } else if (node.type === 'phaseNode') {
        setSelectedPhase(node.id);
      }
    },
    [setSelectedPhase, deselectAll],
  );

  const onPaneClick = useCallback(() => deselectAll(), [deselectAll]);

  return (
    <Layout showBack>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
          ingin membuat web app yang dimanfaatkan untuk...
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {selectedPhaseId ? `selected: ${selectedPhaseId}` : 'klik node → highlight | dbl-klik → edit label'}
        </span>
      </div>

      <div className="term-panel" style={{ height: 600, overflow: 'hidden' }}>
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

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={() => navigate(-1)} className="term-btn">← KEMBALI</button>
        <button onClick={() => navigate('/project/dummy-1/generate')} className="term-btn-accent">{'>'} MULAI GENERATE PRD</button>
      </div>
    </Layout>
  );
}
