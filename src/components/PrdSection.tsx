import { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface Props {
  title: string;
  content: string;
  onSave?: (content: string) => void;
}

export default function PrdSection({ title, content, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleSave = () => {
    setEditing(false);
    onSave?.(draft);
  };

  return (
    <div className="mb-6 p-4 rounded-md" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="text-xs font-medium px-2 py-1 rounded"
          style={{ color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
        >
          {editing ? 'Simpan' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm min-h-[120px] resize-y font-mono"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-inset)',
          }}
        />
      ) : (
        <MarkdownViewer content={content} />
      )}
    </div>
  );
}
