import { useState } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import PrdSection from '../components/PrdSection';
import AssistantPanel from '../components/AssistantPanel';
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
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [content, setContent] = useState(dummyPrdContent);

  return (
    <Layout showBack>
      <div className="flex gap-6">
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        <div className="flex-1 min-w-0">
          <PrdSection
            title={sectionLabels[activeSection]}
            content={content[activeSection]}
            onSave={(c) => setContent(prev => ({ ...prev, [activeSection]: c }))}
          />
        </div>
        <div className="w-48 shrink-0">
          <AssistantPanel />
        </div>
      </div>
    </Layout>
  );
}
