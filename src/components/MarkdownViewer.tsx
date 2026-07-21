import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import MermaidBlock from './MermaidBlock';

interface Props {
  content: string;
}

export default function MarkdownViewer({ content }: Props) {
  return (
    <div className="prose dark:prose-invert max-w-none" style={{ color: 'var(--text-primary)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match?.[1];
            const codeStr = String(children).replace(/\n$/, '');

            // Mermaid blocks
            if (lang === 'mermaid') {
              return <MermaidBlock code={codeStr} />;
            }

            // Inline code
            if (!lang) {
              return (
                <code
                  className="px-1 py-0.5 rounded text-xs"
                  style={{
                    background: 'var(--chip-default)',
                    color: 'var(--accent-primary)',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Code block
            return (
              <pre className="rounded-md p-3 text-xs overflow-x-auto" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="text-sm w-full border-collapse" style={{ border: '1px solid var(--border-default)' }}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-3 py-2 text-left text-xs font-semibold" style={{ background: 'var(--chip-default)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3 py-2 text-xs" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                {children}
              </td>
            );
          },
          hr() {
            return <hr style={{ borderColor: 'var(--border-default)' }} />;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 pl-4 my-2 italic text-sm" style={{ borderColor: 'var(--accent-primary)', color: 'var(--text-secondary)' }}>
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
