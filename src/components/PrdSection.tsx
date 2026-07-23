import { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface Props {
  id: string;
  title: string;
  content: string;
  onSave: (newContent: string) => void;
}

export default function PrdSection({ id, title, content, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <section id={id} style={{ scrollMarginTop: 80 }}>
      <div className="term-panel" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{
            fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
            color: 'var(--accent)', letterSpacing: '0.03em',
          }}>
            {title}
          </h2>
          {!editing ? (
            <button onClick={() => { setDraft(content); setEditing(true); }} className="term-btn" style={{ fontSize: 9 }}>
              ✎ EDIT
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleSave} className="term-btn-accent" style={{ fontSize: 9 }}>SAVE</button>
              <button onClick={() => setEditing(false)} className="term-btn" style={{ fontSize: 9 }}>CANCEL</button>
            </div>
          )}
        </div>

        {editing ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="term-textarea"
            style={{ minHeight: 200, fontSize: 12 }}
          />
        ) : (
          <MarkdownViewer content={content} />
        )}
      </div>
    </section>
  );
}
