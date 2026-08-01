import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProjectTitle from './ProjectTitle';
import { useProjectStore } from '../stores/project';

type Step = 'ide' | 'struktur' | 'generate' | 'prd' | 'tasks';

interface StepDef {
  key: Step;
  label: string;
  path: string;
}

const STEPS: StepDef[] = [
  { key: 'ide', label: 'Ide', path: 'clarify' },
  { key: 'struktur', label: 'Struktur', path: 'structure' },
  { key: 'generate', label: 'Generate', path: 'generate' },
  { key: 'prd', label: 'PRD', path: 'prd' },
  { key: 'tasks', label: 'Tasks', path: 'tasks' },
];

function getActiveStep(pathname: string): Step {
  // Specific path checks first — order matters (check more specific first)
  if (pathname.includes('/clarify')) return 'ide';
  if (pathname.includes('/structure')) return 'struktur';
  if (pathname.includes('/generate')) return 'generate';
  if (pathname.includes('/tasks')) return 'tasks';
  // All remaining project pages (export, versions, compare, checkpoints, share, /prd itself) → show 'prd'
  return 'prd';
}

export default function TopStepper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const setActive = useProjectStore((s) => s.setActive);
  const active = getActiveStep(location.pathname);
  const stepIndex = STEPS.findIndex(s => s.key === active);
  const [navigating, setNavigating] = useState(false);

  // Auto-set active project from URL param
  useEffect(() => {
    if (projectId) setActive(projectId);
  }, [projectId, setActive]);

  // Clear navigating state on route change
  useEffect(() => {
    setNavigating(false);
  }, [location.pathname]);

  const lastNav = useRef<number>(0);

  const handleClick = (index: number) => {
    if (index > stepIndex) return;
    const now = Date.now();
    if (now - lastNav.current < 500) return;
    lastNav.current = now;
    setNavigating(true);
    const target = STEPS[index];
    const url = `/project/${projectId}/${target.path}`;
    // Primary: React Router navigate (soft navigation)
    // Fallback: window.location if navigate fails silently
    const result = navigate(url);
    if (result && typeof result.then === 'function') {
      // navigate() returns a Promise — fall back to hard navigation if it doesn't resolve quickly
      result.then(() => {}).catch(() => {
        window.location.href = url;
      });
      // Hard timeout fallback: if Promise takes > 1s, assume it's stuck
      setTimeout(() => {
        if (window.location.pathname !== url) {
          window.location.href = url;
        }
      }, 1000);
    }
  };

  return (
    <div
      className="flex items-center px-4 py-2"
      style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Project Title — left aligned */}
      {projectId && (
        <ProjectTitle projectId={projectId} />
      )}

      {/* Stepper — centered, fills remaining space */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, justifyContent: 'center' }}>
        {STEPS.map((step, i) => {
          const isCompleted = i < stepIndex;
          const isActive = i === stepIndex;
          const isClickable = i <= stepIndex;

          return (
            <span
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: isClickable ? 'pointer' : 'default',
              }}
              onClick={() => handleClick(i)}
              title={isClickable ? `Kembali ke ${step.label}` : undefined}
            >
              <span style={{
                width: 9, height: 9, borderRadius: '50%', display: 'inline-block',
                background: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                opacity: isClickable ? 1 : 0.3,
                marginRight: 5,
                transition: 'all 150ms',
                boxShadow: navigating && isActive ? '0 0 8px var(--accent)' : undefined,
                transform: navigating && isActive ? 'scale(1.3)' : undefined,
              }} />
              <span style={{
                fontSize: 11, fontWeight: isActive ? 500 : 400,
                color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : isClickable ? 'var(--text-primary)' : 'var(--text-muted)',
                textDecoration: isClickable ? undefined : 'none',
                borderBottom: isClickable ? '1px dotted var(--text-muted)' : undefined,
                opacity: isClickable ? 1 : 0.5,
              }}>
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <span style={{
                  width: 32, height: 1,
                  background: 'var(--border)',
                  margin: '0 12px',
                  opacity: i < stepIndex ? 0.6 : 0.3,
                }} />
              )}
            </span>
          );
        })}
      </div>

      {/* Right spacer to balance the ProjectTitle on left */}
      <div style={{ width: 'fit-content', minWidth: 140 }} />
    </div>
  );
}
