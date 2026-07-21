import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

export default function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
    mermaid.render(id, code).then(({ svg: renderedSvg }) => {
      setSvg(renderedSvg);
      setError('');
    }).catch(() => {
      setError('Diagram gagal dirender');
    });
  }, [code]);

  if (error) {
    return (
      <div className="p-3 rounded-md text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--error)' }}>
        <p style={{ color: 'var(--error)' }}>{error}</p>
        <pre style={{ color: 'var(--text-secondary)' }}>{code}</pre>
      </div>
    );
  }

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} className="my-4" />;
}
