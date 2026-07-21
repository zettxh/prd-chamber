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
    if (!q1 || (typeof q1 === 'string' && q1.trim() === '')) {
      return; // Q1 wajib
    }
    navigate('/project/dummy-1/structure');
  };

  return (
    <Layout showBack>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>
              Beberapa pertanyaan
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Biar PRD-nya lebih akurat. Jawab semua pertanyaan di bawah.
            </p>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
            {answeredCount}/5
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {dummyQuestions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            value={answers[q.id] ?? undefined}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="flex gap-3 mt-8 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-md text-sm font-medium transition-all active:translate-y-px"
          style={{
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            background: 'transparent',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          ← Kembali
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-md text-sm font-semibold transition-all active:translate-y-px"
          style={{
            background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-hover))',
            color: '#fff',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          Pilih Struktur
        </button>
      </div>
    </Layout>
  );
}
