import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { structure } from '../utils/api';

type PageState = 'loading' | 'generating' | 'error' | 'done';

export default function StructurePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    nodes, edges, setSelectedPhase, deselectAll, onNodesChange,
    resetLayout, selectedPhaseId, replaceStructure, getStructureForSave, editVersion
  } = useStructureStore();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [genError, setGenError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Auto-save on edit version change (debounced)
  useEffect(() => {
    if (!id || pageState !== 'done') return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const data = getStructureForSave();
        await structure.save(id, data);
        setSaveMsg('✓ Auto-saved');
        setTimeout(() => setSaveMsg(''), 2000);
      } catch {
        // Silent fail
      }
    }, 3000);
  }, [editVersion, id, pageState, getStructureForSave]);

  // Trigger save when structure is generated
  const scheduleSave = useCallback(() => {
    if (!id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const data = getStructureForSave();
        await structure.save(id, data);
        setSaveMsg('✓ Auto-saved');
        setTimeout(() => setSaveMsg(''), 2000);
      } catch {
        // Silent fail
      }
    }, 3000);
  }, [id, getStructureForSave]);

  // Auto-generate on mount if no structure
  useEffect(() => {
    if (!id || mountedRef.current) return;
    mountedRef.current = true;

    structure.get(id).then(data => {
      if (data.structure) {
        replaceStructure(data.structure.phases);
        setPageState('done');
      } else {
        setPageState('generating');
        structure.generate(id).then(res => {
          replaceStructure(res.structure.phases);
          setPageState('done');
          scheduleSave();
        }).catch(err => {
          setGenError(String(err));
          setPageState('error');
        });
      }
    }).catch(err => {
      setGenError(String(err));
      setPageState('error');
    });
  }, [id]);

  const retryGenerate = () => {
    if (!id) return;
    setPageState('generating');
    setGenError('');
    structure.generate(id).then(res => {
      replaceStructure(res.structure.phases);
      setPageState('done');
      scheduleSave();
    }).catch(err => {
      setGenError(String(err));
      setPageState('error');
    });
  };

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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Loading
  if (pageState === 'loading') {
    return (
      <Layout showBack>
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Memuat struktur...
        </div>
      </Layout>
    );
  }

  // Generating
  if (pageState === 'generating') {
    return (
      <Layout showBack>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 }}>
          <div style={{ fontSize: 24, animation: 'pulse 1.5s ease-in-out infinite' }}>◈</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Generating structure via LLM...
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 360, textAlign: 'center' }}>
            Pastikan API key sudah diset di Settings page.
          </div>
        </div>
      </Layout>
    );
  }

  // Error
  if (pageState === 'error') {
    return (
      <Layout showBack>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 }}>
          <div style={{ fontSize: 24 }}>✗</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--error)', textAlign: 'center' }}>
            {genError}
          </div>
          <button onClick={retryGenerate} className="term-btn-accent">
            {'>'} COBA LAGI
          </button>
        </div>
      </Layout>
    );
  }

  // Done — render React Flow
  return (
    <Layout showBack continueLabel="MULAI GENERATE" onContinue={() => navigate(`/project/${id}/prd`)}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={resetLayout}
            className="term-btn"
            style={{ fontSize: 9, padding: '3px 10px' }}
            title="Reset posisi node ke auto-layout"
          >
            ↺ Auto Layout
          </button>
          {saveMsg && (
            <span style={{ fontSize: 9, color: saveMsg.startsWith('✓') ? 'var(--success)' : 'var(--error)' }}>
              {saveMsg}
            </span>
          )}
        </div>
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
