import { useState } from 'react';
import Layout from '../components/Layout';
import { dummyVersions } from '../data/dummy';

export default function VersionHistoryPage() {
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  return (
    <Layout showBack>
      <h1 className="font-heading text-[28px] font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Version History
      </h1>

      <div className="space-y-3">
        {dummyVersions.map(v => (
          <div key={v.id} className="p-3 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                v{v.version}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.date}</span>
            </div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{v.summary}</p>
            <div className="flex gap-2">
              <button className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>Bandingkan</button>
              <button
                onClick={() => setConfirmRestore(v.id)}
                className="text-xs font-medium"
                style={{ color: 'var(--error)' }}
              >
                Pulihkan
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmRestore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-5 rounded-md max-w-xs" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              Ini akan menyimpan versi saat ini sebagai snapshot baru sebelum memulihkan versi lama. Lanjutkan?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRestore(null)}
                className="px-3 py-1 rounded text-xs"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                Batal
              </button>
              <button
                onClick={() => { alert('Restored (dummy)'); setConfirmRestore(null); }}
                className="px-3 py-1 rounded text-xs"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                Pulihkan Versi
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
