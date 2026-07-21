import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

interface Props {
  chart: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function MermaidDiagram({ chart, onNodeClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    mermaid.render('mermaid-svg', chart).then(({ svg: renderedSvg }) => {
      setSvg(renderedSvg);
      setError('');
    }).catch(err => {
      setError('Diagram gagal dirender');
      console.error(err);
    });
  }, [chart]);

  useEffect(() => {
    if (!ref.current || !onNodeClick) return;
    const nodes = ref.current.querySelectorAll('.node');
    nodes.forEach(node => {
      node.addEventListener('click', () => {
        const text = node.textContent?.trim() || '';
        onNodeClick(text);
      });
    });
  }, [svg, onNodeClick]);

  if (error) {
    return <div className="p-4 rounded-md" style={{ color: 'var(--error)', background: 'var(--bg-card)' }}>{error}</div>;
  }

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />;
}
