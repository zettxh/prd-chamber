import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useProjectStore } from '../stores/project';

interface Props {
  projectId: string;
}

export default function ProjectTitle({ projectId }: Props) {
  const projects = useProjectStore((s) => s.projects);
  const updateProjectTitle = useProjectStore((s) => s.updateProjectTitle);
  const project = projects.find((p) => p.id === projectId);
  const currentTitle = project?.title ?? 'Proyek tanpa judul';

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft when project title changes externally (e.g. from another page)
  useEffect(() => {
    if (!editing) setDraft(currentTitle);
  }, [currentTitle, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== currentTitle) {
      updateProjectTitle(projectId, trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(currentTitle);
    setEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        maxWidth: 260,
        minWidth: 140,
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--accent-dim)',
            borderBottom: '2px solid var(--accent)',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            padding: '2px 6px',
            width: '100%',
            maxWidth: 240,
            borderRadius: 3,
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          title="Klik untuk edit judul proyek"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            padding: '2px 4px',
            border: '1px solid transparent',
            borderRadius: 3,
            transition: 'all 120ms',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'rgba(138,155,174,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Pencil size={10} color="var(--text-muted)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: project ? 'var(--text-primary)' : 'var(--text-muted)',
              fontStyle: project ? 'normal' : 'italic',
            }}
          >
            {currentTitle}
          </span>
        </span>
      )}
    </div>
  );
}
