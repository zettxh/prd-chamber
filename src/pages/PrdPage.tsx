import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrdSection from '../components/PrdSection';
import PrdSidebar from '../components/PrdSidebar';
import RevisionModal from '../components/RevisionModal';
import { dummyPrdContent } from '../data/dummy';

const sections = [
  { id: 'executive-summary',        label: 'Executive Summary' },
  { id: 'problem-statement',       label: 'Problem Statement' },
  { id: 'core-features',           label: 'Core Features' },
  { id: 'user-flow',              label: 'User Flow / Journey' },
  { id: 'functional-requirements',  label: 'Functional Requirements' },
  { id: 'architecture',           label: 'System Architecture' },
  { id: 'database-schema',         label: 'Database Schema' },
];

const sectionTitles: Record<string, string> = {
  'executive-summary': 'Executive Summary',
  'problem-statement': 'Problem Statement',
  'core-features': 'Core Features',
  'user-flow': 'User Flow / Journey',
  'functional-requirements': 'Functional Requirements',
  'architecture': 'System Architecture',
  'database-schema': 'Database Schema',
};

export default function PrdPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(dummyPrdContent);
  const [revisingSection, setRevisingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const activeRef = useRef('executive-summary');

  useEffect(() => {
    const sidebar = document.getElementById('prd-sidebar');
    if (!sidebar) return;

    applyActive(sidebar, activeRef.current);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const newActive = visible[0].target.id;
          if (newActive !== activeRef.current) {
            activeRef.current = newActive;
            applyActive(sidebar, newActive);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    activeRef.current = id;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleRevision = useCallback((sectionId: string) => {
    setRevisingSection(sectionId);
  }, []);

  const handleApproveRevision = useCallback((proposedContent: string) => {
    if (revisingSection) {
      setContent(prev => ({ ...prev, [revisingSection]: proposedContent }));
      setRevisingSection(null);
      setToast('Revisi disimpan. Snapshot baru dibuat.');
      setTimeout(() => setToast(null), 4000);
    }
  }, [revisingSection]);

  const bottomNav = [
    {
      label: 'Export PRD',
      icon: '📤',
      onClick: () => navigate('/project/dummy-1/export'),
    },
    {
      label: 'Version History',
      icon: '📋',
      onClick: () => navigate('/project/dummy-1/versions'),
    },
    {
      label: 'Share Link',
      icon: '🔗',
      onClick: () => navigate('/share/dummy-1'),
    },
  ];

  return (
    <Layout showBack continueLabel="TASK BREAKDOWN" onContinue={() => navigate('/project/dummy-1/tasks')}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 16,
        alignItems: 'start',
      }}>
        <PrdSidebar
          sections={sections}
          activeSection={activeRef.current}
          onSelect={scrollToSection}
          sidebarId="prd-sidebar"
          bottomNav={bottomNav}
        />

        <div>
          {sections.map(({ id, label }) => (
            <PrdSection
              key={id}
              id={id}
              title={label}
              content={content[id]}
              onSave={(c) => setContent(prev => ({ ...prev, [id]: c }))}
              onRevision={() => handleRevision(id)}
            />
          ))}
        </div>
      </div>

      {/* Revision modal */}
      {revisingSection && (
        <RevisionModal
          sectionTitle={sectionTitles[revisingSection]}
          currentContent={content[revisingSection]}
          onClose={() => setRevisingSection(null)}
          onApprove={handleApproveRevision}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--bg-panel)',
          border: '1px solid var(--success)',
          borderLeft: '3px solid var(--success)',
          borderRadius: 6,
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-primary)',
          zIndex: 60,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          maxWidth: 360,
        }}>
          ✓ {toast}
        </div>
      )}
    </Layout>
  );
}

function applyActive(sidebar: HTMLElement, activeId: string) {
  const items = sidebar.querySelectorAll<HTMLElement>('[data-section]');
  items.forEach(item => {
    const isActive = item.dataset.section === activeId;
    item.style.color = isActive ? 'var(--accent)' : 'var(--text-muted)';
    item.style.borderLeft = isActive ? '2px solid var(--accent)' : '2px solid transparent';
    item.style.background = isActive ? 'rgba(138,155,174,0.06)' : 'transparent';
  });
}
