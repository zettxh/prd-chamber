import { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface Props { title: string; content: string; onSave?: (c: string) => void; }

export default function PrdSection({ title, content, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  return (
    <div className="mb-6 p-5 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-L1)' }}>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <button
          onClick={() => editing ? (setEditing(false), onSave?.(draft)) : setEditing(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg)', color: 'var(--accent)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-L1)' }}
        >
          {editing ? 'Simpan' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <textarea
          value={draft} onChange={e => setDraft(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm min-h-[140px] resize-y outline-none"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: '"JetBrains Mono", monospace', boxShadow: 'var(--shadow-D1)' }}
        />
      ) : (
        <MarkdownViewer content={content} />
      )}
    </div>
  );
}
