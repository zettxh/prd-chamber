import MarkdownViewer from '../components/MarkdownViewer';
import { dummyPrdContent } from '../data/dummy';

export default function SharePage() {
  const allContent = Object.values(dummyPrdContent).join('\n\n---\n\n');

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        📄 PRD dibagikan — View Only
      </div>
      <MarkdownViewer content={allContent} />
    </div>
  );
}
