import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { dummyProjects } from '../data/dummy';

const statusLabels: Record<string, string> = {
  prd_ready: 'PRD Siap',
  structured: 'Tersusun',
  clarifying: 'Klarifikasi',
  draft: 'Draft',
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const btnPrimaryStyle: React.CSSProperties = {
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
    <Layout showStepper={false}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>
            Proyek Saya
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Kelola dan generate PRD dari ide kasarmu.
          </p>
        </div>
        <button
          onClick={() => navigate('/new')}
          style={btnPrimaryStyle}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
          onMouseDown={e => { e.currentTarget.style.boxShadow = 'var(--shadow-D1)'; e.currentTarget.style.transform = 'scale(0.985)'; }}
          onMouseUp={e => { e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          + Buat Proyek Baru
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Total Proyek</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: -1.5, lineHeight: 1 }}>4</p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>3 aktif — 2 dalam progress</p>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>PRD Selesai</p>
          <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: -1.5, lineHeight: 1 }}>1</p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>Aplikasi POS Kopi — July 2026</p>
        </div>
      </div>

      {dummyProjects.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}>
          <div className="text-5xl mb-4" style={{ opacity: 0.5 }}>📭</div>
          <h2 className="font-heading text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Belum ada proyek</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Buat proyek pertamamu dan ubah ide kasar jadi PRD lengkap.
          </p>
          <button onClick={() => navigate('/new')} style={{ ...btnPrimaryStyle, fontSize: 15 }}>+ Buat Proyek Pertama</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {dummyProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}/prd`)}
              className="p-4 rounded-2xl cursor-pointer flex items-center justify-between"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)', transition: 'box-shadow 200ms' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1)')}
              onMouseDown={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1)')}
              onMouseUp={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
            >
              <div>
                <h2 className="font-heading text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h2>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.date}</span>
              </div>
              <span
                className="text-xs px-3 py-1 rounded-lg font-semibold"
                style={{
                  background: 'var(--bg)',
                  color: project.status === 'prd_ready' ? 'var(--success)' : 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-D1)',
                }}
              >
                {statusLabels[project.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick action */}
      <div className="mt-6 p-4 rounded-2xl flex items-center justify-between" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Lanjutkan terakhir</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Aplikasi POS Kopi — Executive Summary</p>
        </div>
        <button
          onClick={() => navigate('/project/1/prd')}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg"
          style={{
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-L1)',
          }}
        >
          Lanjutkan →
        </button>
      </div>
    </Layout>
  );
}
