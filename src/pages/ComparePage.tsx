import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import DiffView from '../components/DiffView';
import { dummyVersions, dummyPrdContent } from '../data/dummy';

// Simulated version content — in Phase B this comes from DB
const versionContent: Record<string, string> = {
  v1: dummyPrdContent['executive-summary'],
  v2: dummyPrdContent['core-features'],
  v3: dummyPrdContent['functional-requirements'],
  v4: dummyPrdContent['architecture'],
};

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const v1Id = searchParams.get('v1') || 'v3';
  const v2Id = searchParams.get('v2') || 'v4';

  const v1 = dummyVersions.find(v => v.id === v1Id);
  const v2 = dummyVersions.find(v => v.id === v2Id);

  // Fallback content for demo
  const v1Content = versionContent[v1Id] || dummyPrdContent['core-features'];
  const v2Content = versionContent[v2Id] || dummyPrdContent['architecture'];

  return (
    <Layout showBack showStepper={false}>
      <h1 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        marginBottom: 6,
      }}>
        Version Comparison
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        marginBottom: 20,
      }}>
        Comparing changes between versions
      </p>

      <DiffView
        oldLabel={v1 ? `v${v1.version}: ${v1.summary}` : v1Id}
        newLabel={v2 ? `v${v2.version}: ${v2.summary}` : v2Id}
        oldContent={v1Content}
        newContent={v2Content}
      />
    </Layout>
  );
}
