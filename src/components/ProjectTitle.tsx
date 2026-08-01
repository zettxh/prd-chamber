import { useState, useRef, useEffect } from 'react';
import { Pencil, Sparkles } from 'lucide-react';
import { projects as projectsApi } from '../utils/api';

interface Props {
  projectId: string;
}

export default function ProjectTitle({ projectId }: Props) {
  const [projectName, setProjectName] = useState('Proyek tanpa judul');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('Proyek tanpa judul');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch project name from API on mount
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    projectsApi.get(projectId)
      .then(data => {
        const name = data.project.name || 'Proyek tanpa judul';
        setProjectName(name);
        setDraft(name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  // Sync draft when projectName changes externally
  useEffect(() => {
    if (!editing) setDraft(projectName);
  }, [projectName, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== projectName) {
      try {
        await projectsApi.update(projectId, { name: trimmed });
        setProjectName(trimmed);
      } catch { /* non-blocking */ }
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(projectName);
    setEditing(false);
  };

  const handleGenerateTitle = async () => {
    setGenerating(true);
    try {
      const res = await projectsApi.generateTitle(projectId);
      setProjectName(res.name);
      setDraft(res.name);
    } catch { /* silent fail */ }
    finally { setGenerating(false); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 260, minWidth: 140 }}>
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
            maxWidth: 200,
            borderRadius: 3,
          }}
        />
      ) : (
        <span
          onClick={(e) => { e.stopPropagation(); if (!loading) setEditing(true); }}
          title="Klik untuk edit judul proyek"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: loading ? 'wait' : 'pointer',
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
              color: loading ? 'var(--text-muted)' : 'var(--text-primary)',
              fontStyle: loading ? 'italic' : 'normal',
            }}
          >
            {loading ? 'Memuat...' : projectName}
          </span>
        </span>
      )}
      {!editing && !loading && (
        <button
          onClick={(e) => { e.stopPropagation(); handleGenerateTitle(); }}
          disabled={generating}
          title="Generate judul dari AI"
          style={{
            background: 'none',
            border: 'none',
            cursor: generating ? 'wait' : 'pointer',
            color: 'var(--accent)',
            padding: '2px',
            opacity: generating ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Sparkles size={12} />
        </button>
      )}
    </div>
  );
}
