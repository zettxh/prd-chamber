import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { dummyStructure } from '../data/dummy';

interface Feature {
  name: string;
  description: string;
}

interface Phase {
  phase_number: number;
  phase_name: string;
  description: string;
  icon: string;
  features: Feature[];
}

type ViewMode = 'graph' | 'detail';

export default function StructurePage() {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const navigate = useNavigate();
  const phases = dummyStructure.phases;

  const handleSelectPhase = (phase: Phase) => {
    setSelectedPhase(phase);
    setViewMode('detail');
  };

  const handleBackToGraph = () => {
    setViewMode('graph');
  };

  // ===================== BUTTON STYLES =====================
  const btnPrimary: React.CSSProperties = {
    background: 'var(--bg)', color: 'var(--accent)', fontWeight: 700,
    border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 12, fontSize: 14,
    boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const btnSmall: React.CSSProperties = {
    background: 'var(--bg)', color: 'var(--text-primary)', fontWeight: 500,
    border: 'none', cursor: 'pointer', padding: '7px 16px', borderRadius: 10, fontSize: 12,
    boxShadow: 'var(--shadow-L1)', transition: 'box-shadow 200ms',
  };

  // ===================== GRAPH VIEW =====================
  if (viewMode === 'graph') {
    return (
      <Layout showBack>
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>
            Struktur
          </h1>
          <button
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'var(--bg)', color: 'var(--accent)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-L1)' }}
          >
            Regenerate
          </button>
        </div>

        <div className="flex gap-8 items-start">
          {/* ═══════ LEFT COLUMN: Node Graph ═══════ */}
          <div className="relative" style={{ minWidth: 300 }}>
            {/* Central node */}
            <div className="flex flex-col items-center mb-2">
              <div
                className="flex items-center gap-3 p-4 rounded-2xl w-full"
                style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L2)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
                >
                  📋
                </div>
                <div>
                  <p className="font-heading text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    PRD Chamber
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Perencanaan
                  </p>
                </div>
              </div>
            </div>

            {/* Curved connector lines + Phase nodes */}
            <div className="flex flex-col items-center">
              {phases.map((phase, i) => (
                <div key={i} className="flex items-center w-full">
                  {/* Connector line area */}
                  <div className="flex flex-col items-center" style={{ width: 28 }}>
                    {/* Vertical line */}
                    <div style={{
                      width: 2, height: i === 0 ? 20 : 16, marginTop: i === 0 ? -4 : 0,
                      boxShadow: 'var(--divider-dark), var(--divider-light)',
                      background: 'var(--bg)',
                    }} />

                    {/* Horizontal branch line */}
                    <div className="flex items-center" style={{ height: 10 }}>
                      <div style={{
                        width: 18, height: 2, marginLeft: -1,
                        boxShadow: 'var(--divider-dark), var(--divider-light)',
                        background: 'var(--bg)',
                      }} />
                      {/* Dot connector */}
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--bg)',
                        boxShadow: selectedPhase?.phase_name === phase.phase_name
                          ? 'var(--shadow-D1)' : 'var(--shadow-L1)',
                      }} />
                    </div>

                    {/* Vertical continuation (except last) */}
                    {i < phases.length - 1 && (
                      <div style={{
                        width: 2, height: 6,
                        boxShadow: 'var(--divider-dark), var(--divider-light)',
                        background: 'var(--bg)',
                      }} />
                    )}
                  </div>

                  {/* Phase card */}
                  <div
                    onClick={() => handleSelectPhase(phase)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all flex-1"
                    style={{
                      background: 'var(--bg)',
                      boxShadow: 'var(--shadow-L1)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1)')}
                    onMouseDown={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1)')}
                    onMouseUp={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
                    >
                      {phase.icon}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {phase.phase_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Direncanakan
                      </p>
                    </div>

                    {/* Fase badge */}
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{ background: 'var(--bg)', color: 'var(--accent)', boxShadow: 'var(--shadow-D1)' }}
                    >
                      FASE {phase.phase_number}
                    </span>

                    {/* Chevron */}
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14, opacity: 0.3 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ RIGHT COLUMN: Preview hint ═══════ */}
          <div className="flex-1 flex items-center justify-center rounded-2xl p-12" style={{
            background: 'var(--bg)', boxShadow: 'var(--shadow-D1)', minHeight: 400,
          }}>
            <div className="text-center">
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>👆</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
                Klik salah satu fase di kiri untuk melihat sub-fitur dan detail
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate('/project/dummy-1/prd')}
            style={btnPrimary}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
            onMouseDown={e => { e.currentTarget.style.boxShadow = 'var(--shadow-D1)'; e.currentTarget.style.transform = 'scale(0.985)'; }}
            onMouseUp={e => { e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Lanjut → Generate PRD
          </button>
        </div>
      </Layout>
    );
  }

  // ===================== DETAIL VIEW =====================
  return (
    <Layout showBack>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBackToGraph} style={btnSmall}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1)')}
        >
          ← Kembali ke Struktur
        </button>
        <h1 className="font-heading text-[22px] font-bold" style={{ color: 'var(--text-primary)', letterSpacing: -0.3 }}>
          {selectedPhase?.phase_name}
        </h1>
      </div>

      {selectedPhase && (
        <>
          {/* Phase header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-6" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}>
              {selectedPhase.icon}
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedPhase.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--accent)', boxShadow: 'var(--shadow-D1)' }}>
                  FASE {selectedPhase.phase_number}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {selectedPhase.features.length} sub-fitur
                </span>
              </div>
            </div>
          </div>

          {/* Sub-feature list */}
          <div className="flex flex-col gap-3">
            {selectedPhase.features.map((f, j) => (
              <div
                key={j}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}
              >
                {/* Connector from left */}
                <div className="flex items-center gap-3">
                  <div style={{ width: 8, height: 2, boxShadow: 'var(--divider-dark), var(--divider-light)', background: 'var(--bg)' }} />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'var(--bg)', color: 'var(--accent)', boxShadow: 'var(--shadow-D1)' }}
                  >
                    {j + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-D1)' }}>
                  {selectedPhase.phase_name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom CTA */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => navigate('/project/dummy-1/prd')}
          style={btnPrimary}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
          onMouseDown={e => { e.currentTarget.style.boxShadow = 'var(--shadow-D1)'; e.currentTarget.style.transform = 'scale(0.985)'; }}
          onMouseUp={e => { e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Lanjut → Generate PRD
        </button>
      </div>
    </Layout>
  );
}
