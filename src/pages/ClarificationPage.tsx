import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import QuestionCard from '../components/QuestionCard';
import { dummyQuestions } from '../data/dummy';

export default function ClarificationPage() {
  const [answers, setAnswers] = useState<Record<string, string | string[] | null>>({});
  const navigate = useNavigate();
  const answeredCount = Object.keys(answers).length;

  const handleChange = (id: string, value: string | string[] | null) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const q1 = answers['q1'];
    if (!q1 || (typeof q1 === 'string' && q1.trim() === '')) return;
    navigate('/project/dummy-1/structure');
  };

  const btnPrimary: React.CSSProperties = {
    background: 'var(--bg)', color: 'var(--accent)', fontWeight: 700,
    border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 12, fontSize: 14,
    boxShadow: '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)',
    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const btnOutline: React.CSSProperties = {
    background: 'var(--bg)', color: 'var(--text-primary)', fontWeight: 500,
    border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 12, fontSize: 14,
    boxShadow: 'var(--shadow-L1)', transition: 'box-shadow 200ms',
  };

  return (
    <Layout showBack>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)', letterSpacing: -0.4 }}>
              Beberapa pertanyaan
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Biar PRD-nya lebih akurat. Jawab semua pertanyaan di bawah.
            </p>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{answeredCount}/5</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {dummyQuestions.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} value={answers[q.id] ?? undefined} onChange={handleChange} />
        ))}
      </div>

      <div className="flex gap-3 mt-8 pb-8">
        <button
          onClick={() => navigate(-1)}
          style={btnOutline}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-L1)')}
        >
          ← Kembali
        </button>
        <button
          onClick={handleSubmit}
          style={btnPrimary}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(174,168,158,0.35), -4px -4px 8px rgba(255,255,252,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)')}
          onMouseDown={e => { e.currentTarget.style.boxShadow = 'var(--shadow-D1)'; e.currentTarget.style.transform = 'scale(0.985)'; }}
          onMouseUp={e => { e.currentTarget.style.boxShadow = '5px 5px 10px rgba(174,168,158,0.40), -5px -5px 10px rgba(255,255,252,0.65)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Pilih Struktur
        </button>
      </div>
    </Layout>
  );
}
