import { useState } from 'react';
import Layout from '../components/Layout';

interface Feature {
  id: string;
  name: string;
  description: string;
  subFeatures: string[];
}

interface Phase {
  id: string;
  name: string;
  features: Feature[];
}

const DUMMY_STRUCTURE: Phase[] = [
  {
    id: 'phase-1',
    name: 'Foundation',
    features: [
      {
        id: 'feat-auth',
        name: 'Autentikasi',
        description: 'Login/logout dengan JWT',
        subFeatures: ['Halaman login', 'JWT token', 'Protected routes'],
      },
      {
        id: 'feat-dashboard',
        name: 'Dashboard',
        description: 'List project + buat baru',
        subFeatures: ['Card project', 'Empty state', 'Buat proyek'],
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'Input & Klarifikasi',
    features: [
      {
        id: 'feat-input',
        name: 'Input Ide Kasar',
        description: 'Textarea + dropdown bahasa',
        subFeatures: ['Textarea', 'Language selector', 'Validasi minimal kata'],
      },
      {
        id: 'feat-clarify',
        name: 'Klarifikasi',
        description: '5 pertanyaan dinamis',
        subFeatures: ['Text input Q1', 'Chip Q2-Q5', 'Skip logic', 'Counter progress'],
      },
    ],
  },
  {
    id: 'phase-3',
    name: 'Generasi & Struktur',
    features: [
      {
        id: 'feat-mindmap',
        name: 'Mind Map',
        description: 'Visual struktur fitur',
        subFeatures: ['Mermaid flowchart', 'Node click → panel', 'Modal detail'],
      },
      {
        id: 'feat-generate',
        name: 'Generate PRD',
        description: '7 section PRD dengan streaming',
        subFeatures: ['SSE streaming', 'Markdown renderer', 'Progress checklist'],
      },
    ],
  },
];

function generatePrompt(phase: Phase, feature: Feature): string {
  return `## Task: Implement ${feature.name}

**Project:** Aplikasi POS Kopi
**Phase:** ${phase.name}
**Feature:** ${feature.name}
**Description:** ${feature.description}

**Sub-tasks:**
${feature.subFeatures.map((sf, i) => `${i + 1}. ${sf}`).join('\n')}

**Requirements:**
- Follow existing code patterns
- Write unit tests for core functionality
- Update documentation if needed

**Context from PRD:**
The ${feature.name} feature is part of Phase "${phase.name}". This phase handles the core infrastructure and user-facing functionality for the application.

**Start by:** Setting up the feature structure and core implementation.
Then proceed with sub-features in order of priority.`;
}

export default function CheckpointPage() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const handleGeneratePrompt = (featureId: string, phase: Phase, feature: Feature) => {
    const prompt = generatePrompt(phase, feature);
    setGeneratedPrompts(prev => ({ ...prev, [featureId]: prompt }));
    setExpandedFeature(featureId);
  };

  const handleCopyPrompt = (featureId: string) => {
    const prompt = generatedPrompts[featureId];
    if (prompt) {
      navigator.clipboard.writeText(prompt).then(() => {
        setToast('Prompt copied to clipboard!');
        setTimeout(() => setToast(null), 3000);
      });
    }
  };

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
        Checkpoint Generator
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        marginBottom: 24,
      }}>
        Generate AI execution prompts per feature — paste to Cursor, Claude Code, or any AI coding assistant.
      </p>

      {/* Phase list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {DUMMY_STRUCTURE.map(phase => (
          <div key={phase.id} className="term-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Phase header */}
            <div style={{
              padding: '10px 18px',
              background: 'var(--bg-panel)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {phase.name}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--text-muted)',
              }}>
                {phase.features.length} features
              </span>
            </div>

            {/* Features */}
            <div>
              {phase.features.map(feature => (
                <div key={feature.id}>
                  {/* Feature row */}
                  <div
                    style={{
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(58,58,54,0.3)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text-primary)',
                        marginBottom: 2,
                      }}>
                        ● {feature.name}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--text-muted)',
                      }}>
                        {feature.description}
                      </div>
                    </div>
                    <button
                      className="term-btn"
                      style={{ fontSize: 9, padding: '3px 10px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGeneratePrompt(feature.id, phase, feature);
                      }}
                    >
                      📋 Generate
                    </button>
                  </div>

                  {/* Expanded — prompt */}
                  {expandedFeature === feature.id && generatedPrompts[feature.id] && (
                    <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--accent)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          AI Prompt
                        </span>
                        <button
                          className="term-btn-accent"
                          style={{ fontSize: 9, padding: '3px 10px' }}
                          onClick={() => handleCopyPrompt(feature.id)}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={generatedPrompts[feature.id]}
                        className="term-textarea"
                        style={{
                          minHeight: 200,
                          fontSize: 11,
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
        }}>
          ✓ {toast}
        </div>
      )}
    </Layout>
  );
}
