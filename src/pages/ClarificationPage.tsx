import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import QuestionCard from '../components/QuestionCard';
import { clarify, type ClarifyQuestion } from '../utils/api';

export default function ClarificationPage() {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[] | null>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [_saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    generateQuestions();
  }, [id]);

  async function generateQuestions() {
    if (!id) return;
    setGenerating(true);
    setGenError('');
    try {
      const res = await clarify.generate(id);
      setQuestions(res.questions);
    } catch (err) {
      setGenError(String(err));
    } finally {
      setGenerating(false);
    }
  }

  const totalQuestions = questions.length;
  const skippedCount = skipped.size;
  const activeCount = totalQuestions - skippedCount;

  const answeredCount = Object.entries(answers).filter(([qid, v]) => {
    if (skipped.has(qid)) return false;
    if (v === null) return false;
    if (typeof v === 'string') return v.trim() !== '';
    if (Array.isArray(v)) return v.length > 0;
    return false;
  }).length;

  const handleChange = (qid: string, value: string | string[] | null | undefined) => {
    if (value === undefined) {
      setAnswers(prev => {
        const next = { ...prev };
        delete next[qid];
        return next;
      });
    } else {
      setAnswers(prev => ({ ...prev, [qid]: value }));
    }
  };

  const handleSkipToggle = (qid: string, isSkipped: boolean) => {
    setSkipped(prev => {
      const next = new Set(prev);
      if (isSkipped) next.add(qid);
      else next.delete(qid);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!id) return;
    // Check Q1 is required
    const q1 = questions.find(q => q.id === 'q1');
    const q1Answer = answers['q1'];
    if (q1?.required && (!q1Answer || (typeof q1Answer === 'string' && q1Answer.trim() === ''))) {
      setSaveError('Pertanyaan pertama wajib dijawab.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      await clarify.save(id, answers, Array.from(skipped));
      navigate(`/project/${id}/structure`);
    } catch (err) {
      setSaveError(String(err));
      setSaving(false);
    }
  };

  if (generating) {
    return (
      <Layout showBack>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 }}>
          <div style={{ fontSize: 24, animation: 'pulse 1.5s ease-in-out infinite' }}>◈</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Generating questions via LLM...
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 360, textAlign: 'center' }}>
            Pastikan API key sudah diset di Settings page.
          </div>
        </div>
      </Layout>
    );
  }

  if (genError) {
    return (
      <Layout showBack>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 18 }}>
          Error
        </h1>
        <div className="term-panel" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--error)', marginBottom: 12 }}>✗ {genError}</div>
          <button onClick={generateQuestions} className="term-btn-accent" style={{ fontSize: 11 }}>
            {'>'} COBA LAGI
          </button>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout showBack>
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Menunggu questions...
        </div>
      </Layout>
    );
  }

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
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {answeredCount}/{activeCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="term-progress-outer">
          <div className="term-progress-inner" style={{ width: `${activeCount > 0 ? (answeredCount / activeCount) * 100 : 0}%` }} />
        </div>

        {skippedCount > 0 && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
            ⏭ {skippedCount} pertanyaan di-skip — bobot tersebar ke {activeCount} pertanyaan tersisa
          </p>
        )}

        {saveError && (
          <div style={{ fontSize: 10, color: 'var(--error)', marginTop: 8 }}>✗ {saveError}</div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            value={answers[q.id] ?? undefined}
            onChange={handleChange}
            onSkipToggle={handleSkipToggle}
            isSkipped={skipped.has(q.id)}
          />
        ))}
      </div>
    </Layout>
  );
}
