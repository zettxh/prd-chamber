import { type ReactNode, Component } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidBlock from './MermaidBlock';
import { useMemo } from 'react';

interface MarkdownPart {
  type: 'html' | 'mermaid';
  value: string;
}

function splitMarkdown(content: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  const pattern = /```mermaid\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'mermaid', value: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'html', value: content.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'html', value: content }];
}

const baseStyles: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  lineHeight: 1.8,
  color: 'var(--text-secondary)',
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  display: 'block',
  margin: '8px 0',
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: 11,
};

const thStyle: React.CSSProperties = {
  background: 'var(--bg-accent)',
  color: 'var(--accent)',
  padding: '8px 12px',
  border: '1px solid var(--border)',
  textAlign: 'left',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontSize: 11,
};

const codeBlockStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  padding: '12px 14px',
  overflow: 'auto',
  fontSize: 11,
  margin: '4px 0',
  maxWidth: '100%',
  display: 'block',
  fontFamily: 'var(--font-mono)',
};

const inlineCodeStyle: React.CSSProperties = {
  background: 'var(--bg-input)',
  color: 'var(--accent)',
  padding: '1px 5px',
  fontSize: 11,
  border: '1px solid var(--border)',
  fontFamily: 'var(--font-mono)',
};

const blockquoteStyle: React.CSSProperties = {
  borderLeft: '2px solid var(--accent-dim)',
  paddingLeft: 12,
  margin: '6px 0',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
};

const hrStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--border)',
  margin: '10px 0',
};

const linkStyle: React.CSSProperties = {
  color: 'var(--accent)',
  textDecoration: 'none',
};

const pStyle: React.CSSProperties = {
  margin: '4px 0',
};

const h1Style: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '16px 0 6px',
};
const h2Style: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: 'var(--accent)', margin: '14px 0 6px',
};
const h3Style: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 4px',
};
const h4Style: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '8px 0 4px',
};

const ulStyle: React.CSSProperties = {
  margin: '4px 0', paddingLeft: 20, listStyleType: 'disc',
};
const olStyle: React.CSSProperties = {
  margin: '4px 0', paddingLeft: 20, listStyleType: 'decimal',
};
const liStyle: React.CSSProperties = {
  margin: '2px 0', paddingLeft: 4, color: 'var(--text-secondary)', lineHeight: 1.6,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkdownComponents = Record<string, (props: any) => ReactNode>;

const markdownComponents: MarkdownComponents = {
  h1: ({ children }) => <h1 style={h1Style}>{children}</h1>,
  h2: ({ children }) => <h2 style={h2Style}>{children}</h2>,
  h3: ({ children }) => <h3 style={h3Style}>{children}</h3>,
  h4: ({ children }) => <h4 style={h4Style}>{children}</h4>,
  p: ({ children }) => <p style={pStyle}>{children}</p>,
  table: ({ children }) => (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th style={thStyle}>{children}</th>,
  td: ({ children }) => <td style={tdStyle}>{children}</td>,
  pre: ({ children }) => <pre style={codeBlockStyle}>{children}</pre>,
  code: ({ inline, children, ...props }) => {
    if (inline) return <code style={inlineCodeStyle} {...props}>{children}</code>;
    return <code {...props}>{children}</code>;
  },
  blockquote: ({ children }) => <blockquote style={blockquoteStyle}>{children}</blockquote>,
  hr: () => <hr style={hrStyle} />,
  a: ({ href, children }) => (
    <a href={href} style={linkStyle} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  ul: ({ children }) => <ul style={ulStyle}>{children}</ul>,
  ol: ({ children }) => <ol style={olStyle}>{children}</ol>,
  li: ({ children }) => <li style={liStyle}>{children}</li>,
  strong: ({ children }) => (
    <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }) => <em style={{ color: 'var(--accent-dim)' }}>{children}</em>,
};

interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div style={baseStyles}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class MarkdownErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[MarkdownViewer] Render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '12px 14px',
          background: 'rgba(224,112,112,0.08)',
          border: '1px solid rgba(224,112,112,0.25)',
          borderRadius: 6,
          fontSize: 11,
          color: '#e07070',
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ marginBottom: 4, fontWeight: 600 }}>
            Render error — content may be malformed
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {this.state.error?.slice(0, 120)}...
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MarkdownViewer({ content }: { content: string }) {
  const parts = useMemo(() => splitMarkdown(content), [content]);

  return (
    <MarkdownErrorBoundary>
      {parts.map((part, i) => {
        if (part.type === 'mermaid') {
          return <MermaidBlock key={`mermaid-block-${i}`} code={part.value} />;
        }
        return <MarkdownRenderer key={`html-block-${i}`} content={part.value} />;
      })}
    </MarkdownErrorBoundary>
  );
}
