import { useState } from 'react';
import Layout from '../components/Layout';
import { dummyVersions } from '../data/dummy';

export default function VersionHistoryPage() {
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const btnStyle: React.CSSProperties = {
    background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 8,
    fontSize: 12, fontWeight: 600, boxShadow: 'var(--shadow-L1)',
  };

  return (
    <Layout showBack>
      <h1 className="font-heading text-[28px] font-bold mb-8" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>Version History</h1>

      <div className="flex flex-col gap-3">
        {dummyVersions.map(v => (
          <div key={v.id} className="p-4 rounded-2xl flex flex-col gap-2" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-bold" style={{ color: 'var(--text-primary)' }}>v{v.version}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.date}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.summary}</p>
            <div className="flex gap-2 mt-1">
              <button style={{ ...btnStyle, color: 'var(--accent)' }}>Bandingkan</button>
              <button onClick={() => setConfirmRestore(v.id)} style={{ ...btnStyle, color: 'var(--error)' }}>Pulihkan</button>
            </div>
          </div>
        ))}
      </div>

      {confirmRestore && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="p-6 rounded-2xl max-w-xs flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L2)' }}>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Simpan versi saat ini sebagai snapshot sebelum memulihkan. Lanjutkan?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmRestore(null)} style={{ ...btnStyle, color: 'var(--text-primary)' }}>Batal</button>
              <button onClick={() => { alert('Restored (dummy)'); setConfirmRestore(null); }} style={{ ...btnStyle, color: 'var(--accent)', fontWeight: 700 }}>Pulihkan</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
