import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { versions as versionsApi, type VersionEntry } from '../utils/api';

const TRIGGER_LABELS: Record<string, string> = {
  manual: 'Manual save',
  generation_complete: 'Generation complete',
  outline_regen: 'Outline regenerated',
  revision: 'Revision approved',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function VersionHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ?? '';

  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VersionEntry | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load versions on mount
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setLoadError(null);

    versionsApi.list(projectId)
      .then(({ versions: list }) => {
        setVersions(list);
        if (list.length > 0) setSelected(list[0].id);
      })
      .catch((err: Error) => {
        setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCompare = (versionId: string) => {
    const latest = versions[0];
    if (!latest) return;
    navigate(`/project/${projectId}/compare?v1=${versionId}&v2=${latest.id}`);
  };

  const handleRestoreClick = (version: VersionEntry) => {
    setRestoreTarget(version);
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const result = await versionsApi.restore(projectId, restoreTarget.id);
      setToast(`v${restoreTarget.version} berhasil dipulihkan. ${result.message}`);
      setRestoreTarget(null);
      // Reload versions
      const { versions: list } = await versionsApi.list(projectId);
      setVersions(list);
      if (list.length > 0) setSelected(list[0].id);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Gagal memulihkan versi');
      setRestoreTarget(null);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <Layout showBack showStepper={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
            Loading versions...
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="term-panel" style={{ height: 60, opacity: 0.4 }} />
          ))}
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout showBack showStepper={false}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e07070',
          padding: '16px', border: '1px solid rgba(224,112,112,0.3)',
          borderRadius: 6, marginTop: 16,
        }}>
          Error: {loadError}
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack showStepper={false}>
      {/* Header */}
      <h1 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        marginBottom: 16,
      }}>
        Version History
      </h1>

      {/* Info bar */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {versions.length} versions — auto-snapshot at key milestones
      </div>

      {/* Empty state */}
      {versions.length === 0 && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '40px 0',
        }}>
          No versions saved yet. Versions are created automatically at key milestones.
        </div>
      )}

      {/* Version list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {versions.map((v, i) => (
          <div key={v.id} className="term-panel" style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderLeft: selected === v.id ? '2px solid var(--accent)' : '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'all 120ms',
          }} onClick={() => setSelected(v.id)}>
            {/* Version number */}
            <span style={{ fontSize: 10, color: 'var(--accent)', minWidth: 32, fontWeight: 700 }}>
              v{v.version}
            </span>

            {/* Meta */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 3 }}>
                {v.summary}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                <span>{formatDate(v.createdAt)}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>{TRIGGER_LABELS[v.trigger] ?? v.trigger}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="term-btn"
                style={{ fontSize: 9, padding: '3px 8px' }}
                onClick={(e) => { e.stopPropagation(); handleCompare(v.id); }}
              >
                COMPARE
              </button>
              {i > 0 && (
                <button
                  className="term-btn-accent"
                  style={{ fontSize: 9, padding: '3px 8px' }}
                  onClick={(e) => { e.stopPropagation(); handleRestoreClick(v); }}
                >
                  RESTORE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Restore confirm modal */}
      {restoreTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div className="term-panel" style={{ padding: 24, maxWidth: 400, width: '90%' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              ⚠️ Pulihkan versi ini?
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 20,
              lineHeight: 1.6,
            }}>
              Ini akan menimpa versi saat ini dengan konten dari{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                v{restoreTarget.version} — {restoreTarget.summary}
              </strong>
              .
              <br /><br />
              Versi saat ini akan disimpan sebagai backup sebelum dipulihkan.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="term-btn"
                style={{ fontSize: 10 }}
                onClick={() => setRestoreTarget(null)}
                disabled={restoring}
              >
                Batal
              </button>
              <button
                className="term-btn-accent"
                style={{ fontSize: 10 }}
                onClick={confirmRestore}
                disabled={restoring}
              >
                {restoring ? 'Memulihkan...' : 'Pulihkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--bg-panel)',
          border: '1px solid var(--success)',
          borderLeft: '3px solid var(--success)',
          borderRadius: 6,
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-primary)',
          zIndex: 60,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          maxWidth: 360,
        }}>
          ✓ {toast}
        </div>
      )}
    </Layout>
  );
}
