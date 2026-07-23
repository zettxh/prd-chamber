import { useState } from 'react';
import Layout from '../components/Layout';
import { dummyTasks } from '../data/dummy';

interface Task {
  id: string;
  phase: string;
  feature: string;
  task: string;
  description: string;
  effort: 'S' | 'M' | 'L';
  is_done: boolean;
}

// Group tasks by phase
function groupByPhase(tasks: Task[]) {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!map.has(task.phase)) map.set(task.phase, []);
    map.get(task.phase)!.push(task);
  }
  return map;
}

// Get unique features per phase
function getFeaturesByPhase(tasks: Task[]) {
  const phaseMap = groupByPhase(tasks);
  const result: { phase: string; features: { name: string; tasks: Task[]; done: number; total: number }[] }[] = [];

  phaseMap.forEach((taskList, phase) => {
    const featureMap = new Map<string, Task[]>();
    taskList.forEach(t => {
      if (!featureMap.has(t.feature)) featureMap.set(t.feature, []);
      featureMap.get(t.feature)!.push(t);
    });

    const features = Array.from(featureMap.entries()).map(([name, ft]) => ({
      name,
      tasks: ft,
      done: ft.filter(t => t.is_done).length,
      total: ft.length,
    }));

    result.push({ phase, features });
  });

  return result;
}

// Generate checkpoint prompt
function generatePrompt(featureName: string, tasks: Task[]): string {
  const undone = tasks.filter(t => !t.is_done);
  const done = tasks.filter(t => t.is_done);

  let prompt = `## Task: Implement ${featureName}\n\n`;
  prompt += `**Project:** Aplikasi POS Kopi\n`;
  prompt += `**Feature:** ${featureName}\n\n`;

  if (undone.length > 0) {
    prompt += `**Remaining Tasks (${undone.length}):**\n`;
    undone.forEach((t, i) => {
      prompt += `${i + 1}. ${t.task} [Effort: ${t.effort}]\n`;
    });
  }

  if (done.length > 0) {
    prompt += `\n**Completed Tasks:**\n`;
    done.forEach(t => {
      prompt += `- ${t.task} ✓\n`;
    });
  }

  prompt += `\n**Instructions:**\n`;
  prompt += `- Follow existing code patterns\n`;
  prompt += `- Write unit tests for core functionality\n`;
  prompt += `- Start with the first remaining task\n`;

  return prompt;
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const phases = getFeaturesByPhase(tasks);

  const allTasksForSelectedFeature = selectedFeature
    ? tasks.filter(t => t.feature === selectedFeature)
    : [];

  const handleGenerate = () => {
    if (!selectedFeature) return;
    const featureTasks = tasks.filter(t => t.feature === selectedFeature);
    const prompt = generatePrompt(selectedFeature, featureTasks);
    setGeneratedPrompt(prompt);
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedPrompt).then(() => {
        setToast('Prompt copied!');
        setTimeout(() => setToast(null), 3000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = generatedPrompt;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setToast('Prompt copied!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleMarkDone = () => {
    if (!selectedFeature) return;
    setTasks(prev => prev.map(t =>
      t.feature === selectedFeature ? { ...t, is_done: true } : t
    ));
    setToast('Feature marked as done!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectFeature = (featureName: string) => {
    setSelectedFeature(featureName);
    setGeneratedPrompt(null);
  };

  return (
    <Layout showBack showStepper={false}>
      <h1 style={{
        fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)',
        marginBottom: 16,
      }}>
        Tasks &amp; Checkpoints
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT: Task list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {phases.map(({ phase, features }) => (
            <div key={phase} className="term-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '8px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-panel)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {phase}
                </span>
              </div>

              {features.map(({ name, tasks: ft, done, total }) => (
                <div key={name}>
                  {/* Feature row */}
                  <div
                    onClick={() => handleSelectFeature(name)}
                    style={{
                      padding: '9px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(58,58,54,0.3)',
                      background: selectedFeature === name ? 'rgba(138,155,174,0.06)' : 'transparent',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={e => { if (selectedFeature !== name) e.currentTarget.style.background = 'rgba(200,200,190,0.03)'; }}
                    onMouseLeave={e => { if (selectedFeature !== name) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Feature status dot */}
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: done === total ? 'var(--success)' : done > 0 ? 'var(--accent)' : 'var(--text-muted)',
                    }} />

                    <span style={{
                      flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: selectedFeature === name ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}>
                      {name}
                    </span>

                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)',
                    }}>
                      {done}/{total}
                    </span>

                    <span style={{
                      fontSize: 10, color: done === total ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      {done === total ? '✓' : '→'}
                    </span>
                  </div>

                  {/* Sub-task rows */}
                  {ft.map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '7px 14px 7px 28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderBottom: '1px solid rgba(58,58,54,0.15)',
                      }}
                    >
                      <span
                        onClick={() => setTasks(prev => prev.map(t =>
                          t.id === task.id ? { ...t, is_done: !t.is_done } : t
                        ))}
                        style={{
                          width: 14, height: 14, display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          border: '1px solid ' + (task.is_done ? 'var(--success)' : 'var(--border)'),
                          color: task.is_done ? 'var(--success)' : 'transparent',
                          fontSize: 10, flexShrink: 0, cursor: 'pointer',
                        }}
                      >
                        {task.is_done ? '✓' : ''}
                      </span>
                      <span style={{
                        flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: task.is_done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: task.is_done ? 'line-through' : 'none',
                      }}>
                        {task.task}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        color: task.effort === 'S' ? 'var(--success)' : task.effort === 'M' ? 'var(--accent)' : 'var(--error)',
                      }}>
                        {task.effort}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── RIGHT: Checkpoint panel ── */}
        <div className="term-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {selectedFeature ? (
            <>
              {/* Feature header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-panel)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {selectedFeature}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: allTasksForSelectedFeature.filter(t => t.is_done).length === allTasksForSelectedFeature.length ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {allTasksForSelectedFeature.filter(t => t.is_done).length}/{allTasksForSelectedFeature.length} tasks completed
                </div>
              </div>

              <div style={{ padding: 14 }}>
                {/* Generate button */}
                <button
                  className="term-btn-accent"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 14, fontSize: 10 }}
                  onClick={handleGenerate}
                >
                  📋 GENERATE CHECKPOINT PROMPT
                </button>

                {/* Prompt textarea */}
                {generatedPrompt ? (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        color: 'var(--text-muted)', textTransform: 'uppercase',
                        letterSpacing: '0.04em', marginBottom: 6,
                      }}>
                        AI PROMPT — copy to Cursor / Claude Code
                      </div>
                      <textarea
                        readOnly
                        value={generatedPrompt}
                        className="term-textarea"
                        style={{ minHeight: 240, fontSize: 11, resize: 'vertical', marginBottom: 10 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleCopy} className="term-btn" style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}>
                          📋 Copy
                        </button>
                        <button onClick={handleMarkDone} className="term-btn-accent" style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}>
                          ✓ Mark All Done
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    border: '1px dashed var(--border)',
                    borderRadius: 6,
                  }}>
                    Select a feature and click<br />"Generate Checkpoint Prompt"
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}>
              ← Select a feature<br />from the left panel
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: 'var(--bg-panel)',
          border: '1px solid var(--success)',
          borderLeft: '3px solid var(--success)',
          borderRadius: 6,
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)', fontSize: 11,
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
