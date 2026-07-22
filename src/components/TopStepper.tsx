import { useLocation } from 'react-router-dom';

type Step = 'ide' | 'struktur' | 'generate' | 'prd';

function getActiveStep(pathname: string): Step {
  if (pathname.includes('/prd')) return 'prd';
  if (pathname.includes('/generate')) return 'generate';
  if (pathname.includes('/structure')) return 'struktur';
  return 'ide';
}

export default function TopStepper() {
  const location = useLocation();
  const active = getActiveStep(location.pathname);

  const steps: { key: Step; label: string }[] = [
    { key: 'ide', label: 'Ide' },
    { key: 'struktur', label: 'Struktur' },
    { key: 'generate', label: 'Generate' },
    { key: 'prd', label: 'PRD' },
  ];

  const stepIndex = steps.findIndex(s => s.key === active);

  return (
    <div
      className="flex items-center justify-center px-4 py-2"
      style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((step, i) => {
          const isCompleted = i < stepIndex;
          const isActive = i === stepIndex;

          return (
            <span key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Dot */}
              <span style={{
                width: 9, height: 9, borderRadius: '50%', display: 'inline-block',
                background: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                opacity: isActive || isCompleted ? 1 : 0.4,
                marginRight: 5,
              }} />
              <span style={{
                fontSize: 11, fontWeight: isActive ? 500 : 400,
                color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
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
