import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrdSection from '../components/PrdSection';
import PrdSidebar from '../components/PrdSidebar';
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

export default function PrdPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(dummyPrdContent);
  const activeRef = useRef('executive-summary');

  // ── Scroll spy: IntersectionObserver → DIRECT DOM class, NO React re-render ──
  useEffect(() => {
    const sidebar = document.getElementById('prd-sidebar');
    if (!sidebar) return;

    const items = sidebar.querySelectorAll<HTMLElement>('[data-section]');
    if (!items.length) return;

    // Set initial active
    applyActive(sidebar, activeRef.current);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
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
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
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

  return (
    <Layout showBack continueLabel="TASK BREAKDOWN" onContinue={() => navigate('/project/dummy-1/tasks')}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* Sidebar — receives activeSection from ref for render stability */}
        <PrdSidebar
          sections={sections}
          activeSection={activeRef.current}
          onSelect={scrollToSection}
          sidebarId="prd-sidebar"
        />

        {/* Content — memo'd, never re-renders from scroll */}
        <div>
          {sections.map(({ id, label }) => (
            <PrdSection
              key={id}
              id={id}
              title={label}
              content={content[id]}
              onSave={(c) => setContent(prev => ({ ...prev, [id]: c }))}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

// Pure DOM function — no React state involved
function applyActive(sidebar: HTMLElement, activeId: string) {
  const items = sidebar.querySelectorAll<HTMLElement>('[data-section]');
  items.forEach(item => {
    const isActive = item.dataset.section === activeId;
    item.style.color = isActive ? 'var(--accent)' : 'var(--text-muted)';
    item.style.borderLeft = isActive ? '2px solid var(--accent)' : '2px solid transparent';
    item.style.background = isActive ? 'rgba(138,155,174,0.06)' : 'transparent';
  });
}
