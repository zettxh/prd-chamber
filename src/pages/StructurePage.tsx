import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MermaidDiagram from '../components/MermaidDiagram';
import { dummyStructure } from '../data/dummy';

interface Feature { name: string; description: string; complexity: string; sub_features: string[]; }

function generateMermaid(structure: typeof dummyStructure): string {
  let chart = 'flowchart TD\n';
  const colors = ['#C48A1A', '#827B73', '#588A58', '#C05A5A', '#C4952A'];
  structure.phases.forEach((phase, pi) => {
    chart += `  subgraph Phase${pi + 1}["${phase.phase_name}"]\n`;
    chart += `    direction TB\n`;
    phase.features.forEach((feature, fi) => {
      chart += `    P${pi + 1}F${fi + 1}["${feature.name}"]\n`;
      chart += `    style P${pi + 1}F${fi + 1} fill:${colors[pi]},color:#fff\n`;
    });
    chart += `  end\n`;
  });
  return chart;
}

export default function StructurePage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<Feature | null>(null);
  const navigate = useNavigate();
  const chart = generateMermaid(dummyStructure);

  const findFeature = (name: string): Feature | null => {
    for (const phase of dummyStructure.phases) {
      const f = phase.features.find(f => f.name === name);
      if (f) return f;
    }
    return null;
  };

  const handleNodeClick = (nodeText: string) => {
    setSelectedNode(nodeText);
    for (const phase of dummyStructure.phases) {
      const feature = phase.features.find(f => f.name === nodeText);
      if (feature) { setSelectedNode(feature.name); return; }
    }
  };

  const feature = selectedNode ? findFeature(selectedNode) : null;

  const btnStyle: React.CSSProperties = {
    background: 'var(--bg)', border: 'none', cursor: 'pointer',
    padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    boxShadow: 'var(--shadow-L1)', color: 'var(--text-primary)',
  };

  const btnPrimary: React.CSSProperties = {
    ...btnStyle, color: 'var(--accent)', fontWeight: 700, padding: '10px 22px', fontSize: 14, borderRadius: 12,
    boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
  };

  return (
    <Layout showBack>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>Struktur Fitur</h1>
        <button style={{ ...btnStyle, color: 'var(--accent)' }}>Regenerate</button>
      </div>

      <div className="p-5 rounded-2xl mb-5" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
        <MermaidDiagram chart={chart} onNodeClick={handleNodeClick} />
      </div>

      {feature && (
        <div className="p-5 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
          <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{feature.name}</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-D1)' }}>
              Kompleksitas: {feature.complexity}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Sub Fitur</p>
            <ul className="flex flex-col gap-1">
              {feature.sub_features.map((sf, i) => (
                <li key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>• {sf}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => setDetailModal(feature)} className="text-xs font-semibold self-start" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Detail ›
          </button>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setDetailModal(null)}>
          <div className="p-6 rounded-2xl max-w-sm w-full flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L2)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{detailModal.name}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{detailModal.description}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Kompleksitas: {detailModal.complexity}</p>
            <ul className="flex flex-col gap-1">
              {detailModal.sub_features.map((sf, i) => <li key={i} className="text-xs" style={{ color: 'var(--text-primary)' }}>• {sf}</li>)}
            </ul>
            <button onClick={() => setDetailModal(null)} style={{ ...btnStyle, alignSelf: 'flex-start' }}>Tutup</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => navigate('/project/dummy-1/prd')} style={btnPrimary}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
        >
          Lanjut → Generate PRD
        </button>
      </div>
    </Layout>
  );
}
