import { Component, type ReactNode } from 'react';
import { useMemo } from 'react';
import MermaidBlock from './MermaidBlock';

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

function renderHtmlContent(html: string): ReactNode[] {
  if (!html.trim()) return [];

  return [
    <div
      key="html-content"
      dangerouslySetInnerHTML={{ __html: renderHtmlToMarkup(html) }}
      style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)' }}
    />,
  ];
}

/** Convert markdown table block to HTML table */
function convertTableBlock(tableBlock: string): string {
  const lines = tableBlock.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return tableBlock;

  // Parse rows (skip separator line index 1)
  const rows = lines.filter((_, i) => i !== 1);
  if (rows.length < 2) return tableBlock;

  const parseRow = (line: string): string[] =>
    line.split('|').slice(1, -1).map(c => c.trim());

  const headers = parseRow(rows[0]);
  const dataRows = rows.slice(1);

  const headerCells = headers
    .map(h => `<th style="background:var(--bg-accent);color:var(--accent);padding:8px 12px;border:1px solid var(--border);font-size:11px;text-align:left;font-weight:700;white-space:nowrap">${h}</th>`)
    .join('');

  const bodyRows = dataRows
    .map(row => {
      const cells = parseRow(row);
      const cellHtml = cells
        .map(c => `<td style="padding:8px 12px;border:1px solid var(--border);color:var(--text-secondary);font-size:11px">${c}</td>`)
        .join('');
      return `<tr>${cellHtml}</tr>`;
    })
    .join('');

  return `<table style="border-collapse:collapse;width:100%;max-width:100%;overflow-x:auto;display:block;margin:8px 0">${headerCells}${bodyRows}</table>`;
}

/** Convert markdown HTML to styled HTML string */
function renderHtmlToMarkup(md: string): string {
  // ── Pre-process: tables ───────────────────────────────────────────
  // Match entire table blocks (header + separator + rows)
  let html = md.replace(
    /(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g,
    (match) => convertTableBlock(match)
  );

  // ── Main replacements ────────────────────────────────────────────
  html = html
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:12px;font-weight:700;color:var(--text-primary);margin:10px 0 4px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:700;color:var(--accent);margin:14px 0 6px">$1</h2>')
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--accent-dim)">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-input);color:var(--accent);padding:1px 5px;font-size:11px;border:1px solid var(--border)">$1</code>')
    // Code blocks
    .replace(/```\w*\n?([\s\S]*?)```/g, (_, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre style="background:var(--bg-input);border:1px solid var(--border);padding:12px 14px;overflow:auto;font-size:11px;margin:4px 0;max-width:100%;display:block"><code>${escaped}</code></pre>`;
    })
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:2px solid var(--accent-dim);padding-left:10px;margin:6px 0;color:var(--text-muted)">$1</blockquote>')
    // HR
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0" />')
    // Ordered lists (1. item)
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:2px 0;padding-left:4px;color:var(--text-secondary)">$1</li>')
    // Unordered lists (- item)
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px;color:var(--text-secondary)">$1</li>')
    // Horizontal padding for list blocks (wrap consecutive <li> in <ul>)
    // — done by paragraph split below
    ;

  // ── Paragraph split ───────────────────────────────────────────────
  const blocks = html.split(/\n\n+/);
  const rendered = blocks.map(block => {
    block = block.trim();
    if (!block) return '';

    // Already a block-level element — pass through
    if (
      block.startsWith('<h') ||
      block.startsWith('<pre') ||
      block.startsWith('<blockquote') ||
      block.startsWith('<li') ||
      block.startsWith('<hr') ||
      block.startsWith('<table') ||
      block.startsWith('<figure')
    ) {
      return block;
    }

    // Wrap in <p>
    return `<p style="margin:4px 0">${block.replace(/\n/g, '<br />')}</p>`;
  });

  return rendered.join('\n');
}

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
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
    }}>
      <MarkdownErrorBoundary>
        {parts.map((part, i) => {
          if (part.type === 'mermaid') {
            return <MermaidBlock key={`mermaid-block-${i}`} code={part.value} />;
          }
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
