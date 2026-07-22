import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface SectionProgress { key: string; label: string; status: 'pending' | 'generating' | 'done'; }

const sections: SectionProgress[] = [
  { key: 'executive-summary', label: 'Executive Summary', status: 'pending' },
  { key: 'problem-statement', label: 'Problem Statement', status: 'pending' },
  { key: 'core-features', label: 'Core Features', status: 'pending' },
  { key: 'user-flow', label: 'User Flow / Journey', status: 'pending' },
  { key: 'functional-requirements', label: 'Functional Requirements', status: 'pending' },
  { key: 'architecture', label: 'System Architecture', status: 'pending' },
  { key: 'database-schema', label: 'Database Schema', status: 'pending' },
];

export default function GeneratePrdPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SectionProgress[]>(() =>
    sections.map((s, i) => ({ ...s, status: i < 3 ? 'done' : i === 3 ? 'generating' : 'pending' })));
  const [generated, setGenerated] = useState<string[]>(['executive-summary','problem-statement','core-features']);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.status === 'generating');
      if (idx === -1) {
        const nextPending = prev.findIndex(p => p.status === 'pending');
        if (nextPending === -1) return prev;
        const updated = [...prev];
        updated[nextPending] = { ...updated[nextPending], status: 'generating' };
        return updated;
      }
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: 'done' };
      if (idx < prev.length - 1) {
        updated[idx + 1] = { ...updated[idx + 1], status: 'generating' };
      }
      setGenerated(g => [...g, updated[idx].key]);
      return updated;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, 1800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  const allDone = items.every(p => p.status === 'done');

  return (
    <Layout showBack>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>GENERATE PRD — SSE STREAMING
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{generated.length}/7 sections</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Checklist */}
        <div className="term-panel" style={{ padding: 12 }}>
          {items.map(item => (
            <div key={item.key} style={{ padding: '6px 0', fontSize: 11, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(58,58,54,0.5)' }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: item.status === 'done' ? 'var(--success)' : item.status === 'generating' ? 'var(--accent)' : 'var(--text-muted)',
                ...(item.status === 'generating' ? { animation: 'term-pulse 1s ease-in-out infinite' } : {}),
              }} />
              <span style={{
                color: item.status === 'done' ? 'var(--success)' : item.status === 'generating' ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: item.status === 'done' ? 'line-through' : 'none',
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Output panel */}
        <div className="term-panel" style={{ padding: '18px 22px', fontSize: 12, color: 'var(--text-secondary)', minHeight: 200 }}>
          <div style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 8 }}>
            {allDone ? 'GENERATION COMPLETE' : '⏳ GENERATING...'}
          </div>
          {generated.map(key => (
            <div key={key} style={{ marginBottom: 4, color: 'var(--success)' }}>
              ✓ {sections.find(s => s.key === key)?.label}
            </div>
          ))}
          {!allDone && <span style={{ color: 'var(--accent)', animation: 'term-blink 1.5s step-end infinite' }}>▌</span>}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button onClick={() => navigate('/project/dummy-1/prd')} className="term-btn-accent">
          {allDone ? '>' : '>'} {allDone ? 'LIHAT PRD LENGKAP' : 'SKIP TO PRD'}
        </button>
      </div>
    </Layout>
  );
}
