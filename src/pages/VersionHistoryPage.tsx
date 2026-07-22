import { useState } from 'react';
import Layout from '../components/Layout';
import { dummyVersions } from '../data/dummy';

export default function VersionHistoryPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Layout showBack showStepper={false}>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 16 }}>
        Version History
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dummyVersions.map((v, i) => (
          <div key={v.id} className="term-panel" style={{
            padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14,
            borderLeft: selected === v.id ? '2px solid var(--accent)' : '1px solid var(--border)',
            cursor: 'pointer', transition: 'all 120ms',
          }} onClick={() => setSelected(v.id)}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 30 }}>v{v.version}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-primary)' }}>{v.summary}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.date}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="term-btn" style={{ fontSize: 9, padding: '3px 8px' }}>COMPARE</button>
              {i > 0 && <button className="term-btn-accent" style={{ fontSize: 9, padding: '3px 8px' }}>RESTORE</button>}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
