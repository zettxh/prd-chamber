import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('prd-chamber-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('prd-chamber-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="w-9 h-9 flex items-center justify-center text-base rounded-full"
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-L1)',
        border: 'none',
        cursor: 'pointer',
        transition: 'box-shadow 200ms ease-out',
      }}
      aria-label={dark ? 'Switch to light' : 'Switch to dark'}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1)')}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
