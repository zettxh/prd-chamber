import { useState } from 'react';
import Layout from '../components/Layout';

const formats = ['MD', 'HTML', 'PDF', 'DOCX'];

export default function ExportPage() {
  const [format, setFormat] = useState('MD');
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);

  return (
    <Layout showBack>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 16 }}>
        Export PRD
      </h1>

      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>FORMAT
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {formats.map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={format === f ? 'term-btn-accent' : 'term-btn'}
              style={{ fontSize: 10 }}
            >
              {format === f ? '[•]' : '[ ]'} {f}
            </button>
          ))}
        </div>
      </div>

      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>OPTIONS
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={includeDiagrams} onChange={e => setIncludeDiagrams(e.target.checked)} />
          Include Mermaid diagrams
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={includeToc} onChange={e => setIncludeToc(e.target.checked)} />
          Include Table of Contents
        </label>
      </div>

      <button className="term-btn-accent" onClick={() => alert(`Downloading ${format}...`)}>
        {'>'} DOWNLOAD {format}
      </button>
    </Layout>
  );
}
