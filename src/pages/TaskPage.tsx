import { useState } from 'react';
import Layout from '../components/Layout';
import { dummyTasks } from '../data/dummy';

export default function TaskPage() {
  const [tasks, setTasks] = useState(dummyTasks);

  return (
    <Layout showBack showStepper={false}>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 16 }}>
        Task Breakdown
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tasks.map(task => (
          <div
            key={task.id}
            className="term-panel"
            style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, cursor: 'pointer' }}
            onClick={() => {
              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t));
            }}
          >
            <span style={{
              width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid ' + (task.is_done ? 'var(--success)' : 'var(--border)'),
              color: task.is_done ? 'var(--success)' : 'transparent',
              fontSize: 10, flexShrink: 0,
            }}>
              {task.is_done ? '✓' : ''}
            </span>
            <span style={{ color: task.is_done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.is_done ? 'line-through' : 'none', flex: 1 }}>
              {task.task}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 9, minWidth: 60, textAlign: 'right' }}>{task.phase}</span>
            <span className="term-badge" style={{
              color: task.effort === 'S' ? 'var(--success)' : task.effort === 'M' ? 'var(--accent)' : 'var(--error)',
              borderColor: 'var(--border)',
            }}>
              {task.effort}
            </span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
