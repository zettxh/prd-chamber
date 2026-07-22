import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Init mermaid once with dark theme
let initialized = false;
function initMermaid() {
  if (initialized) return;
  mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
  initialized = true;
}

export default function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMermaid();
    if (!ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
    ref.current.innerHTML = '';
    mermaid.render(id, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch((err) => {
      setError(err.message);
    });
  }, [code]);

  if (error) {
    return (
      <div className="term-panel" style={{ padding: '12px 14px', margin: '8px 0', fontSize: 11, color: 'var(--error)' }}>
        ⚠ Mermaid parse error
        <pre style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>{code}</pre>
      </div>
    );
  }

  return (
    <div className="term-panel" style={{ padding: '14px 16px', margin: '8px 0', overflowX: 'auto' }}>
      <div ref={ref} />
    </div>
  );
}
