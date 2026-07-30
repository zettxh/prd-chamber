import { Component, type ReactNode } from 'react';
import { useMemo } from 'react';
import MermaidBlock from './MermaidBlock';

interface MarkdownPart {
  type: 'html' | 'mermaid';
  value: string;
}

/**
 * Split markdown content into HTML chunks and mermaid code blocks.
 * Each call returns the same stable array for the same content string.
 */
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

/**
 * Render simple HTML (no mermaid) as React elements.
 * Handles: h2, h3, p, strong, em, ul, li, blockquote, table, hr, code blocks, inline code.
 */
function renderHtmlContent(html: string): ReactNode[] {
  if (!html.trim()) return [];

  // Use dangerouslySetInnerHTML for the full content
  // This bypasses ReactMarkdown's component system entirely
  // Only non-mermaid content reaches here
  return [
    <div
      key="html-content"
      dangerouslySetInnerHTML={{ __html: renderHtmlToMarkup(html) }}
      style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)' }}
    />,
  ];
}

/** Convert markdown HTML to styled HTML string */
function renderHtmlToMarkup(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:12px;font-weight:700;color:var(--text-primary);margin:10px 0 4px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:700;color:var(--accent);margin:14px 0 6px">$1</h2>')
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--accent-dim)">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-input);color:var(--accent);padding:1px 5px;font-size:11px;border:1px solid var(--border)">$1</code>')
    // Code blocks (non-mermaid — already stripped)
    .replace(/```\w*\n?([\s\S]*?)```/g, (_, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre style="background:var(--bg-input);border:1px solid var(--border);padding:12px 14px;overflow:auto;font-size:11px;margin:4px 0"><code>${escaped}</code></pre>`;
    })
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:2px solid var(--accent-dim);padding-left:10px;margin:6px 0;color:var(--text-muted)">$1</blockquote>')
    // HR
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0" />')
    // Lists
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    // Paragraphs (simple — wrap orphan lines)
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (
        block.startsWith('<h') ||
        block.startsWith('<pre') ||
        block.startsWith('<blockquote') ||
        block.startsWith('<li') ||
        block.startsWith('<hr')
      ) {
        return block;
      }
      // Wrap in <p> if not already wrapped
      if (!block.startsWith('<')) {
        return `<p style="margin:4px 0">${block.replace(/\n/g, '<br />')}</p>`;
      }
      return block;
    })
    .join('\n');

  return html;
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class MarkdownErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string | null }
> {
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
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(224,112,112,0.08)',
            border: '1px solid rgba(224,112,112,0.25)',
            borderRadius: 6,
            fontSize: 11,
            color: '#e07070',
            fontFamily: 'var(--font-mono)',
          }}
        >
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

// ─── Main component ────────────────────────────────────────────────────────────
/**
 * Custom MarkdownViewer that:
 * 1. Pre-splits content into HTML and mermaid blocks (via regex)
 * 2. Renders HTML via dangerouslySetInnerHTML (bypasses ReactMarkdown — no re-render cascade)
 * 3. Renders mermaid blocks with MermaidBlock (stable, controlled mount)
 *
 * Key insight: We avoid ReactMarkdown's component system entirely for mermaid.
 * This eliminates the re-render cascade that caused MermaidBlock to remount.
 */
export default function MarkdownViewer({ content }: { content: string }) {
  // Split content into HTML and mermaid blocks — only recomputes when content changes
  const parts = useMemo(() => splitMarkdown(content), [content]);

  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
      }}
    >
      <MarkdownErrorBoundary>
        {parts.map((part, i) => {
          if (part.type === 'mermaid') {
            // Stable key based on position — MermaidBlock only remounts if order changes
            return <MermaidBlock key={`mermaid-block-${i}`} code={part.value} />;
          }
          // Render HTML — bypasses ReactMarkdown entirely
          // React reconciles these divs by key, no component recreation
          return (
            <div key={`html-block-${i}`}>
              {renderHtmlContent(part.value)}
            </div>
          );
        })}
      </MarkdownErrorBoundary>
    </div>
  );
}
