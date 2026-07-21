import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase A: dummy login — langsung redirect
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-md"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <h1 className="font-heading text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          PRD Chamber
        </h1>

        <label className="block mb-4">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Username</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md text-sm"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-inset)',
            }}
            placeholder="admin"
            required
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md text-sm"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-inset)',
            }}
            placeholder="••••••••"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px"
          style={{
            background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))',
            color: '#fff',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
