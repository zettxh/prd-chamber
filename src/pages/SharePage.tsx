import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Layout from '../components/Layout';
import { dummyPrdContent } from '../data/dummy';

const sectionMeta: Record<string, { label: string }> = {
  'executive-summary':    { label: 'Executive Summary' },
  'problem-statement':    { label: 'Problem Statement' },
  'core-features':        { label: 'Core Features' },
  'user-flow':            { label: 'User Flow / Journey' },
  'functional-requirements': { label: 'Functional Requirements' },
  'architecture':         { label: 'System Architecture' },
  'database-schema':       { label: 'Database Schema' },
};

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section
      key={id}
      style={{
        marginBottom: 32,
        scrollMarginTop: 80,
      }}
    >
      {children}
    </section>
  );
}

const mdComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--text-primary)',
      marginBottom: 12,
      marginTop: 28,
      paddingBottom: 8,
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--accent)',
      marginBottom: 10,
      marginTop: 22,
    }}>
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--text-primary)',
      marginBottom: 6,
      marginTop: 16,
    }}>
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={{
      marginBottom: 10,
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
    }}>
      {children}
    </p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={{
      paddingLeft: 20,
      marginBottom: 12,
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
    }}>
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol style={{
      paddingLeft: 20,
      marginBottom: 12,
      lineHeight: 1.8,
      color: 'var(--text-secondary)',
    }}>
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={{ marginBottom: 4, lineHeight: 1.7 }}>
      {children}
    </li>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div style={{ overflowX: 'auto', marginBottom: 14, marginTop: 8 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 11,
        minWidth: 400,
      }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead style={{ background: 'var(--surface-raised)' }}>
      {children}
    </thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr>{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th style={{
      padding: '8px 12px',
      color: 'var(--accent)',
      borderBottom: '1px solid var(--border)',
      fontWeight: 700,
      textAlign: 'left',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td style={{
      padding: '7px 12px',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
    }}>
      {children}
    </td>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
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
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre style={{
      background: 'var(--surface-raised)',
      padding: '14px 18px',
      borderRadius: 6,
      overflowX: 'auto',
      marginBottom: 14,
      marginTop: 8,
      border: '1px solid var(--border)',
    }}>
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote style={{
      borderLeft: '3px solid var(--accent)',
      paddingLeft: 14,
      marginLeft: 0,
      marginBottom: 12,
      marginTop: 8,
      color: 'var(--text-muted)',
      fontStyle: 'italic',
      lineHeight: 1.7,
    }}>
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
      {children}
    </strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em style={{ color: 'var(--text-muted)' }}>{children}</em>
  ),
  hr: () => (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--border)',
      margin: '20px 0',
    }} />
  ),
};

export default function SharePage() {
  const sectionIds = Object.keys(dummyPrdContent);

  return (
    <Layout showBack showStepper={false}>
      {/* Header */}
      <div className="status-bar" style={{ marginBottom: 20 }}>
        <span>SHARED DOCUMENT — READ ONLY</span>
        <span style={{ color: 'var(--text-muted)' }}>TOKEN: xyz-abc-123</span>
      </div>

      {/* Document title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--accent)',
          marginBottom: 4,
        }}>
          Aplikasi POS Kopi
        </h1>
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: 0,
        }}>
          Product Requirements Document — Generated by PRD Chamber
        </p>
      </div>

      {/* Sections */}
      <div className="term-panel" style={{ padding: '28px 32px' }}>
        {sectionIds.map(id => {
          const meta = sectionMeta[id] ?? { label: id.replace(/-/g, ' ') };
          return (
            <Section id={id} key={id}>
              <div style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{ color: 'var(--accent)' }}>▸</span>
                {meta.label}
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={mdComponents}
              >
                {dummyPrdContent[id]}
              </ReactMarkdown>
            </Section>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16,
        padding: '12px 0',
        borderTop: '1px solid var(--border)',
        fontSize: 10,
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
      }}>
        SHARED VIA PRD CHAMBER — READ ONLY DOCUMENT
      </div>
    </Layout>
  );
}
