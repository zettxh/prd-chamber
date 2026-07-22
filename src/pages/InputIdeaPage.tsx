import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function InputIdeaPage() {
  const [idea, setIdea] = useState('');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const navigate = useNavigate();

  const wordCount = idea.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    navigate('/project/dummy-1/clarify');
  };

  return (
    <Layout showBack>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 4 }}>
        Input Ideas
      </h1>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>
        Tulis ide kasarnya dulu. Nanti kita perjelas bareng-bareng.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Language:</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as 'id' | 'en')}
            className="term-select"
          >
            <option value="id">🇮🇩 Bahasa Indonesia</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        <textarea
          value={idea}
          onChange={e => setIdea(e.target.value)}
          className="term-textarea"
          placeholder={'> Tulis ide aplikasi kamu di sini...'}
          rows={6}
          required
        />

        {/* Word counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
          <span>{wordCount} kata</span>
          {wordCount < 5 && <span style={{ color: 'var(--accent)' }}>— minimal 5 kata</span>}
          {wordCount >= 5 && <span style={{ color: 'var(--success)' }}>✓ Siap lanjut</span>}
        </div>

        <button type="submit" disabled={!canSubmit} className="term-btn-accent" style={{ width: 'fit-content' }}>
          {'>'} LANJUT KE KLARIFIKASI
        </button>
      </form>
    </Layout>
  );
}
