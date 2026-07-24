import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { projects as projectsApi, type Project } from '../utils/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    projectsApi.list(activeTab === 'archived')
      .then(res => setProjectList(res.projects))
      .catch(() => setProjectList([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleOpen = (id: string) => {
    navigate(`/project/${id}/prd`);
  };

  const handleArchive = async (e: React.MouseEvent, id: string, currentArchived: number) => {
    e.stopPropagation();
    try {
      await projectsApi.archive(id, currentArchived !== 1);
      setActionMsg('✓ Project updated');
      const res = await projectsApi.list(activeTab === 'archived');
      setProjectList(res.projects);
    } catch {
      setActionMsg('✗ Failed');
    } finally {
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this project? This cannot be undone.')) return;
    try {
      await projectsApi.delete(id);
      setActionMsg('✓ Deleted permanently');
      setProjectList(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setActionMsg(String(err));
    } finally {
      setTimeout(() => setActionMsg(''), 4000);
    }
  };

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
            {loading ? '—' : projectList.length}
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
            —
          </div>
        </div>
      </div>

      <div className="term-divider" style={{ marginBottom: 14 }} />

      {/* ═══ TABS ═══ */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '6px 16px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            border: '1px solid',
            borderColor: activeTab === 'active' ? 'var(--accent)' : 'var(--border-default)',
            background: activeTab === 'active' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'active' ? 'var(--bg-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          ACTIVE
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          style={{
            padding: '6px 16px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            border: '1px solid',
            borderColor: activeTab === 'archived' ? 'var(--accent)' : 'var(--border-default)',
            background: activeTab === 'archived' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'archived' ? 'var(--bg-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          ARCHIVED
        </button>
        {actionMsg && (
          <span style={{ fontSize: 10, color: actionMsg.startsWith('✓') ? 'var(--success)' : 'var(--error)', alignSelf: 'center', marginLeft: 12 }}>
            {actionMsg}
          </span>
        )}
      </div>

      {/* ═══ SECTION HEADER ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>{activeTab === 'active' ? 'PROJECTS DIRECTORY' : 'ARCHIVED PROJECTS'}
        </span>
        {activeTab === 'active' && (
          <button onClick={() => navigate('/new')} className="term-btn-accent" style={{ fontSize: 10 }}>
            {'>'} INITIATE NEW PROJECT
          </button>
        )}
      </div>

      {/* ═══ TABLE ═══ */}
      {loading ? (
        <div className="term-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <span>Loading...</span>
        </div>
      ) : projectList.length === 0 ? (
        <div className="term-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {activeTab === 'active' ? '$ no active projects' : '$ no archived projects'}
          </span>
          <span className="checkered" style={{ display: 'inline-block', marginLeft: 8, verticalAlign: 'middle' }} />
        </div>
      ) : (
        <table className="term-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>PID</th>
              <th style={{ width: '36%' }}>PROJECT</th>
              <th style={{ width: '16%' }}>DATE</th>
              <th style={{ width: '12%' }}>STATUS</th>
              <th style={{ width: '26%' }}></th>
            </tr>
          </thead>
          <tbody>
            {projectList.map((project, idx) => (
              <tr key={project.id} onClick={() => handleOpen(project.id)}>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  P-{String(idx + 1).padStart(2, '0')}
                </td>
                <td style={{ fontSize: 12 }}>└─ {project.name}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                  {new Date(project.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td>
                  <span className="term-badge term-badge-draft">
                    {project.isArchived ? 'ARCHIVED' : 'DRAFT'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {activeTab === 'active' ? (
                    <button
                      onClick={(e) => handleArchive(e, project.id, project.isArchived ?? 0)}
                      className="term-btn"
                      style={{ fontSize: 9, padding: '3px 8px' }}
                      title="Archive project"
                    >
                      {'<'} ARCHIVE
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => handleArchive(e, project.id, project.isArchived ?? 0)}
                        className="term-btn"
                        style={{ fontSize: 9, padding: '3px 8px' }}
                        title="Restore project"
                      >
                        {'>'} RESTORE
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="term-btn"
                        style={{ fontSize: 9, padding: '3px 8px', color: 'var(--error)' }}
                        title="Permanently delete"
                      >
                        DEL
                      </button>
                    </div>
                  )}
                </td>
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
