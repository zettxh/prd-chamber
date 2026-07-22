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
    <div className="min-h-screen flex items-center justify-center term-screen" style={{ position: 'relative', zIndex: 1 }}>
      {/* Status bar top */}
      <div className="status-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
        <div className="flex items-center gap-2">
          <span>PRD-CHAMBER</span>
          <span style={{ color: 'var(--text-muted)' }}>///</span>
          <span>AUTH GATEWAY</span>
        </div>
        <span>SYSTEM:001</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="term-panel flex flex-col gap-5"
        style={{ padding: '32px 36px', maxWidth: 380, width: '100%' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span style={{ fontSize: 20, color: 'var(--accent)' }}>◈</span>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            PRD Chamber
          </h1>
        </div>

        <div className="term-divider" />

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Username
          </span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="term-input"
            placeholder="admin"
            required
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="term-input"
            placeholder="••••••••"
            required
          />
        </label>

        <button type="submit" className="term-btn-accent" style={{ justifyContent: 'center', padding: '10px 0', fontSize: 12 }}>
          {'>'} AUTHENTICATE
        </button>
      </form>

      {/* Status bar bottom */}
      <div className="status-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <span>STATUS: AWAITING CREDENTIALS</span>
        <span>TERMINAL v1.0</span>
      </div>
    </div>
  );
}
