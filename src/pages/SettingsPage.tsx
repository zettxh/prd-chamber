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
    const success = Math.random() > 0.5;
    setTestResult(success ? 'success' : 'error');
    setTimeout(() => setTestResult(null), 4000);
  };

  return (
    <Layout showBack>
      <h1 className="font-heading text-[28px] font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      {/* BYOK Configuration */}
      <div className="p-4 rounded-md mb-6" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
        <h2 className="font-heading text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>BYOK Configuration</h2>
        <form onSubmit={handleTest} className="space-y-3">
          <input value={provider} onChange={e => setProvider(e.target.value)} placeholder="Provider (contoh: openai)" className="w-full px-3 py-2 rounded-md text-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-inset)' }} />
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" placeholder="API Key" className="w-full px-3 py-2 rounded-md text-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-inset)' }} />
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="Base URL (opsional)" className="w-full px-3 py-2 rounded-md text-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-inset)' }} />
          <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model (contoh: gpt-4o-mini)" className="w-full px-3 py-2 rounded-md text-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-inset)' }} />
          <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px" style={{ background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))', color: '#fff', boxShadow: 'var(--shadow-button)' }}>
            Test Connection
          </button>
        </form>
        {testResult && (
          <div className="mt-3 px-3 py-2 rounded-md text-xs font-medium" style={{ background: testResult === 'success' ? 'var(--success)' : 'var(--error)', color: '#fff' }}>
            {testResult === 'success' ? '✅ Koneksi berhasil' : '❌ API key tidak valid'}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="p-4 rounded-md mb-6" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
        <h2 className="font-heading text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
        <input type="password" placeholder="Password saat ini" className="w-full px-3 py-2 rounded-md text-sm mb-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-inset)' }} />
        <input type="password" placeholder="Password baru" className="w-full px-3 py-2 rounded-md text-sm mb-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-inset)' }} />
        <button className="px-4 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px" style={{ background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))', color: '#fff', boxShadow: 'var(--shadow-button)' }}>
          Ganti Password
        </button>
      </div>

      {/* Error Log */}
      <div className="p-4 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
        <h2 className="font-heading text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Error Log</h2>
        <div className="space-y-2">
          {[
            { code: 'ERR_LLM_MALFORMED', message: 'Respons LLM tidak sesuai format JSON', date: '2026-07-21 08:45' },
            { code: 'ERR_LLM_AUTH', message: 'API key tidak valid (401)', date: '2026-07-20 15:22' },
            { code: 'ERR_RATE_LIMIT', message: 'Too many requests — coba lagi 2 menit', date: '2026-07-20 15:23' },
          ].map((err, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded text-xs" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
              <span className="font-mono font-semibold" style={{ color: 'var(--error)' }}>{err.code}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{err.message}</span>
              <span className="ml-auto" style={{ color: 'var(--text-secondary)' }}>{err.date}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
