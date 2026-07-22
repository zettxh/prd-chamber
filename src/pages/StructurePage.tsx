import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node, NodeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Layout from '../components/Layout';
import { nodeTypes } from '../components/nodes';
import { useStructureStore, type StructureNodeData } from '../stores/structure';

export default function StructurePage() {
  const navigate = useNavigate();
  const { nodes, edges, setSelectedPhase, deselectAll, onNodesChange, resetLayout, selectedPhaseId } =
    useStructureStore();

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

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  return (
    <Layout showBack continueLabel="MULAI GENERATE" onContinue={() => navigate('/project/dummy-1/generate')}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button
          onClick={resetLayout}
          className="term-btn"
          style={{ fontSize: 9, padding: '3px 10px' }}
          title="Reset posisi node ke auto-layout"
        >
          ↺ Auto Layout
        </button>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {selectedPhaseId ? `selected: ${selectedPhaseId}` : 'drag node → geser | klik → highlight | dbl-klik → edit'}
        </span>
      </div>

      <div className="term-panel" style={{ height: 600, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesChange={handleNodesChange}
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
    </Layout>
  );
}
