import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProjectTitle from './ProjectTitle';
import { useProjectStore } from '../stores/project';

type Step = 'ide' | 'struktur' | 'generate' | 'prd';

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
];

function getActiveStep(pathname: string): Step {
  if (pathname.includes('/prd')) return 'prd';
  if (pathname.includes('/generate')) return 'generate';
  if (pathname.includes('/structure')) return 'struktur';
  return 'ide';
}

export default function TopStepper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const setActive = useProjectStore((s) => s.setActive);
  const active = getActiveStep(location.pathname);
  const stepIndex = STEPS.findIndex(s => s.key === active);

  // Auto-set active project from URL param
  useEffect(() => {
    if (projectId) setActive(projectId);
  }, [projectId, setActive]);

  const handleClick = (index: number) => {
    if (index >= stepIndex) return;
    const target = STEPS[index];
    navigate(`/project/${projectId}/${target.path}`);
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
          const isClickable = isCompleted;

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
                opacity: isActive || isCompleted ? 1 : 0.4,
                marginRight: 5,
                transition: 'opacity 150ms',
              }} />
              <span style={{
                fontSize: 11, fontWeight: isActive ? 500 : 400,
                color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: isClickable ? undefined : 'none',
                borderBottom: isClickable ? '1px dotted var(--text-muted)' : undefined,
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
