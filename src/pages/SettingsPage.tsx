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

export default function SettingsPage() {
  const [provider, setProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    settings.get().then(data => {
      if (data) {
        setProvider(data.llmProvider || '')
        setApiKey(data.llmApiKey || '')
        setModel(data.llmModel || '')
      }
    })
  }, [])

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

  return (
    <Layout showBack>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 18 }}>
        Settings
      </h1>

      {/* BYOK */}
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

      {/* Account */}
      <div className="term-panel" style={{ padding: '18px 22px', marginBottom: 14 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>ACCOUNT
        </h2>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
          {auth.getUser()?.email && (
            <div style={{ marginBottom: 4 }}>Logged in as <span style={{ color: 'var(--text-primary)' }}>{auth.getUser()?.email}</span></div>
          )}
        </div>
        <button onClick={handleLogout} className="term-btn" style={{ fontSize: 10 }}>
          {'<'} LOGOUT
        </button>
      </div>

      {/* Error Log */}
      <div className="term-panel" style={{ padding: '18px 22px' }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
          <span style={{ color: 'var(--accent)' }}>▸ </span>ERROR LOG
        </h2>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(58,58,54,0.5)' }}>
            [2026-07-24] No errors
          </div>
        </div>
      </div>
    </Layout>
  )
}
