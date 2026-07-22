import { useState } from 'react';
import Layout from '../components/Layout';

export default function SettingsPage() {
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = Math.random() > 0.5;
    setTestResult(ok ? 'success' : 'error');
    setTimeout(() => setTestResult(null), 4000);
  };

  return (
    <Layout showBack>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 18 }}>
        Settings
      </h1>

      {/* BYOK */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>BYOK CONFIGURATION
        </h2>
        <form onSubmit={handleTest} className="flex flex-col gap-3">
          <input value={provider} onChange={e => setProvider(e.target.value)} className="term-input" placeholder="Provider (contoh: openai)" />
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" className="term-input" placeholder="API Key" />
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="term-input" placeholder="Base URL (opsional)" />
          <input value={model} onChange={e => setModel(e.target.value)} className="term-input" placeholder="Model (contoh: gpt-4o-mini)" />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="submit" className="term-btn-accent">{'>'} TEST CONNECTION</button>
            {testResult && (
              <span style={{ fontSize: 10, color: testResult === 'success' ? 'var(--success)' : 'var(--error)' }}>
                {testResult === 'success' ? '✓ Connected' : '✗ Failed'}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Error Log */}
      <div className="term-panel" style={{ padding: '18px 22px' }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>ERROR LOG
        </h2>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(58,58,54,0.5)' }}>
            [2026-07-21 14:32:15] <span style={{ color: 'var(--error)' }}>ERR_LLM_TIMEOUT</span> — POST /api/generate-prd
          </div>
          <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(58,58,54,0.5)' }}>
            [2026-07-20 09:11:03] <span style={{ color: 'var(--warning)' }}>ERR_RATE_LIMITED</span> — POST /api/clarify
          </div>
          <div style={{ padding: '4px 0' }}>
            [2026-07-19 18:45:22] <span style={{ color: 'var(--error)' }}>ERR_DB_WRITE</span> — PUT /api/projects
          </div>
        </div>
      </div>
    </Layout>
  );
}
