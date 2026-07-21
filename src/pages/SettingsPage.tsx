import { useState } from 'react';
import Layout from '../components/Layout';

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: 'none', outline: 'none', color: 'var(--text-primary)',
  width: '100%', padding: '9px 14px', borderRadius: 10, fontSize: 14,
  fontFamily: 'Inter, sans-serif', boxShadow: 'var(--shadow-D1)', transition: 'box-shadow 200ms',
};

const btnStyle: React.CSSProperties = {
  background: 'var(--bg)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
  fontWeight: 600, padding: '9px 20px', borderRadius: 10, fontSize: 13,
  boxShadow: 'var(--shadow-L1)',
};

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
      <h1 className="font-heading text-[28px] font-bold mb-8" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>Settings</h1>

      {/* BYOK */}
      <div className="p-5 rounded-2xl mb-6 flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
        <h2 className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>BYOK Configuration</h2>
        <form onSubmit={handleTest} className="flex flex-col gap-3">
          <input value={provider} onChange={e => setProvider(e.target.value)} placeholder="Provider (contoh: openai)" style={inputStyle} />
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" placeholder="API Key" style={inputStyle} />
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="Base URL (opsional)" style={inputStyle} />
          <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model (contoh: gpt-4o-mini)" style={inputStyle} />
          <button type="submit" style={{ ...btnStyle, color: 'var(--accent)', fontWeight: 700 }}>Test Connection</button>
        </form>
        {testResult && (
          <div className="mt-2 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg)', color: testResult === 'success' ? 'var(--success)' : 'var(--error)', boxShadow: 'var(--shadow-D1)' }}>
            {testResult === 'success' ? '✅ Koneksi berhasil' : '❌ API key tidak valid'}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="p-5 rounded-2xl mb-6 flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
        <h2 className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
        <input type="password" placeholder="Password saat ini" style={inputStyle} />
        <input type="password" placeholder="Password baru" style={inputStyle} />
        <button style={btnStyle}>Ganti Password</button>
      </div>

      {/* Error Log */}
      <div className="p-5 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
        <h2 className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>Error Log</h2>
        {[
          { code: 'ERR_LLM_MALFORMED', msg: 'Respons LLM tidak sesuai format JSON', date: '2026-07-21 08:45' },
          { code: 'ERR_LLM_AUTH', msg: 'API key tidak valid (401)', date: '2026-07-20 15:22' },
          { code: 'ERR_RATE_LIMIT', msg: 'Too many requests', date: '2026-07-20 15:23' },
        ].map((err, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg text-xs" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}>
            <span className="font-mono font-semibold" style={{ color: 'var(--error)' }}>{err.code}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{err.msg}</span>
            <span className="ml-auto" style={{ color: 'var(--text-secondary)' }}>{err.date}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
