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

export default function StructurePage() {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const navigate = useNavigate();
  const phases = dummyStructure.phases;

  const btnPrimary: React.CSSProperties = {
    background: 'var(--bg)', color: 'var(--accent)', fontWeight: 700,
    border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 12, fontSize: 14,
    boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <Layout showBack>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>
          Struktur Fitur
        </h1>
        <button
          className="text-xs font-semibold px-4 py-2 rounded-xl"
          style={{ background: 'var(--bg)', color: 'var(--accent)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-L1)' }}
        >
          Regenerate
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* ═══════ LEFT: Central Node + Phase Cards ═══════ */}
        <div className="flex flex-col gap-4" style={{ minWidth: 280 }}>
          {/* Central Node */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L2)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
            >
              📋
            </div>
            <div>
              <p className="font-heading text-sm font-bold" style={{ color: 'var(--text-primary)' }}>PRD Chamber</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Perencanaan</p>
            </div>
          </div>

          {/* Connector line */}
          <div className="flex justify-center">
            <div style={{ width: 2, height: 8, background: 'var(--bg)', boxShadow: 'var(--divider-dark)' }} />
          </div>

          {/* Phase Cards */}
          {phases.map((phase, i) => (
            <div key={i}>
              {/* Curved connector from previous */}
              {i > 0 && (
                <div className="flex items-center gap-2 ml-4 mb-1">
                  <div style={{ width: 2, height: 6, background: 'var(--bg)', boxShadow: 'var(--divider-dark)' }} />
                </div>
              )}

              <div
                onClick={() => setSelectedPhase(phase)}
                className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: 'var(--bg)',
                  boxShadow: selectedPhase?.phase_name === phase.phase_name ? 'var(--shadow-D1)' : 'var(--shadow-L1)',
                  marginLeft: i > 0 ? 12 : 0,
                }}
                onMouseEnter={e => {
                  if (selectedPhase?.phase_name !== phase.phase_name) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedPhase?.phase_name !== phase.phase_name) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-L1)';
                  }
                }}
                onMouseDown={e => { e.currentTarget.style.boxShadow = 'var(--shadow-D1)'; }}
                onMouseUp={e => {
                  e.currentTarget.style.boxShadow = selectedPhase?.phase_name === phase.phase_name
                    ? 'var(--shadow-D1)' : 'var(--shadow-L1-hover)';
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
                >
                  {phase.icon}
                </div>

                {/* Phase info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {phase.phase_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Direncanakan</p>
                </div>

                {/* Fase badge */}
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                  style={{ background: 'var(--bg)', color: 'var(--accent)', boxShadow: 'var(--shadow-D1)' }}
                >
                  FASE {phase.phase_number}
                </span>

                {/* Chevron */}
                <span style={{ color: 'var(--text-secondary)', fontSize: 14, opacity: 0.4 }}>›</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ RIGHT: Sub-feature Detail Panel ═══════ */}
        <div className="flex-1 min-w-0">
          {selectedPhase ? (
            <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
              {/* Panel header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
                >
                  {selectedPhase.icon}
                </div>
                <div>
                  <p className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    SUB FITUR
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedPhase.phase_name} — {selectedPhase.features.length} fitur
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <div className="flex flex-col gap-2">
                {selectedPhase.features.map((f, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--bg)', color: 'var(--accent)', boxShadow: 'var(--shadow-D1)' }}
                    >
                      {j + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{f.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show all */}
              <button
                className="text-xs font-semibold self-start flex items-center gap-1"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Lihat semua ({selectedPhase.features.length}) <span>›</span>
              </button>
            </div>
          ) : (
            /* Empty state — no phase selected */
            <div
              className="flex items-center justify-center h-full min-h-[300px] rounded-2xl p-8"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}
            >
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                Klik salah satu fase di kiri untuk melihat sub-fitur
              </p>
            </div>
          )}
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
