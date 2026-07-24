import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { projects as projectsApi } from '../utils/api';

export default function InputIdeaPage() {
  const [idea, setIdea] = useState('');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const wordCount = idea.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || creating) return;
    setCreating(true);
    setError('');

    try {
      // Create project — name = first line/sentence of idea, industry = generic
      const lines = idea.trim().split('\n');
      const projectName = lines[0].trim().slice(0, 80);
      const industry = language === 'id' ? 'Technology / Software' : 'Technology / Software';

      const res = await projectsApi.create({
        name: projectName,
        industry,
        description: idea.trim(),
      });

      navigate(`/project/${res.id}/clarify`);
    } catch (err) {
      setError(String(err));
      setCreating(false);
    }
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
          disabled={creating}
        />

        {/* Word counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
          <span>{wordCount} kata</span>
          {wordCount < 5 && <span style={{ color: 'var(--accent)' }}>— minimal 5 kata</span>}
          {wordCount >= 5 && <span style={{ color: 'var(--success)' }}>✓ Siap lanjut</span>}
        </div>

        {error && (
          <div style={{ fontSize: 10, color: 'var(--error)', padding: '8px 12px', background: 'rgba(255,80,80,0.1)', borderRadius: 4 }}>
            ✗ {error}
          </div>
        )}

        <button type="submit" disabled={!canSubmit || creating} className="term-btn-accent" style={{ width: 'fit-content' }}>
          {creating ? 'MEMBUAT PROJECT...' : '{>}'} LANJUT KE KLARIFIKASI
        </button>
      </form>
    </Layout>
  );
}
