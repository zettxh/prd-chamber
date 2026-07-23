import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrdSection from '../components/PrdSection';
import { dummyPrdContent } from '../data/dummy';

const sections: { id: string; label: string }[] = [
  { id: 'executive-summary',     label: 'Executive Summary' },
  { id: 'problem-statement',    label: 'Problem Statement' },
  { id: 'core-features',        label: 'Core Features' },
  { id: 'user-flow',            label: 'User Flow / Journey' },
  { id: 'functional-requirements', label: 'Functional Requirements' },
  { id: 'architecture',         label: 'System Architecture' },
  { id: 'database-schema',       label: 'Database Schema' },
];

export default function PrdPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [content, setContent] = useState(dummyPrdContent);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        // Trigger when section top is near viewport top
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout showBack continueLabel="TASK BREAKDOWN" onContinue={() => navigate('/project/dummy-1/tasks')}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* ── Sidebar — sticky TOC ── */}
        <div
          className="term-panel"
          style={{
            padding: '8px 0',
            position: 'sticky',
            top: 80,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
          }}
        >
          {sections.map(({ id, label }) => (
            <div
              key={id}
              onClick={() => scrollToSection(id)}
              title={label}
              style={{
                padding: '7px 14px',
                fontSize: 11,
                cursor: 'pointer',
                color: activeSection === id ? 'var(--accent)' : 'var(--text-muted)',
                borderLeft: activeSection === id ? '2px solid var(--accent)' : '2px solid transparent',
                background: activeSection === id ? 'rgba(138,155,174,0.06)' : 'transparent',
                transition: 'all 120ms',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== id) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== id) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* ── Content — all sections at once ── */}
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
