import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MermaidDiagram from '../components/MermaidDiagram';
import { dummyStructure } from '../data/dummy';

interface Feature {
  name: string;
  description: string;
  complexity: string;
  sub_features: string[];
}

function generateMermaid(structure: typeof dummyStructure): string {
  let chart = 'flowchart TD\n';
  const colors = ['#8B6914', '#6B5E4F', '#5B8C5A', '#A44242', '#B8860B'];
  structure.phases.forEach((phase, pi) => {
    chart += `  subgraph Phase${pi + 1}["${phase.phase_name}"]\n`;
    chart += `    direction TB\n`;
    phase.features.forEach((feature, fi) => {
      const nodeId = `P${pi + 1}F${fi + 1}`;
      chart += `    ${nodeId}["${feature.name}"]\n`;
      chart += `    style ${nodeId} fill:${colors[pi]},color:#fff\n`;
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
    // Find the feature
    for (const phase of dummyStructure.phases) {
      const feature = phase.features.find(f => f.name === nodeText);
      if (feature) {
        setSelectedNode(feature.name);
        return;
      }
    }
  };

  const feature = selectedNode ? findFeature(selectedNode) : null;

  return (
    <Layout showBack>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Struktur Fitur
        </h1>
        <button
          className="text-xs px-3 py-1 rounded-md"
          style={{ color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
          onClick={() => alert('Regenerate (dummy)')}
        >
          Regenerate
        </button>
      </div>

      <div className="p-4 rounded-md mb-4" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
        <MermaidDiagram chart={chart} onNodeClick={handleNodeClick} />
      </div>

      {feature && (
        <div className="p-4 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}>
          <h2 className="font-heading text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {feature.name}
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--chip-default)', color: 'var(--text-secondary)' }}>
              Kompleksitas: {feature.complexity}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>SUB FITUR</p>
            <ul className="space-y-1">
              {feature.sub_features.slice(0, 3).map((sf, i) => (
                <li key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>• {sf}</li>
              ))}
            </ul>
            {feature.sub_features.length > 3 && (
              <button className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>
                Lihat semua ({feature.sub_features.length})
              </button>
            )}
          </div>
          <button
            onClick={() => setDetailModal(feature)}
            className="mt-3 text-xs font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            Detail ›
          </button>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetailModal(null)}>
          <div className="p-6 rounded-md max-w-sm w-full" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{detailModal.name}</h3>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{detailModal.description}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Kompleksitas: {detailModal.complexity}</p>
            <ul className="space-y-1 mb-3">
              {detailModal.sub_features.map((sf, i) => (
                <li key={i} className="text-xs" style={{ color: 'var(--text-primary)' }}>• {sf}</li>
              ))}
            </ul>
            <button onClick={() => setDetailModal(null)} className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>Tutup</button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate(`/project/dummy-1/prd`)}
          className="px-5 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px"
          style={{
            background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))',
            color: '#fff',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          Lanjut → Generate PRD
        </button>
      </div>
    </Layout>
  );
}
