import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { settings, auth } from '../utils/api'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini' },
  { value: 'anthropic', label: 'Anthropic', defaultModel: 'claude-sonnet-4-20250514' },
  { value: 'groq', label: 'Groq', defaultModel: 'llama-3.3-70b-versatile' },
  { value: 'openrouter', label: 'OpenRouter', defaultModel: 'anthropic/claude-sonnet-4' },
  { value: 'ollama', label: 'Ollama (local)', defaultModel: 'llama3.2' },
  { value: 'custom', label: 'Custom Provider', defaultModel: '' },
]

interface ActivityEntry {
  id: string
  action: string
  detail: string
  timestamp: string
}

interface ErrorEntry {
  id: string
  code: string
  message: string
  stack?: string
  timestamp: string
}
interface UsageStats {
  projectsCreated: number
  prdsGenerated: number
  tasksGenerated: number
  storageUsed: string
}

async function fetchApi<T>(path: string): Promise<T> {
  const token = localStorage.getItem('prd_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await fetch(`/api${path}`, { headers, credentials: 'include' })
  if (res.status === 401) {
    localStorage.removeItem('prd_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export default function SettingsPage() {
  const [provider, setProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Account state
  const [usageStats, setUsageStats] = useState<UsageStats>({
    projectsCreated: 0,
    prdsGenerated: 0,
    tasksGenerated: 0,
    storageUsed: '0 MB',
  })

  // Activity log state
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)

  // Error log state
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [loadingErrors, setLoadingErrors] = useState(true)

  useEffect(() => {
    // Load settings
    settings.get().then(data => {
      if (data) {
        setProvider(data.llmProvider || '')
        setApiKey(data.llmApiKey || '')
        setModel(data.llmModel || '')
        setCustomEndpoint(data.llmCustomEndpoint || '')
      }
    }).catch(() => {})

    // Load usage stats
    fetchApi<UsageStats>('/stats')
      .then(data => setUsageStats(data))
      .catch(() => {})

    // Load activity log
    loadActivities()

    // Load error log
    loadErrors()
  }, [])

  async function loadActivities() {
    setLoadingActivities(true)
    try {
      const data = await fetchApi<{ activities: ActivityEntry[] }>('/activity?limit=50')
      setActivities(data.activities.map(a => ({
        id: a.id,
        action: formatAction(a.action),
        detail: a.detail,
        timestamp: a.timestamp,
      })))
    } catch {
      setActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  function formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      'project_created': 'Project Created',
      'title_updated': 'Title Updated',
      'outline_generated': 'Outline Generated',
      'prd_generated': 'PRD Generated',
      'tasks_generated': 'Tasks Generated',
      'section_revised': 'Section Revised',
      'project_archived': 'Project Archived',
    }
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  async function loadErrors() {
    setLoadingErrors(true)
    try {
      const data = await fetchApi<{ errors: ErrorEntry[] }>('/errors?limit=50')
      setErrors(data.errors.map(e => ({
        id: e.id,
        code: e.code,
        message: e.message,
        stack: e.stack,
        timestamp: e.timestamp,
      })))
    } catch {
      setErrors([])
    } finally {
      setLoadingErrors(false)
    }
  }

  const handleProviderChange = (v: string) => {
    setProvider(v)
    const found = PROVIDERS.find(p => p.value === v)
    if (found && found.defaultModel) {
      setModel(found.defaultModel)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      await settings.save({
        llmProvider: provider,
        llmApiKey: apiKey,
        llmModel: model,
        llmCustomEndpoint: provider === 'custom' ? customEndpoint : undefined,
      })
      setSaveMsg('✓ Settings saved')
    } catch {
      setSaveMsg('✗ Failed to save')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 4000)
    }
  }

  const handleLogout = async () => {
    await auth.logout()
    window.location.href = '/login'
  }

  const formatTimestamp = (ts: string | number | null | undefined) => {
    if (!ts) return '-'
    const date = new Date(ts)
    if (isNaN(date.getTime())) return ts?.toString() || '-'
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout showBack>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 18 }}>
        Settings
      </h1>

      {/* ── BYOK CONFIGURATION ── */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>BYOK CONFIGURATION
        </h2>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <select
            value={provider}
            onChange={e => handleProviderChange(e.target.value)}
            className="term-input"
            required
          >
            <option value="">— Select Provider —</option>
            {PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            type="password"
            className="term-input"
            placeholder="sk-... (API Key)"
            required
          />
          <input
            value={model}
            onChange={e => setModel(e.target.value)}
            className="term-input"
            placeholder="Model (e.g. gpt-4o-mini)"
            required
          />
          {provider === 'custom' && (
            <input
              value={customEndpoint}
              onChange={e => setCustomEndpoint(e.target.value)}
              type="url"
              className="term-input"
              placeholder="https://your-custom-endpoint.com/v1"
              required
            />
          )}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="term-btn-accent" disabled={saving}>
              {saving ? 'SAVING...' : '{>}'} SAVE SETTINGS
            </button>
            {saveMsg && (
              <span style={{ fontSize: 10, color: saveMsg.startsWith('✓') ? 'var(--success)' : 'var(--error)' }}>
                {saveMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* ── ACCOUNT ── */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>ACCOUNT
        </h2>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>USER</div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
            {auth.getUser()?.name || 'Unknown'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {auth.getUser()?.email}
          </div>
        </div>

        {/* Usage Stats */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>USAGE THIS MONTH</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <div className="term-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{usageStats.projectsCreated}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projects</div>
            </div>
            <div className="term-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{usageStats.prdsGenerated}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PRDs</div>
            </div>
            <div className="term-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning, #fbbf24)', fontFamily: 'var(--font-mono)' }}>{usageStats.tasksGenerated}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks</div>
            </div>
            <div className="term-panel" style={{ padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{usageStats.storageUsed}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Storage</div>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="term-btn" style={{ fontSize: 10 }}>
          {'<'} LOGOUT
        </button>
      </div>

      {/* ── ACTIVITY LOG ── */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
            <span style={{ color: 'var(--accent)' }}>▸ </span>ACTIVITY LOG
          </h2>
          <button
            onClick={loadActivities}
            className="term-btn"
            style={{ fontSize: 9, padding: '2px 8px' }}
          >
            ↻ Refresh
          </button>
        </div>
        {loadingActivities ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Loading...</div>
        ) : activities.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>No recent activity</div>
        ) : (
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {activities.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  padding: '8px 0',
                  borderBottom: idx < activities.length - 1 ? '1px solid rgba(58,58,54,0.3)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{entry.action}</span>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{entry.detail}</div>
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ERROR LOG ── */}
      <div className="term-panel" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
            <span style={{ color: 'var(--error)' }}>▸ </span>ERROR LOG
          </h2>
          <button
            onClick={loadErrors}
            className="term-btn"
            style={{ fontSize: 9, padding: '2px 8px' }}
          >
            ↻ Refresh
          </button>
        </div>
        {loadingErrors ? (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Loading...</div>
        ) : errors.length === 0 ? (
          <div style={{ fontSize: 10, color: 'var(--success)' }}>✓ No errors recorded</div>
        ) : (
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {errors.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  padding: '8px 0',
                  borderBottom: idx < errors.length - 1 ? '1px solid rgba(224,112,112,0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--error)' }}>
                    [{entry.code}]
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: entry.stack ? 4 : 0 }}>
                  {entry.message}
                </div>
                {entry.stack && (
                  <details>
                    <summary style={{ fontSize: 9, color: 'var(--text-muted)', cursor: 'pointer' }}>Stack trace</summary>
                    <pre style={{
                      fontSize: 9,
                      color: 'var(--text-muted)',
                      background: 'rgba(0,0,0,0.2)',
                      padding: 8,
                      borderRadius: 4,
                      overflow: 'auto',
                      marginTop: 4,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {entry.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}