import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { dummyVersions } from '../data/dummy';

export default function VersionHistoryPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<typeof dummyVersions[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleCompare = (versionId: string) => {
    // Navigate to compare page — compare selected version with latest (v4)
    navigate(`/project/dummy-1/compare?v1=${versionId}&v2=v4`);
  };

  const handleRestoreClick = (version: typeof dummyVersions[0]) => {
    setRestoreTarget(version);
  };

  const confirmRestore = () => {
    if (!restoreTarget) return;
    setToast(`v${restoreTarget.version} berhasil dipulihkan. Perubahan saat ini disimpan sebagai backup.`);
    setRestoreTarget(null);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <Layout showBack showStepper={false}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dummyVersions.map((v, i) => (
          <div key={v.id} className="term-panel" style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderLeft: selected === v.id ? '2px solid var(--accent)' : '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'all 120ms',
          }} onClick={() => setSelected(v.id)}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 30 }}>v{v.version}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-primary)' }}>{v.summary}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.date}</div>
            </div>
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

      {/* Toast notification */}
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
