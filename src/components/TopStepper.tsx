import { useLocation } from 'react-router-dom';

type Step = 'ide' | 'struktur' | 'prd';

function getActiveStep(pathname: string): Step {
  if (pathname.includes('/prd')) return 'prd';
  if (pathname.includes('/structure')) return 'struktur';
  return 'ide';
}

export default function TopStepper() {
  const location = useLocation();
  const active = getActiveStep(location.pathname);

  const steps: { key: Step; label: string }[] = [
    { key: 'ide', label: 'Ide' },
    { key: 'struktur', label: 'Struktur' },
    { key: 'prd', label: 'PRD' },
  ];

  const stepIndex = steps.findIndex(s => s.key === active);

  return (
    <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
      {steps.map((step, i) => {
        const isCompleted = i < stepIndex;
        const isActive = i === stepIndex;
        const isFuture = i > stepIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold"
                style={{
                  background: isCompleted ? 'var(--success)' : isActive ? 'var(--error)' : 'transparent',
                  border: isFuture ? '1px solid var(--border-default)' : 'none',
                  color: isCompleted || isActive ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {isCompleted ? '✓' : i + 1}
              </span>
              <span style={{ color: isFuture ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: 13 }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-px" style={{ background: 'var(--border-default)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
