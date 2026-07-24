import { auth } from '../utils/api'

export default function LoginPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      await auth.login(email, password)
      window.location.href = '/'
    } catch (err) {
      alert(String(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center term-screen" style={{ position: 'relative', zIndex: 1 }}>
      <div className="status-bar" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
        <div className="flex items-center gap-2">
          <span>PRD-CHAMBER</span>
          <span style={{ color: 'var(--text-muted)' }}>///</span>
          <span>AUTH GATEWAY</span>
        </div>
        <span>SYSTEM:001</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="term-panel flex flex-col gap-5"
        style={{ padding: '32px 36px', maxWidth: 380, width: '100%' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span style={{ fontSize: 20, color: 'var(--accent)' }}>◈</span>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            PRD Chamber
          </h1>
        </div>

        <div className="term-divider" />

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Email
          </span>
          <input
            name="email"
            type="email"
            className="term-input"
            placeholder="zain@prdchamber.local"
            required
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Password
          </span>
          <input
            name="password"
            type="password"
            className="term-input"
            placeholder="••••••••"
            required
          />
        </label>

        <button type="submit" className="term-btn-accent" style={{ justifyContent: 'center', padding: '10px 0', fontSize: 12 }}>
          {'>'} AUTHENTICATE
        </button>
      </form>

      <div className="status-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <span>STATUS: AWAITING CREDENTIALS</span>
        <span>TERMINAL v1.0</span>
      </div>
    </div>
  )
}
