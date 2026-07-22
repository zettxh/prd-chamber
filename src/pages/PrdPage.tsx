import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PrdSection from '../components/PrdSection';
import { dummyPrdContent } from '../data/dummy';

const sectionLabels: Record<string, string> = {
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
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [content, setContent] = useState(dummyPrdContent);

  return (
    <Layout showBack continueLabel="TASK BREAKDOWN" onContinue={() => navigate('/project/dummy-1/tasks')}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, minHeight: 420 }}>
        {/* Sidebar */}
        <div className="term-panel" style={{ padding: '8px 0' }}>
          {Object.keys(sectionLabels).map(key => (
            <div
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                padding: '7px 14px', fontSize: 11, cursor: 'pointer',
                color: activeSection === key ? 'var(--accent)' : 'var(--text-muted)',
                borderLeft: activeSection === key ? '2px solid var(--accent)' : '2px solid transparent',
                background: activeSection === key ? 'rgba(138,155,174,0.06)' : 'transparent',
                transition: 'all 120ms',
              }}
            >
              {sectionLabels[key]}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          <PrdSection
            title={sectionLabels[activeSection]}
            content={content[activeSection]}
            onSave={(c) => setContent(prev => ({ ...prev, [activeSection]: c }))}
          />
        </div>
      </div>
    </Layout>
  );
}
