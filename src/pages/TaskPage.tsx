import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { tasks, type Task } from '../utils/api';

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

// Generate comprehensive AI execution prompt for selected feature
function generatePrompt(
  projectName: string,
  industry: string,
  featureName: string,
  phaseName: string,
  taskList: Task[],
  prdContext: string
): string {
  const undone = taskList.filter(t => !t.is_done);
  const done = taskList.filter(t => t.is_done);

  let prompt = `═══════════════════════════════════════════════\n`;
  prompt += `PROJECT CONTEXT\n`;
  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `Project: ${projectName}\n`;
  prompt += `Industry: ${industry}\n`;
  prompt += `Current Feature: ${featureName}\n`;
  prompt += `Phase: ${phaseName}\n\n`;

  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `FEATURE DESCRIPTION\n`;
  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `${featureName}\n\n`;

  if (prdContext) {
    prompt += `═══════════════════════════════════════════════\n`;
    prompt += `PRD CONTEXT (for this feature)\n`;
    prompt += `═══════════════════════════════════════════════\n`;
    prompt += `${prdContext}\n\n`;
  }

  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `TASKS TO EXECUTE\n`;
  prompt += `═══════════════════════════════════════════════\n`;

  if (undone.length > 0) {
    prompt += `## Remaining Tasks (${undone.length})\n\n`;
    undone.forEach((t, i) => {
      prompt += `### Task ${i + 1}: ${t.task}\n`;
      prompt += `- Effort Level: ${t.effort}\n`;
      prompt += `- Description: ${t.description || 'See main task description above'}\n`;
      prompt += `\n`;
    });
  }

  if (done.length > 0) {
    prompt += `## Completed Tasks (${done.length})\n\n`;
    done.forEach(t => {
      prompt += `✓ ${t.task}\n`;
    });
    prompt += `\n`;
  }

  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `EXECUTION WORKFLOW\n`;
  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `\n`;
  prompt += `## Phase 1: Analysis (Before Coding)\n`;
  prompt += `1. Read through ALL remaining tasks\n`;
  prompt += `2. Identify dependencies between tasks\n`;
  prompt += `3. Identify which tasks depend on each other\n`;
  prompt += `4. Create implementation order based on dependencies\n`;
  prompt += `\n`;
  prompt += `## Phase 2: Development\n`;
  prompt += `5. Start with tasks that have NO dependencies\n`;
  prompt += `6. For each task:\n`;
  prompt += `   a. Understand the requirement fully\n`;
  prompt += `   b. Identify required files to modify/create\n`;
  prompt += `   c. Write the implementation\n`;
  prompt += `   d. Write unit tests\n`;
  prompt += `   e. Verify implementation against task requirement\n`;
  prompt += `   f. Mark task as complete\n`;
  prompt += `7. Move to next task in dependency order\n`;
  prompt += `\n`;
  prompt += `## Phase 3: Integration\n`;
  prompt += `8. Verify all tasks are completed\n`;
  prompt += `9. Check integration between implemented features\n`;
  prompt += `10. Run full test suite\n`;
  prompt += `11. Fix any integration issues\n`;
  prompt += `\n`;
  prompt += `## Phase 4: Review\n`;
  prompt += `12. Code review: check for code quality, security, performance\n`;
  prompt += `13. Ensure all task requirements are met\n`;
  prompt += `14. Update documentation if needed\n`;
  prompt += `\n`;

  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `TECHNICAL REQUIREMENTS\n`;
  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `- Follow existing code patterns and conventions\n`;
  prompt += `- Use TypeScript for type safety\n`;
  prompt += `- Write unit tests using appropriate testing framework\n`;
  prompt += `- Ensure code is production-ready (no TODOs in final code)\n`;
  prompt += `- Handle errors gracefully\n`;
  prompt += `- Add proper logging where needed\n`;
  prompt += `- Follow security best practices\n`;
  prompt += `\n`;

  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `DELIVERABLE FORMAT\n`;
  prompt += `═══════════════════════════════════════════════\n`;
  prompt += `Provide your response in this format:\n\n`;
  prompt += `## Files Modified/Created\n`;
  prompt += `[List of files with brief description]\n\n`;
  prompt += `## Implementation Details\n`;
  prompt += `[Detailed explanation of changes]\n\n`;
  prompt += `## Code\n`;
  prompt += `\`\`\`[language]\n`;
  prompt += `[Full code for each file]\n`;
  prompt += `\`\`\`\n\n`;
  prompt += `## Tests\n`;
  prompt += `\`\`\`[language]\n`;
  prompt += `[Test code]\n`;
  prompt += `\`\`\`\n\n`;
  prompt += `## Task Checklist\n`;
  prompt += `- [ ] Task 1\n`;
  prompt += `- [ ] Task 2\n`;
  prompt += `[Mark completed tasks with x]\n`;

  return prompt;
}

export default function TaskPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = id!;

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    if (!projectId) return;
    loadTasks();
  }, [projectId]);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tasks.get(projectId);
      if (res.tasks) {
        setAllTasks(res.tasks.tasks);
      } else {
        setAllTasks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await tasks.generate(projectId);
      setAllTasks(res.tasks.tasks);
      showToast('Tasks generated!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleToggleDone(taskId: string) {
    const updated = allTasks.map(t =>
      t.id === taskId ? { ...t, is_done: !t.is_done } : t
    );
    setAllTasks(updated);

    // Persist to API (fire and forget — don't block UI)
    tasks.save(projectId, updated).catch(() => {});
  }

  async function handleMarkAllDone() {
    if (!selectedFeature) return;
    const updated = allTasks.map(t =>
      t.feature === selectedFeature ? { ...t, is_done: true } : t
    );
    setAllTasks(updated);
    setToast('Feature marked as done!');
    setTimeout(() => setToast(null), 3000);

    // Persist to API
    tasks.save(projectId, updated).catch(() => {});
  }

  const handleGeneratePrompt = useCallback(() => {
    if (!selectedFeature) return;
    const featureTasks = allTasks.filter(t => t.feature === selectedFeature);
    // TODO: Fetch projectName, industry, prdContext from API or props
    const prompt = generatePrompt(
      'Project',  // projectName - TODO: fetch from project
      'General',  // industry - TODO: fetch from project
      selectedFeature,
      'Phase',    // phaseName - TODO: pass actual phase
      featureTasks,
      ''          // prdContext - TODO: extract relevant PRD section
    );
    setGeneratedPrompt(prompt);
  }, [selectedFeature, allTasks]);

  const handleCopy = useCallback(() => {
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
  }, [generatedPrompt]);

  const handleSelectFeature = (featureName: string) => {
    setSelectedFeature(featureName);
    setGeneratedPrompt(null);
  };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const phases = getFeaturesByPhase(allTasks);
  const allTasksForSelectedFeature = selectedFeature
    ? allTasks.filter(t => t.feature === selectedFeature)
    : [];

  const renderTaskList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {phases.length === 0 && !isLoading && (
        <div style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          border: '1px dashed var(--border)',
          borderRadius: 6,
        }}>
          {isGenerating
            ? 'Generating tasks...'
            : 'No tasks yet. Click "GENERATE TASKS" to start.'}
        </div>
      )}

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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
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
                    onClick={() => handleToggleDone(task.id)}
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
  );

  return (
    <Layout showBack>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{
          fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)',
        }}>
          Tasks &amp; Checkpoints
        </h1>

        <button
          className="term-btn-accent"
          onClick={handleGenerate}
          disabled={isGenerating || isLoading}
          style={{
            fontSize: 10,
            opacity: (isGenerating || isLoading) ? 0.6 : 1,
            cursor: (isGenerating || isLoading) ? 'not-allowed' : 'pointer',
          }}
        >
          {isGenerating ? '⟳ Generating...' : '⚡ Generate Tasks'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-accent)',
          border: '1px solid var(--accent-dim)',
          borderRadius: 6,
          marginBottom: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--error)',
        }}>
          Error: {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => (
            <div key={i} className="term-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: 36, background: 'var(--bg-panel)',
                borderBottom: '1px solid var(--border)',
              }} />
              {[1, 2, 3].map(j => (
                <div key={j} style={{
                  height: 32,
                  background: 'rgba(200,200,190,0.03)',
                  borderBottom: '1px solid rgba(58,58,54,0.1)',
                }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty state — no tasks yet */}
      {!isLoading && allTasks.length === 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          border: '1px dashed var(--border)',
          borderRadius: 6,
          marginBottom: 16,
        }}>
          No tasks generated yet.<br />
          Click <strong style={{ color: 'var(--accent)' }}>Generate Tasks</strong> to create a task breakdown from your structure.
        </div>
      )}

      {/* Task list + checkpoint panel */}
      {(isLoading || allTasks.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {/* LEFT: Task list */}
          {renderTaskList()}

          {/* RIGHT: Checkpoint panel */}
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
                    color: allTasksForSelectedFeature.every(t => t.is_done) ? 'var(--success)' : 'var(--text-muted)',
                  }}>
                    {allTasksForSelectedFeature.filter(t => t.is_done).length}/{allTasksForSelectedFeature.length} tasks completed
                  </div>
                </div>

                <div style={{ padding: 14 }}>
                  {/* Generate button */}
                  <button
                    className="term-btn-accent"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 14, fontSize: 10 }}
                    onClick={handleGeneratePrompt}
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
                          <button onClick={handleMarkAllDone} className="term-btn-accent" style={{ flex: 1, justifyContent: 'center', fontSize: 10 }}>
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
      )}

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
