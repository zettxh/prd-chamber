import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 flex flex-col gap-5"
        style={{
          background: 'var(--bg)',
          borderRadius: 18,
          boxShadow: 'var(--shadow-L2)',
        }}
      >
        <h1
          className="font-heading text-2xl font-bold text-center mb-1"
          style={{ color: 'var(--text-primary)', letterSpacing: -0.3 }}
        >
          PRD Chamber
        </h1>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Username</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: 'none',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-D1)',
              transition: 'box-shadow 200ms',
            }}
            placeholder="admin"
            required
            onFocus={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1-focus)')}
            onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1)')}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--bg)',
              border: 'none',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-D1)',
              transition: 'box-shadow 200ms',
            }}
            placeholder="••••••••"
            required
            onFocus={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1-focus)')}
            onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1)')}
          />
        </label>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.985]"
          style={{
            background: 'var(--bg)',
            color: 'var(--accent)',
            border: 'none',
            cursor: 'pointer',
            boxShadow:
              '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
        >
          Masuk
        </button>
      </form>
    </div>
  );
}
