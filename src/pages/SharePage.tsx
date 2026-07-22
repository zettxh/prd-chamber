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

      <div className="term-panel" style={{ padding: '24px 28px', fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)', maxWidth: 700 }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>Executive Summary</h2>
        <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
    </Layout>
  );
}
