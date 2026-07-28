import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DiffView from '../components/DiffView';
import { versions as versionsApi } from '../utils/api';

function buildDiffText(prdDataJson: string | null): string {
  if (!prdDataJson) return '(no PRD data)';
  try {
    const data = JSON.parse(prdDataJson);
    const lines: string[] = [];
    lines.push(`TIER: ${data.tier ?? '?'} — ${data.tier_reason ?? ''}`);
    lines.push(`FLAGS: ${(data.flags ?? []).join(', ') || 'none'}`);
    lines.push('---');
    const sections = data.sections ?? [];
    sections
      .slice()
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .forEach((s: { id: string; name: string; content: string | null }) => {
        lines.push(`## [${s.name}]`);
        lines.push(s.content?.trim() || '(empty)');
        lines.push('---');
      });
    return lines.join('\n');
  } catch {
    return prdDataJson;
  }
}

export default function ComparePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = id ?? '';

  const v1Id = searchParams.get('v1') ?? '';
  const v2Id = searchParams.get('v2') ?? '';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof versionsApi.compare>> | null>(null);

  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !v1Id || !v2Id) {
      setLoadError('Missing version IDs');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    versionsApi.compare(projectId, v1Id, v2Id)
      .then(data => {
        setResult(data);
      })
      .catch((err: Error) => {
        setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  }, [projectId, v1Id, v2Id]);

  const handleRestore = async () => {
    if (!result || !v1Id) return;
    setRestoring(true);
    try {
      await versionsApi.restore(projectId, v1Id);
      setToast(`v${result.v1.version} berhasil dipulihkan`);
      setRestoreTarget(null);
      setTimeout(() => navigate(`/project/${projectId}/versions`), 1500);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Gagal memulihkan');
      setRestoreTarget(null);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <Layout showBack showStepper={false}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '40vh', fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--accent)',
        }}>
          Loading comparison...
        </div>
      </Layout>
    );
  }

  if (loadError || !result) {
    return (
      <Layout showBack showStepper={false}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e07070',
          padding: 16, marginTop: 16,
        }}>
          Error: {loadError ?? 'Failed to load versions'}
        </div>
      </Layout>
    );
  }

  const { v1, v2 } = result;
  const v1Text = buildDiffText(v1.prdDataSnapshot);
  const v2Text = buildDiffText(v2.prdDataSnapshot);

  return (
    <Layout showBack showStepper={false}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 20,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--text-primary)', marginBottom: 6,
          }}>
            Version Comparison
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            Comparing v{v1.version} → v{v2.version}
          </p>
        </div>

        <button
          className="term-btn-accent"
          style={{ fontSize: 10, padding: '6px 14px', marginTop: 4 }}
          onClick={() => setRestoreTarget(v1.id)}
        >
          ↩ RESTORE v{v1.version}
        </button>
      </div>

      {/* Version badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontSize: 10 }}>
        <div style={{
          padding: '4px 10px', border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
        }}>
          v{v1.version} — {v1.summary} ({new Date(v1.createdAt).toLocaleDateString()})
        </div>
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>→</div>
        <div style={{
          padding: '4px 10px', border: '1px solid var(--accent-dim)',
          fontFamily: 'var(--font-mono)', color: 'var(--accent)',
        }}>
          v{v2.version} — {v2.summary} ({new Date(v2.createdAt).toLocaleDateString()})
        </div>
      </div>

      <DiffView
        oldLabel={`v${v1.version}: ${v1.summary}`}
        newLabel={`v${v2.version}: ${v2.summary}`}
        oldContent={v1Text}
        newContent={v2Text}
      />

      {/* Restore confirm modal */}
      {restoreTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div className="term-panel" style={{ padding: 24, maxWidth: 400, width: '90%' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
              color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              ⚠️ Pulihkan versi ini?
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)',
              marginBottom: 20, lineHeight: 1.6,
            }}>
              Ini akan menimpa versi saat ini dengan konten dari{' '}
              <strong style={{ color: 'var(--text-primary)' }}>v{v1.version} — {v1.summary}</strong>.
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
                onClick={handleRestore}
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
          position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-panel)',
          border: '1px solid var(--success)', borderLeft: '3px solid var(--success)',
          borderRadius: 6, padding: '12px 16px', fontFamily: 'var(--font-mono)',
          fontSize: 11, color: 'var(--text-primary)', zIndex: 60,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)', maxWidth: 360,
        }}>
          ✓ {toast}
        </div>
      )}
    </Layout>
  );
}
