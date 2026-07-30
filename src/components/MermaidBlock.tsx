import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: 'base' as const,
  themeVariables: {
    primaryColor: '#2A2318',
    primaryTextColor: '#EDE4D3',
    primaryBorderColor: '#5A6B7E',
    lineColor: '#5A6B7E',
    background: '#1E1810',
    mainBkg: '#2A2318',
    secondaryColor: '#24303A',
    tertiaryColor: '#1E1810',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '11px',
    nodeBorder: '#5A6B7E',
    nodeTextColor: '#EDE4D3',
    clusterBkg: '#24303A',
    clusterBorder: '#5A6B7E',
    titleColor: '#EDE4D3',
    edgeLabelBackground: '#1E1810',
    fillType0: '#2A2318',
    fillType1: '#24303A',
    fillType2: '#1E1810',
    fillType3: '#1A1A18',
    fillType4: '#222222',
    fillType5: '#333333',
    signalColor: '#D4A843',
    signalTextColor: '#EDE4D3',
    nodeBkg: '#2A2318',
    er: {
      fill: '#2A2318',
      fill_Title: '#24303A',
      background: '#2A2318',
      titleColor: '#24303A',
      border1: '#5A6B7E',
      border2: '#5A6B7E',
      attributeBackgroundColor: '#2A2318',
      attributeTextColor: '#EDE4D3',
      attributeTitleBackgroundColor: '#24303A',
      attributeTitleTextColor: '#EDE4D3',
      lineColor: '#5A6B7E',
      stroke: '#5A6B7E',
    },
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

function applySVGOverrides(svg: SVGElement) {
  svg.querySelectorAll('rect').forEach((rect) => {
    const fill = rect.getAttribute('fill');
    const stroke = rect.getAttribute('stroke');
    if (fill && (fill.startsWith('#f') || fill.startsWith('#FFF') || fill === 'none')) {
      rect.setAttribute('fill', '#2A2318');
    }
    if (stroke && stroke.startsWith('#f')) {
      rect.setAttribute('stroke', '#5A6B7E');
    }
  });
  svg.querySelectorAll('text').forEach((text) => {
    const fill = text.getAttribute('fill');
    if (fill && (fill.startsWith('#3') || fill.startsWith('#E') || fill.startsWith('#D'))) {
      text.setAttribute('fill', '#EDE4D3');
    }
  });
  svg.querySelectorAll('path, line').forEach((el) => {
    const stroke = el.getAttribute('stroke');
    if (stroke && stroke.startsWith('#f')) {
      el.setAttribute('stroke', '#5A6B7E');
    }
  });
}

interface MermaidBlockProps {
  code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // These refs survive component re-renders but reset on mount/unmount
  const lastCodeRef = useRef<string>('');
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    const container = containerRef.current;
    if (!container) return;

    // ── Guard: skip if code unchanged ──────────────────────────────
    if (code === lastCodeRef.current) return;

    lastCodeRef.current = code;

    // Show loading state
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;min-height:60px;color:var(--text-muted);font-size:10px;font-family:var(--font-mono)">rendering diagram...</div>';

    initMermaid();

    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        // ── Check: is this still the right mount AND right code? ───
        if (!isMountedRef.current) return;
        if (lastCodeRef.current !== code) return;
        if (!container) return;

        const temp = document.createElement('div');
        temp.innerHTML = svg;
        const svgEl = temp.querySelector('svg');
        if (svgEl) applySVGOverrides(svgEl);
        container.innerHTML = temp.innerHTML;
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        if (lastCodeRef.current !== code) return;
        if (!container) return;

        container.innerHTML =
          '<div style="color:#e07070;font-size:11px;font-family:var(--font-mono);padding:12px">Diagram error: ' +
          String(err.message || 'render failed') +
          '</div><pre style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);overflow:auto;max-height:120px">' +
          String(code).slice(0, 500) +
          '</pre>';
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [code]);

  return (
    <figure
      style={{
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: 14,
        margin: '12px auto',
        background: 'var(--bg-panel)',
        maxWidth: 680,
        overflowX: 'auto',
      }}
    >
      <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }} />
    </figure>
  );
}
