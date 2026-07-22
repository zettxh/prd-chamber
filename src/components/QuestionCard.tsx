import { useState } from 'react';

interface Question {
  id: string;
  type: 'text' | 'radio' | 'chip';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Props {
  question: Question;
  index: number;
  value: string | string[] | null | undefined;
  onChange: (id: string, value: string | string[] | null) => void;
}

export default function QuestionCard({ question, index, value, onChange }: Props) {
  const [otherInput, setOtherInput] = useState('');
  const [showOther, setShowOther] = useState(false);
  const isSkipped = value === null;

  const handleSkip = () => {
    if (question.required) return;
    onChange(question.id, null);
  };

  if (question.type === 'text') {
    return (
      <div className="term-panel" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
            Q{index + 1} · WAJIB — {question.label}
          </span>
        </div>
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(question.id, e.target.value)}
          className="term-textarea" style={{ minHeight: 60, fontSize: 12 }}
          placeholder={question.placeholder || '> Ketik jawaban...'}
          rows={2}
        />
        {typeof value === 'string' && value.trim() === '' && question.required && (
          <p style={{ fontSize: 10, color: 'var(--error)', marginTop: 4 }}>Jawaban ini wajib diisi</p>
        )}
      </div>
    );
  }

  const selectedValues = Array.isArray(value) ? value : [];
  const isSingle = question.type === 'radio';

  const handleToggle = (opt: string) => {
    if (isSingle) {
      onChange(question.id, [opt]);
    } else {
      const next = selectedValues.includes(opt)
        ? selectedValues.filter(v => v !== opt)
        : [...selectedValues, opt];
      onChange(question.id, next.length ? next : null);
    }
  };

  const handleOtherAdd = () => {
    if (otherInput.trim()) {
      const next = [...selectedValues, otherInput.trim()];
      onChange(question.id, next);
      setOtherInput('');
      setShowOther(false);
    }
  };

  return (
    <div className="term-panel" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
          Q{index + 1} · {isSingle ? 'PILIHAN' : 'MULTI-PILIH'} — {question.label}
        </span>
        {!question.required && (
          <button onClick={handleSkip} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            [ skip ]
          </button>
        )}
      </div>

      {isSkipped ? (
        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>Di-skip</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {question.options?.map(opt => {
            const isSelected = selectedValues.includes(opt);
            return (
              <span
                key={opt}
                onClick={() => handleToggle(opt)}
                className={`term-chip ${isSelected ? 'selected' : ''}`}
              >
                {opt}
              </span>
            );
          })}
          {!showOther ? (
            <span onClick={() => setShowOther(true)} className="term-chip">+ Lainnya</span>
          ) : (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text" value={otherInput}
                onChange={e => setOtherInput(e.target.value)}
                className="term-input" style={{ width: 120, fontSize: 11, padding: '3px 8px' }}
                placeholder="..."
                onKeyDown={e => e.key === 'Enter' && handleOtherAdd()}
              />
              <button onClick={handleOtherAdd} className="term-btn-accent" style={{ fontSize: 10, padding: '3px 8px' }}>+</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
