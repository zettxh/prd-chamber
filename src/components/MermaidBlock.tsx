import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Neumorphic dark — unified theme for flowchart + ERD
const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: 'base' as const,
  themeVariables: {
    // ── Base colors — neumorphic dark tokens ──
    primaryColor: '#2A2318',
    primaryTextColor: '#EDE4D3',
    primaryBorderColor: '#5A6B7E',
    lineColor: '#5A6B7E',

    // ── Background ──
    background: '#1E1810',
    mainBkg: '#2A2318',
    secondaryColor: '#24303A',
    tertiaryColor: '#1E1810',

    // ── Text ──
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '11px',

    // ── Flowchart ──
    nodeBorder: '#5A6B7E',
    nodeTextColor: '#EDE4D3',
    clusterBkg: '#24303A',
    clusterBorder: '#5A6B7E',
    titleColor: '#EDE4D3',
    edgeLabelBackground: '#1E1810',

    // ── Colors palette ──
    fillType0: '#2A2318',
    fillType1: '#24303A',
    fillType2: '#1E1810',
    fillType3: '#1A1A18',
    fillType4: '#222222',
    fillType5: '#333333',

    // ── Signal / flow arrows ──
    signalColor: '#D4A843',
    signalTextColor: '#EDE4D3',

    // ── Node styles ──
    nodeBkg: '#2A2318',

    // ── ERD specific (THE MISSING PIECE) ──
    er: {
      // Entity box
      fill: '#2A2318',
      // Header background
      fill_Title: '#24303A',
      // Background
      background: '#2A2318',
      // Title background
      titleColor: '#24303A',
      // Entity border
      border1: '#5A6B7E',
      border2: '#5A6B7E',
      // Attribute text
      attributeBackgroundColor: '#2A2318',
      attributeTextColor: '#EDE4D3',
      attributeTitleBackgroundColor: '#24303A',
      attributeTitleTextColor: '#EDE4D3',
      // Lines
      lineColor: '#5A6B7E',
      // Extra
      stroke: '#5A6B7E',
    },

    // ── Additional safety ──
    darkMode: true,
  },
  securityLevel: 'loose' as const,
  flowchart: {
    htmlLabels: true,
    curve: 'basis' as const,
    nodeSpacing: 32,
    rankSpacing: 40,
    padding: 12,
  },
  er: {
    diagramPadding: 20,
    entityPadding: 12,
    attributePadding: 8,
  },
};

let initialized = false;

function initMermaid() {
  if (initialized) return;
  mermaid.initialize(MERMAID_CONFIG);
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
      if (ref.current) {
        ref.current.innerHTML = svg;
        // Apply CSS overrides post-render for ERD SVG elements
        applySVGOverrides(ref.current);
      }
    }).catch((err) => {
      setError(err.message);
    });
  }, [code]);

  // Post-render: force ERD SVG elements to match neumorphic dark
  function applySVGOverrides(container: HTMLDivElement) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Target all rect (entity boxes, attribute rows)
    svg.querySelectorAll('rect').forEach(rect => {
      const fill = rect.getAttribute('fill');
      const stroke = rect.getAttribute('stroke');
      // If it's a light/neutral fill from Mermaid default, override
      if (fill && (fill.startsWith('#f') || fill.startsWith('#FFF') || fill === 'none')) {
        rect.setAttribute('fill', '#2A2318');
      }
      if (stroke && stroke.startsWith('#f')) {
        rect.setAttribute('stroke', '#5A6B7E');
      }
    });

    // Target all text elements
    svg.querySelectorAll('text').forEach(text => {
      const fill = text.getAttribute('fill');
      if (fill && (fill.startsWith('#3') || fill.startsWith('#E') || fill.startsWith('#D'))) {
        text.setAttribute('fill', '#EDE4D3');
      }
    });

    // Target lines/paths
    svg.querySelectorAll('path, line').forEach(el => {
      const stroke = el.getAttribute('stroke');
      if (stroke && stroke.startsWith('#f')) {
        el.setAttribute('stroke', '#5A6B7E');
      }
    });
  }

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
      <div ref={ref} style={{ display: 'flex', justifyContent: 'center' }} />
    </figure>
  );
}
