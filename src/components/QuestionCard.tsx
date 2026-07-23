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
  onChange: (id: string, value: string | string[] | null | undefined) => void;
  onSkipToggle: (id: string, isSkipped: boolean) => void;
  isSkipped: boolean;
}

export default function QuestionCard({ question, index, value, onChange, onSkipToggle, isSkipped }: Props) {
  const [otherInput, setOtherInput] = useState('');
  const [showOther, setShowOther] = useState(false);

  const handleSkip = () => {
    if (question.required) return;
    onSkipToggle(question.id, true);
    setShowOther(false);
    setOtherInput('');
  };

  const handleUnskip = () => {
    onSkipToggle(question.id, false);
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
    // Don't toggle if isSkipped (must unskip first)
    if (isSkipped) return;
    if (isSingle) {
      onChange(question.id, [opt]);
    } else {
      const next = selectedValues.includes(opt)
        ? selectedValues.filter(v => v !== opt)
        : [...selectedValues, opt];
      onChange(question.id, next.length ? next : null);
    }
  };

  // "Other" options: those not in the predefined options list
  const predefinedOptions = question.options ?? [];
  const otherOptions = selectedValues.filter(v => !predefinedOptions.includes(v));

  const handleOtherAdd = () => {
    if (!otherInput.trim()) return;
    // For single: replace selection. For multi: append.
    const next = isSingle
      ? [otherInput.trim()]
      : [...selectedValues, otherInput.trim()];
    onChange(question.id, next);
    setOtherInput('');
    setShowOther(false);
  };

  const handleOtherRemove = (opt: string) => {
    const next = selectedValues.filter(v => v !== opt);
    onChange(question.id, next.length || null === null ? next : null);
  };

  return (
    <div className="term-panel" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
          Q{index + 1} · {isSingle ? 'PILIHAN' : 'MULTI-PILIH'} — {question.label}
        </span>
        {!question.required && !isSkipped && (
          <button onClick={handleSkip} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            [ skip ]
          </button>
        )}
        {isSkipped && (
          <button onClick={handleUnskip} style={{ fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            [ undo skip ]
          </button>
        )}
      </div>

      {/* Chip options — dimmed if isSkipped */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        opacity: isSkipped ? 0.35 : 1,
        transition: 'opacity 0.2s',
        pointerEvents: isSkipped ? 'none' : 'auto',
      }}>
        {predefinedOptions.map(opt => {
          const isSelected = selectedValues.includes(opt);
          return (
            <span
              key={opt}
              onClick={() => handleToggle(opt)}
              className={`term-chip ${isSelected ? 'selected' : ''}`}
              style={isSkipped ? { textDecoration: 'line-through' } : {}}
            >
              {opt}
            </span>
          );
        })}

        {/* User-added "Other" options */}
        {otherOptions.map(opt => (
          <span
            key={opt}
            onClick={() => handleToggle(opt)}
            className="term-chip selected"
            style={{ borderColor: 'var(--accent)', position: 'relative' }}
          >
            {opt}
            <button
              onClick={(e) => { e.stopPropagation(); handleOtherRemove(opt); }}
              style={{
                marginLeft: 4,
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: 10,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </span>
        ))}

        {/* "Other" input */}
        {!isSkipped && (
          !showOther ? (
            <span onClick={() => setShowOther(true)} className="term-chip">+ Lainnya</span>
          ) : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="text"
                value={otherInput}
                onChange={e => setOtherInput(e.target.value)}
                className="term-input"
                style={{ width: 140, fontSize: 11, padding: '3px 8px' }}
                placeholder="ketik opsi..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOtherAdd();
                  }
                  if (e.key === 'Escape') {
                    setShowOther(false);
                    setOtherInput('');
                  }
                }}
                autoFocus
              />
              <button onClick={handleOtherAdd} className="term-btn-accent" style={{ fontSize: 10, padding: '3px 8px' }}>+</button>
              <button onClick={() => { setShowOther(false); setOtherInput(''); }} className="term-btn" style={{ fontSize: 10, padding: '3px 8px' }}>×</button>
            </div>
          )
        )}
      </div>

      {/* Skipped indicator */}
      {isSkipped && (
        <div style={{
          marginTop: 8,
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>⏭</span>
          <span>Pertanyaan ini di-skip — jawaban opsional</span>
        </div>
      )}
    </div>
  );
}
