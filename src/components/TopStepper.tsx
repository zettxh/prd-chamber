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
    <div
      className="flex items-center gap-3 px-4 py-3 justify-center"
      style={{
        background: 'var(--bg)',
        boxShadow: 'var(--shadow-nav)',
      }}
    >
      {steps.map((step, i) => {
        const isCompleted = i < stepIndex;
        const isActive = i === stepIndex;
        const isFuture = i > stepIndex;

        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Step circle */}
              <span
                className="inline-flex items-center justify-center text-xs font-semibold"
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--bg)',
                  color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  boxShadow: isCompleted || isActive ? 'var(--shadow-D1)' : 'var(--shadow-L1)',
                  fontSize: 12,
                }}
              >
                {isCompleted ? '✓' : i + 1}
              </span>
              <span
                style={{
                  color: isFuture ? 'var(--text-secondary)' : 'var(--text-primary)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 32, height: 2, borderRadius: 1,
                  background: 'var(--bg)',
                  boxShadow: 'var(--shadow-D1)',
                  opacity: isFuture ? 0.4 : 0.7,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
