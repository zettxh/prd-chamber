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

  // Q1: Text input — no skip button
  if (question.type === 'text') {
    const isEmpty = typeof value === 'string' ? value.trim() === '' : !value;

    return (
      <div className="p-4 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}>
        <div className="flex items-start justify-between mb-3">
          <span className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {index + 1}. {question.label}
          </span>
        </div>
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(question.id, e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm resize-y"
          style={{
            background: 'var(--bg-input)',
            border: `1px solid ${isEmpty && question.required ? 'var(--error)' : 'var(--border-default)'}`,
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-inset)',
          }}
          placeholder={question.placeholder || 'Ketik jawaban...'}
          rows={2}
        />
        {isEmpty && question.required && (
          <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>Jawaban ini wajib diisi</p>
        )}
      </div>
    );
  }

  // Q2-Q5: Chip/Radio — with skip button
  const selectedValues: string[] = Array.isArray(value) ? value : [];
  const isSingle = question.type === 'radio';

  const handleToggle = (opt: string) => {
    if (isSingle) {
      onChange(question.id, selectedValues[0] === opt ? selectedValues : [opt]);
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
    <div className="p-4 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="font-heading text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {index + 1}. {question.label}
        </span>
        {!question.required && (
          <button
            onClick={handleSkip}
            className="text-xs hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            Lewati
          </button>
        )}
      </div>

      {isSkipped ? (
        <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>Di-skip</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {question.options?.map(opt => {
            const isSelected = selectedValues.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => handleToggle(opt)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  background: isSelected ? 'var(--chip-selected)' : 'var(--chip-default)',
                  color: isSelected ? 'var(--chip-text-selected)' : 'var(--text-primary)',
                  border: `1px solid ${isSelected ? 'var(--chip-selected)' : 'var(--border-default)'}`,
                }}
              >
                {opt}
              </button>
            );
          })}
          {!showOther ? (
            <button
              onClick={() => setShowOther(true)}
              className="px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                background: 'var(--chip-default)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}
            >
              + Lainnya
            </button>
          ) : (
            <div className="flex gap-1">
              <input
                type="text"
                value={otherInput}
                onChange={e => setOtherInput(e.target.value)}
                className="px-2 py-1.5 rounded-md text-xs w-32"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                placeholder="..."
                onKeyDown={e => e.key === 'Enter' && handleOtherAdd()}
              />
              <button
                onClick={handleOtherAdd}
                className="px-2 py-1 rounded-md text-xs"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
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
