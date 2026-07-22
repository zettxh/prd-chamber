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
    { key: 'ide', label: 'IDE' },
    { key: 'struktur', label: 'STRUKTUR' },
    { key: 'generate', label: 'GENERATE' },
    { key: 'prd', label: 'PRD' },
  ];

  const stepIndex = steps.findIndex(s => s.key === active);

  return (
    <div
      className="flex items-center justify-center gap-0 px-4 py-2.5"
      style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="term-stepper">
        {steps.map((step, i) => {
          const isCompleted = i < stepIndex;
          const isActive = i === stepIndex;
          const isFuture = i > stepIndex;

          return (
            <span key={step.key} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className={isCompleted ? 'step-done' : isActive ? 'step-active' : 'step-future'}>
                [{isCompleted ? '✓' : i + 1}] {step.label}
              </span>
              {i < steps.length - 1 && (
                <span className="step-dash"> — </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
