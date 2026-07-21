import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import MermaidBlock from './MermaidBlock';

interface Props { content: string; }

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
            if (lang === 'mermaid') return <MermaidBlock code={codeStr} />;
            if (!lang) {
              return (
                <code className="px-1.5 py-0.5 rounded-md text-xs" style={{
                  background: 'var(--bg)', color: 'var(--accent)',
                  boxShadow: 'var(--shadow-D1)', fontFamily: '"JetBrains Mono", monospace',
                }} {...props}>{children}</code>
              );
            }
            return (
              <pre className="rounded-xl p-3 text-xs overflow-x-auto" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow-D1)' }}>
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
          table({ children }) {
            return <div className="overflow-x-auto my-4 rounded-xl" style={{ boxShadow: 'var(--shadow-L1)' }}><table className="text-sm w-full border-collapse">{children}</table></div>;
          },
          th({ children }) {
            return <th className="px-3 py-2 text-left text-xs font-semibold" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-D1)' }}>{children}</th>;
          },
          td({ children }) {
            return <td className="px-3 py-2 text-xs" style={{ color: 'var(--text-primary)' }}>{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
