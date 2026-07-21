import { useState } from 'react';
import Layout from '../components/Layout';
import { dummyTasks } from '../data/dummy';

export default function TaskPage() {
  const [tasks, setTasks] = useState(dummyTasks);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: !t.is_done } : t));
  };

  return (
    <Layout showBack>
      <h1 className="font-heading text-[28px] font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Task Breakdown
      </h1>

      <div className="space-y-4">
        {['Fase 1: Foundation', 'Fase 2: Input', 'Fase 3: Generate'].map(phase => {
          const phaseTasks = tasks.filter(t => t.phase === phase);
          if (!phaseTasks.length) return null;
          return (
            <div key={phase}>
              <h2 className="font-heading text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{phase}</h2>
              {phaseTasks.map(task => (
                <label
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-md mb-1 cursor-pointer"
                  style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }}
                >
                  <input
                    type="checkbox"
                    checked={task.is_done}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium" style={{
                      color: task.is_done ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: task.is_done ? 'line-through' : 'none'
                    }}>
                      {task.task}
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{task.feature} — {task.description}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase"
                    style={{
                      background: task.effort === 'S' ? 'var(--success)' : task.effort === 'M' ? 'var(--warning)' : 'var(--error)',
                      color: '#fff',
                      fontSize: 10,
                    }}
                  >
                    {task.effort}
                  </span>
                </label>
              ))}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
