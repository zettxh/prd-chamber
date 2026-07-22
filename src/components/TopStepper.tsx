import { useLocation, useNavigate, useParams } from 'react-router-dom';

type Step = 'ide' | 'struktur' | 'generate' | 'prd';

interface StepDef {
  key: Step;
  label: string;
  /** Relative path suffix — combined with /project/:id/ */
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
  const active = getActiveStep(location.pathname);
  const stepIndex = STEPS.findIndex(s => s.key === active);

  const handleClick = (index: number) => {
    // Only allow clicking completed steps (before current)
    if (index >= stepIndex) return;
    const target = STEPS[index];
    navigate(`/project/${projectId}/${target.path}`);
  };

  return (
    <div
      className="flex items-center justify-center px-4 py-2"
      style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
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
              {/* Dot */}
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
                transition: 'color 150ms',
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
    </div>
  );
}
