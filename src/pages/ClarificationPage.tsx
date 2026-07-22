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

  return (
    <Layout showBack continueLabel="PILIH STRUKTUR" onContinue={handleSubmit}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 2 }}>
              Beberapa pertanyaan
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Biar PRD-nya lebih akurat. Jawab semua pertanyaan di bawah.
            </p>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{answeredCount}/5</span>
        </div>

        {/* Progress bar */}
        <div className="term-progress-outer">
          <div className="term-progress-inner" style={{ width: `${(answeredCount / 5) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {dummyQuestions.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} value={answers[q.id] ?? undefined} onChange={handleChange} />
        ))}
      </div>
    </Layout>
  );
}
