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
  { id: 'user-flow',               label: 'User Flow / Journey' },
  { id: 'functional-requirements',  label: 'Functional Requirements' },
  { id: 'architecture',            label: 'System Architecture' },
  { id: 'database-schema',         label: 'Database Schema' },
];

export default function PrdPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [content, setContent] = useState(dummyPrdContent);
  const rafRef = useRef<number | null>(null);

  // Scroll spy — throttled via rAF to prevent cascade re-renders
  useEffect(() => {
    const updateActive = () => {
      const entries = Array.from(
        document.querySelectorAll<HTMLElement>('section[id]')
      )
        .map(el => ({
          id: el.id,
          rect: el.getBoundingClientRect(),
        }))
        .filter(({ rect }) => rect.top < window.innerHeight * 0.4 && rect.bottom > 0)
        .sort((a, b) => a.rect.top - b.rect.top);

      if (entries.length > 0) {
        setActiveSection(entries[0].id);
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        updateActive();
        rafRef.current = null;
      });
    };

    // Init active on mount
    updateActive();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
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
        {/* Sidebar — isolated, only re-renders on activeSection change */}
        <PrdSidebar
          sections={sections}
          activeSection={activeSection}
          onSelect={scrollToSection}
        />

        {/* Content — PrdSection is memo'd, only re-renders when its own props change */}
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
