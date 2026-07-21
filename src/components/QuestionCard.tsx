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

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: 'none', outline: 'none',
  color: 'var(--text-primary)', width: '100%', padding: '9px 14px',
  borderRadius: 10, fontSize: 14, fontFamily: 'Inter, sans-serif',
  boxShadow: 'var(--shadow-D1)', transition: 'box-shadow 200ms',
};

const chipBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
  background: 'var(--bg)', border: 'none', cursor: 'pointer',
  transition: 'all 180ms ease-out',
};

export default function QuestionCard({ question, index, value, onChange }: Props) {
  const [otherInput, setOtherInput] = useState('');
  const [showOther, setShowOther] = useState(false);

  const handleSkip = () => {
    if (question.required) return;
    onChange(question.id, null);
  };

  // Q1: Text input — no skip
  if (question.type === 'text') {
    return (
      <div className="p-5 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
        <span className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {index + 1}. {question.label}
        </span>
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(question.id, e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
          placeholder={question.placeholder || 'Ketik jawaban...'}
          rows={2}
          onFocus={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1-focus)')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-D1)')}
        />
      </div>
    );
  }

  // Q2-Q5: Chip/Radio — with skip
  const selectedValues: string[] = Array.isArray(value) ? value : [];
  const isSingle = question.type === 'radio';
  const isSkipped = value === null;

  const handleToggle = (opt: string) => {
    if (isSingle) {
      onChange(question.id, selectedValues[0] === opt ? selectedValues : [opt]);
    } else {
      const next = selectedValues.includes(opt) ? selectedValues.filter(v => v !== opt) : [...selectedValues, opt];
      onChange(question.id, next.length ? next : null);
    }
  };

  const handleOtherAdd = () => {
    if (otherInput.trim()) {
      onChange(question.id, [...selectedValues, otherInput.trim()]);
      setOtherInput('');
      setShowOther(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
      <div className="flex items-start justify-between">
        <span className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {index + 1}. {question.label}
        </span>
        {!question.required && (
          <button onClick={handleSkip} className="text-xs font-medium hover:underline" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Lewati
          </button>
        )}
      </div>

      {isSkipped ? (
        <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>Di-skip</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {question.options?.map(opt => {
            const selected = selectedValues.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => handleToggle(opt)}
                style={{
                  ...chipBase,
                  color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: selected ? 600 : 500,
                  boxShadow: selected ? 'var(--shadow-D1)' : 'var(--shadow-L1)',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.boxShadow = 'var(--shadow-L1-hover)'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.boxShadow = 'var(--shadow-L1)'; }}
              >
                {opt}
              </button>
            );
          })}
          {!showOther ? (
            <button
              onClick={() => setShowOther(true)}
              style={{ ...chipBase, color: 'var(--text-secondary)', boxShadow: 'var(--shadow-L1)' }}
            >
              + Lainnya
            </button>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={otherInput}
                onChange={e => setOtherInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleOtherAdd()}
                placeholder="..."
                style={{ ...inputStyle, width: 120, padding: '6px 10px', fontSize: 12, borderRadius: 8 }}
              />
              <button
                onClick={handleOtherAdd}
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{
                  background: 'var(--bg)', color: 'var(--accent)', border: 'none', cursor: 'pointer',
                  boxShadow: 'var(--shadow-L1)',
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
