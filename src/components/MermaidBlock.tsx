import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Init mermaid once — neumorphic dark theme tokens
let initialized = false;
function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      // Primary — matches neumorphic dark tokens
      primaryColor: '#2A2318',
      primaryTextColor: '#EDE4D3',
      primaryBorderColor: '#5A6B7E',
      lineColor: '#5A6B7E',

      // Secondary
      secondaryColor: '#24303A',
      background: '#1E1810',

      // Tertiary
      tertiaryColor: '#1A1A18',

      // Node fills
      fillType0: '#2A2318',
      fillType1: '#24303A',

      // Edge
      edgeLabelBackground: '#1E1810',

      // Font
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',

      // Shape stroke
      mainBkg: '#2A2318',
      nodeBorder: '#5A6B7E',
      clusterBkg: '#24303A',

      // Special nodes
      signalColor: '#D4A843',
      signalTextColor: '#EDE4D3',

      // Flowchart specific
      nodeTextColor: '#EDE4D3',
    },
    securityLevel: 'loose',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      nodeSpacing: 32,
      rankSpacing: 40,
      padding: 12,
    },
  });
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
      <figure style={{
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '12px 14px',
        margin: '12px 0',
        fontSize: 11,
        color: 'var(--error)',
        background: 'var(--bg-panel)',
        maxWidth: 680,
      }}>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>⚠ Diagram error</div>
        <pre style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'auto', margin: 0 }}>{code}</pre>
      </figure>
    );
  }

  return (
    <figure style={{
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: 14,
      margin: '12px auto',
      background: 'var(--bg-panel)',
      maxWidth: 680,
      overflowX: 'auto',
    }}>
      <div
        ref={ref}
        style={{ display: 'flex', justifyContent: 'center' }}
      />
    </figure>
  );
}
