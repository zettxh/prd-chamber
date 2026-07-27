import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { exportApi, prd, tasks } from '../utils/api';

// Helper: trigger browser download from a Blob
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type Format = 'md' | 'html' | 'docx'

const FORMATS: Format[] = ['md', 'html', 'docx'];

export default function ExportPage() {
  const { id: projectId } = useParams<{ id: string }>();

  // ── State ────────────────────────────────────────────────────────────────────
  const [format, setFormat] = useState<Format>('md');
  const [includeToc, setIncludeToc] = useState(true);
  const [includeSpec, setIncludeSpec] = useState(false);
  const [includeTasks, setIncludeTasks] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSingleDownload, setIsSingleDownload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [hasPrd, setHasPrd] = useState(false);
  const [hasTasks, setHasTasks] = useState(false);

  // ── Load project metadata ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        const [prdRes, tasksRes] = await Promise.allSettled([
          prd.get(projectId),
          tasks.get(projectId),
        ]);

        // Project name from prd response
        if (prdRes.status === 'fulfilled' && prdRes.value.prdData) {
          setHasPrd(true);
        }

        // Tasks
        if (tasksRes.status === 'fulfilled' && tasksRes.value.tasks) {
          setHasTasks(true);
        }

        // Fetch project details for name
        const { projects: projectList } = await import('../utils/api').then(m => m.projects.list());
        const found = projectList.find((p: { id: string }) => p.id === projectId);
        if (found) setProjectName(found.name);

      } catch (err) {
        // Non-critical — export still works without metadata
        console.warn('[ExportPage] Failed to load metadata:', err);
      }
    };

    load();
  }, [projectId]);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getFilename = useCallback((ext: string) => {
    const slug = projectName
      ? projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : 'prd';
    return `PRD-${slug}.${ext}`;
  }, [projectName]);

  // ── Download handlers ─────────────────────────────────────────────────────────

  const handleDownloadSingle = async () => {
    if (!projectId || isDownloading || isSingleDownload) return;
    setIsSingleDownload(true);
    setError(null);

    try {
      const blob = await exportApi.download(projectId, {
        format,
        toc: includeToc,
      });
      triggerDownload(blob, getFilename(format === 'md' ? 'md' : format === 'html' ? 'html' : format));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsSingleDownload(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!projectId || isDownloading || isSingleDownload) return;
    setIsDownloading(true);
    setError(null);

    try {
      const blob = await exportApi.download(projectId, {
        format: 'zip',
        toc: includeToc,
        spec: includeSpec,
        tasks: includeTasks,
      });
      const slug = projectName
        ? projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : 'prd';
      triggerDownload(blob, `${slug}.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ZIP generation failed');
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────
  const isWorking = isDownloading || isSingleDownload;

  const zipLabel = (() => {
    const parts: string[] = [];
    if (format === 'md') parts.push('PRD.md');
    else parts.push(`PRD.${format === 'html' ? 'html' : format}`);
    if (includeSpec) parts.push('SPEC.md');
    if (includeTasks) parts.push('TASKS.md');
    parts.push('VERSIONS.json');
    return parts.join(' + ');
  })();

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Layout showBack>
      {/* Page title */}
      <h1 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        marginBottom: 16,
      }}>
        Export PRD
      </h1>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'var(--bg-accent)',
          border: '1px solid var(--accent)',
          borderLeft: '3px solid var(--accent)',
          padding: '10px 14px',
          marginBottom: 14,
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--accent)', marginRight: 6 }}>▸ ERROR:</span>
          {error}
        </div>
      )}

      {/* No PRD warning */}
      {!hasPrd && (
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          padding: '14px 18px',
          marginBottom: 14,
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>
          No PRD found. Generate a PRD first before exporting.
        </div>
      )}

      {/* Format selector */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 12,
        }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>FORMAT
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FORMATS.map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              disabled={isWorking}
              className={format === f ? 'term-btn-accent' : 'term-btn'}
              style={{ fontSize: 10, opacity: isWorking ? 0.6 : 1 }}
            >
              {format === f ? '[•]' : '[ ]'} {f.toUpperCase()}
            </button>
          ))}
        </div>

      </div>

      {/* Options */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 10,
        }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>OPTIONS
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: 'var(--text-secondary)',
          marginBottom: 8,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
        }}>
          <input
            type="checkbox"
            checked={includeToc}
            onChange={e => setIncludeToc(e.target.checked)}
            disabled={isWorking}
          />
          Include Table of Contents
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: 'var(--text-secondary)',
          marginBottom: 8,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
        }}>
          <input
            type="checkbox"
            checked={includeSpec}
            onChange={e => setIncludeSpec(e.target.checked)}
            disabled={isWorking || !hasPrd}
          />
          Include SPEC.md (feature structure overview)
          {!hasPrd && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              (needs structure)
            </span>
          )}
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          color: 'var(--text-secondary)',
          marginBottom: 0,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
        }}>
          <input
            type="checkbox"
            checked={includeTasks}
            onChange={e => setIncludeTasks(e.target.checked)}
            disabled={isWorking || !hasTasks}
          />
          Include TASKS.md (task breakdown)
          {!hasTasks && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              (generate tasks first)
            </span>
          )}
        </label>
      </div>

      {/* ZIP bundle section */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 10,
        }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>BUNDLE AS ZIP
        </div>

        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 12,
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
        }}>
          Download all selected files as a single ZIP archive.
          {' '}
          <span style={{ color: 'var(--accent)' }}>
            {zipLabel}
          </span>
        </p>

        <button
          className="term-btn-accent"
          onClick={handleDownloadZip}
          disabled={isWorking || !hasPrd}
          style={{
            opacity: isWorking || !hasPrd ? 0.5 : 1,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {'> '} {isDownloading ? 'GENERATING ZIP...' : 'DOWNLOAD AS ZIP'}
        </button>
      </div>

      {/* Single format download */}
      <button
        className="term-btn"
        onClick={handleDownloadSingle}
        disabled={isWorking || !hasPrd}
        style={{
          opacity: isWorking || !hasPrd ? 0.5 : 1,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {'> '} {isSingleDownload ? `DOWNLOADING ${format.toUpperCase()}...` : `DOWNLOAD ${format.toUpperCase()} ONLY`}
      </button>
    </Layout>
  );
}
