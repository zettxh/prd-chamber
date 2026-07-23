import { useState } from 'react';
import DiffView from './DiffView';

type ChangeType = 'add' | 'remove' | 'modify';

interface Props {
  sectionTitle: string;
  currentContent: string;
  onClose: () => void;
  onApprove: (proposedContent: string) => void;
}

export default function RevisionModal({ sectionTitle, currentContent, onClose, onApprove }: Props) {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [changeType, setChangeType] = useState<ChangeType>('modify');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    setStep('preview');
  };

  const proposedContent = `[AI PROPOSED CHANGE — ${changeType.toUpperCase()} — ${sectionTitle}]

Based on: "${description || 'No specific description provided'}"

---

${currentContent}

---

[AI SUGGESTED MODIFICATION]
This section should be updated to reflect the following changes based on the requested modification type: ${changeType}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 50,
      padding: '40px 20px',
      overflowY: 'auto',
    }}>
      <div className="term-panel" style={{ padding: 24, maxWidth: 720, width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            🤖 REVISI — {sectionTitle}
          </div>
          <button onClick={onClose} className="term-btn" style={{ fontSize: 10 }}>✕</button>
        </div>

        {step === 'form' ? (
          <>
            {/* Change type */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                Change Type
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['add', 'remove', 'modify'] as ChangeType[]).map(type => (
                  <button
                    key={type}
                    className={changeType === type ? 'term-btn-accent' : 'term-btn'}
                    style={{ fontSize: 10, textTransform: 'capitalize' }}
                    onClick={() => setChangeType(type)}
                  >
                    {type === 'add' ? '+ Tambah' : type === 'remove' ? '- Hapus' : '~ Ubah'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                Deskripsi perubahan
              </div>
              <textarea
                className="term-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Contoh: Tambahkan detail tentang integrasi payment gateway..."
                style={{ minHeight: 80, fontSize: 12 }}
              />
            </div>

            {/* Current content preview */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                Konteks saat ini (read-only)
              </div>
              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '10px 14px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                maxHeight: 120,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}>
                {currentContent.slice(0, 300)}...
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="term-btn" style={{ fontSize: 10 }}>Batal</button>
              <button onClick={handleSubmit} className="term-btn-accent" style={{ fontSize: 10 }}>
                Submit → Generate Diff
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preview — Diff */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>
                🔍 Proposed Diff — AI suggestion based on your input
              </div>
              <DiffView
                oldLabel="Current"
                newLabel={`Proposed: ${changeType}`}
                oldContent={currentContent}
                newContent={proposedContent}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setStep('form')} className="term-btn" style={{ fontSize: 10 }}>
                ← Ubah Request
              </button>
              <button onClick={onClose} className="term-btn" style={{ fontSize: 10 }}>
                ❌ Reject
              </button>
              <button onClick={() => onApprove(proposedContent)} className="term-btn-accent" style={{ fontSize: 10 }}>
                ✅ Approve & Apply
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
