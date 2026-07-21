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
  const {
    nodes,
    edges,
    selectedPhaseId,
    setSelectedPhase,
  } = useStructureStore();

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedPhaseId) || null,
    [nodes, selectedPhaseId],
  );

  const subFeatures = selectedNode?.data?.subFeatures || [];

  // onNodeClick
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<StructureNodeData>) => {
      if (node.data.isRoot) {
        setSelectedPhase(null);
      } else {
        setSelectedPhase(node.id);
      }
    },
    [setSelectedPhase],
  );

  // onNodeDoubleClick → inline edit (PhaseNode handles its own state)
  // onPaneClick → deselect
  const onPaneClick = useCallback(() => {
    setSelectedPhase(null);
  }, [setSelectedPhase]);

  // onConnect → no-op (frontend only, no mutations via drawing)
  const onConnect = useCallback(() => {}, []);

  // ===================== BTN STYLES =====================
  const btnPrimary: React.CSSProperties = {
    background: 'var(--bg)',
    color: 'var(--accent)',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    padding: '10px 22px',
    borderRadius: 12,
    fontSize: 14,
    boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <Layout showBack>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1
          className="text-[28px] font-bold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: '"Playfair Display", serif',
            letterSpacing: -0.4,
          }}
        >
          Struktur
        </h1>
        <button
          className="text-xs font-semibold px-4 py-2 rounded-xl"
          style={{
            background: 'var(--bg)',
            color: 'var(--accent)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-L1)',
          }}
        >
          Regenerate
        </button>
      </div>

      {/* Content split: Canvas + Panel */}
      <div className="flex gap-6" style={{ height: 'calc(100vh - 180px)' }}>
        {/* ═════ REACT FLOW CANVAS ═════ */}
        <div
          className="flex-1 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg)',
            boxShadow: 'var(--shadow-D1)',
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            panOnScroll
            selectionOnDrag={false}
            deleteKeyCode={null}
            proOptions={{ hideAttribution: true }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          >
            <Controls
              position="bottom-right"
              style={{
                background: 'var(--bg)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-L1)',
                border: 'none',
              }}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--text-secondary)"
              style={{ opacity: 0.12 }}
            />
          </ReactFlow>
        </div>

        {/* ═════ RIGHT PANEL: Sub-feature detail ═════ */}
        <div
          className="rounded-2xl p-6 flex flex-col overflow-y-auto"
          style={{
            width: 340,
            minWidth: 340,
            background: 'var(--bg)',
            boxShadow: selectedNode ? 'var(--shadow-L1)' : 'var(--shadow-D1)',
            transition: 'box-shadow 300ms ease',
          }}
        >
          {!selectedNode ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.35 }}>👆</div>
              <p
                className="text-sm"
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: 200,
                }}
              >
                Klik salah satu fase di kiri untuk melihat sub-fitur dan detail
              </p>
            </div>
          ) : (
            <>
              {/* Node header */}
              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-5"
                style={{
                  background: 'var(--bg)',
                  boxShadow: 'var(--shadow-D1)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}
                >
                  {selectedNode.data.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: '"Playfair Display", serif',
                    }}
                  >
                    {selectedNode.data.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedNode.data.subtitle} · Fase {selectedNode.data.faseNumber}
                  </p>
                </div>
              </div>

              {/* Sub-feature header */}
              <div
                className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--bg)',
                  boxShadow: 'var(--shadow-D1)',
                }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--accent)',
                    boxShadow: 'var(--shadow-L1)',
                  }}
                >
                  SUB FITUR
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Lihat semua ({subFeatures.length}) ›
                </span>
              </div>

              {/* Sub-feature list */}
              <div className="flex flex-col gap-3">
                {subFeatures.map((sf, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 p-3.5 rounded-xl transition-all"
                    style={{
                      background: 'var(--bg)',
                      boxShadow: 'var(--shadow-L1)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{
                        background: 'var(--bg)',
                        color: 'var(--accent)',
                        boxShadow: 'var(--shadow-D1)',
                      }}
                    >
                      {j + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {sf.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {sf.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate('/project/dummy-1/prd')}
          style={btnPrimary}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow =
              '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')
          }
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-D1)';
            e.currentTarget.style.transform = 'scale(0.985)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow =
              '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Lanjut → Generate PRD
        </button>
      </div>
    </Layout>
  );
}
