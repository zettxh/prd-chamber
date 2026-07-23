import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import { dummyPrdContent } from '../data/dummy';

export default function SharePage() {
  const content = dummyPrdContent['executive-summary'];

  return (
    <Layout showBack showStepper={false}>
      <div className="status-bar" style={{ marginBottom: 14 }}>
        <span>SHARED DOCUMENT — READ ONLY</span>
        <span style={{ color: 'var(--text-muted)' }}>TOKEN: xyz-abc-123</span>
      </div>

      <div
        className="term-panel"
        style={{
          padding: '24px 28px',
          fontSize: 12,
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          maxWidth: 700,
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--accent)',
          marginBottom: 16,
        }}>
          Executive Summary
        </h2>

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, marginTop: 20 }}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, marginTop: 18 }}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, marginTop: 14 }}>{children}</h3>
            ),
            p: ({ children }) => (
              <p style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>{children}</p>
            ),
            ul: ({ children }) => (
              <ul style={{ paddingLeft: 20, marginBottom: 10, color: 'var(--text-secondary)' }}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol style={{ paddingLeft: 20, marginBottom: 10, color: 'var(--text-secondary)' }}>{children}</ol>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: 4 }}>{children}</li>
            ),
            table: ({ children }) => (
              <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{ padding: '6px 10px', background: 'var(--surface-raised)', color: 'var(--accent)', borderBottom: '1px solid var(--border)', fontWeight: 700, textAlign: 'left' }}>{children}</th>
            ),
            td: ({ children }) => (
              <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{children}</td>
            ),
            code: ({ children }) => (
              <code style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                background: 'var(--surface-raised)',
                padding: '1px 5px',
                borderRadius: 4,
                color: 'var(--accent)',
              }}>
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre style={{
                background: 'var(--surface-raised)',
                padding: '12px 16px',
                borderRadius: 6,
                overflowX: 'auto',
                marginBottom: 12,
                border: '1px solid var(--border)',
              }}>
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote style={{
                borderLeft: '3px solid var(--accent)',
                paddingLeft: 14,
                marginLeft: 0,
                marginBottom: 10,
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}>
                {children}
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Layout>
  );
}
