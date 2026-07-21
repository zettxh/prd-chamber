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

  return (
    <Layout showStepper={false}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Proyek Saya
        </h1>
        <button
          onClick={() => navigate('/new')}
          className="px-4 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px"
          style={{
            background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))',
            color: '#fff',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          + Buat Proyek Baru
        </button>
      </div>

      {dummyProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-lg font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Belum ada proyek
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Buat proyek pertama kamu dan mulai generate PRD
          </p>
          <button
            onClick={() => navigate('/new')}
            className="px-6 py-2 rounded-md text-sm font-semibold"
            style={{
              background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))',
              color: '#fff',
              boxShadow: 'var(--shadow-button)',
            }}
          >
            Buat Proyek Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {dummyProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}/prd`)}
              className="p-4 rounded-md cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}
            >
              <h2 className="font-heading text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {project.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.date}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                  style={{
                    background: 'var(--chip-default)',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {statusLabels[project.status] || project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
