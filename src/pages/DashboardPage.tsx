import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useProjectStore } from '../stores/project';

const statusLabels: Record<string, string> = {
  prd_ready: 'READY',
  structured: 'STRUC',
  clarifying: 'CLARIFY',
  draft: 'DRAFT',
};

const statusClass: Record<string, string> = {
  prd_ready: 'term-badge-ready',
  structured: 'term-badge-active',
  clarifying: 'term-badge-active',
  draft: 'term-badge-draft',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const setActive = useProjectStore((s) => s.setActive);

  const completedCount = projects.filter((p) => p.status === 'prd_ready').length;

  return (
    <Layout showStepper={false}>
      {/* ═══ STAT PANELS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 18 }}>
        <div className="term-panel" style={{ padding: '18px 22px', position: 'relative' }}>
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-muted)', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span className="checkered" /> TOTAL PROJECTS
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            0<span style={{ color: 'var(--text-primary)' }}>{projects.length}</span>
          </div>
        </div>
        <div className="term-panel" style={{ padding: '18px 22px', position: 'relative' }}>
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-muted)', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span className="checkered" /> PRD READY
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            0<span style={{ color: 'var(--success)' }}>{completedCount}</span>
          </div>
        </div>
      </div>

      <div className="term-divider" style={{ marginBottom: 14 }} />

      {/* ═══ SECTION HEADER ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>PROJECTS DIRECTORY
        </span>
        <button onClick={() => navigate('/new')} className="term-btn-accent" style={{ fontSize: 10 }}>
          {'>'} INITIATE NEW PROJECT
        </button>
      </div>

      {/* ═══ TABLE ═══ */}
      {projects.length === 0 ? (
        <div className="term-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <span>$ no projects found</span>
          <span className="checkered" style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle' }} />
        </div>
      ) : (
        <table className="term-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>PID</th>
              <th style={{ width: '42%' }}>PROJECT</th>
              <th style={{ width: '18%' }}>DATE</th>
              <th style={{ width: '12%' }}>STATUS</th>
              <th style={{ width: '16%' }}></th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} onClick={() => { setActive(project.id); navigate(`/project/${project.id}/prd`); }}>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>P-0{project.id}</td>
                <td>└─ {project.title}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{project.date}</td>
                <td><span className={`term-badge ${statusClass[project.status]}`}>{statusLabels[project.status]}</span></td>
                <td><button className="term-btn" style={{ fontSize: 9, padding: '3px 8px' }}>OPEN {'>'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ═══ INITIATE SEQUENCE BAR ═══ */}
      <div className="term-accent-panel" style={{ marginTop: 14, padding: '12px 18px', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="checkered" />
        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>INITIATE SEQUENCE</span>
        <span style={{ color: 'var(--accent-dim)', letterSpacing: '0.1em', flex: 1 }}>{'>>>>>>>>>>>>>>>>>>>>>>>>'}</span>
        <span style={{ color: 'var(--text-muted)' }}>READY</span>
        <span className="checkered" />
      </div>
    </Layout>
  );
}
