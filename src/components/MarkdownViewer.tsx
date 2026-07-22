import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import MermaidBlock from './MermaidBlock';

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8,
      color: 'var(--text-secondary)',
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          h2: ({children}) => (
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', margin: '14px 0 6px' }}>{children}</h2>
          ),
          h3: ({children}) => (
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 4px' }}>{children}</h3>
          ),
          p: ({children}) => <p style={{ margin: '4px 0' }}>{children}</p>,
          strong: ({children}) => <strong style={{ color: 'var(--text-primary)' }}>{children}</strong>,
          em: ({children}) => <em style={{ color: 'var(--accent-dim)' }}>{children}</em>,
          code: ({className, children}) => {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            if (lang === 'mermaid') return <MermaidBlock code={String(children)} />;
            const isInline = !match;
            return isInline
              ? <code style={{ background: 'var(--bg-input)', color: 'var(--accent)', padding: '1px 5px', fontSize: 11, border: '1px solid var(--border)' }}>{children}</code>
              : <pre style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '12px 14px', overflow: 'auto', fontSize: 11 }}><code className={className}>{children}</code></pre>;
          },
          ul: ({children}) => <ul style={{ paddingLeft: 16, margin: '4px 0' }}>{children}</ul>,
          li: ({children}) => <li style={{ margin: '2px 0' }}>{children}</li>,
          table: ({children}) => (
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>{children}</table>
            </div>
          ),
          th: ({children}) => <th style={{ textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 500 }}>{children}</th>,
          td: ({children}) => <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(58,58,54,0.5)' }}>{children}</td>,
          blockquote: ({children}) => (
            <blockquote style={{ borderLeft: '2px solid var(--accent-dim)', paddingLeft: 10, margin: '6px 0', color: 'var(--text-muted)' }}>{children}</blockquote>
          ),
          hr: () => <div className="term-divider" style={{ margin: '10px 0' }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
