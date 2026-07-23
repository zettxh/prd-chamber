import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import DiffView from '../components/DiffView';
import { dummyVersions, dummyPrdContent } from '../data/dummy';

const versionContent: Record<string, string> = {
  v1: dummyPrdContent['executive-summary'],
  v2: dummyPrdContent['core-features'],
  v3: dummyPrdContent['functional-requirements'],
  v4: dummyPrdContent['architecture'],
};

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [restoreTarget, setRestoreTarget] = useState<typeof dummyVersions[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const v1Id = searchParams.get('v1') || 'v3';
  const v2Id = searchParams.get('v2') || 'v4';

  const v1 = dummyVersions.find(v => v.id === v1Id);
  const v2 = dummyVersions.find(v => v.id === v2Id);

  const v1Content = versionContent[v1Id] || dummyPrdContent['core-features'];
  const v2Content = versionContent[v2Id] || dummyPrdContent['architecture'];

  const confirmRestore = () => {
    if (!restoreTarget) return;
    setToast(`v${restoreTarget.version} berhasil dipulihkan.`);
    setRestoreTarget(null);
    setTimeout(() => {
      navigate(`/project/dummy-1/versions`);
    }, 1500);
  };

  return (
    <Layout showBack showStepper={false}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            Version Comparison
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            Comparing changes between versions
          </p>
        </div>

        {/* Restore button */}
        {v1 && (
          <button
            className="term-btn-accent"
            style={{ fontSize: 10, padding: '6px 14px', marginTop: 4 }}
            onClick={() => setRestoreTarget(v1)}
          >
            ↩ RESTORE v{v1.version}
          </button>
        )}
      </div>

      <DiffView
        oldLabel={v1 ? `v${v1.version}: ${v1.summary}` : v1Id}
        newLabel={v2 ? `v${v2.version}: ${v2.summary}` : v2Id}
        oldContent={v1Content}
        newContent={v2Content}
      />

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
              Ini akan menimpa versi saat ini dengan konten dari <strong style={{ color: 'var(--text-primary)' }}>v{restoreTarget.version}</strong>.
              <br /><br />
              Versi saat ini akan disimpan sebagai backup sebelum dipulihkan.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="term-btn"
                style={{ fontSize: 10 }}
                onClick={() => setRestoreTarget(null)}
              >
                Batal
              </button>
              <button
                className="term-btn-accent"
                style={{ fontSize: 10 }}
                onClick={confirmRestore}
              >
                Pulihkan
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
