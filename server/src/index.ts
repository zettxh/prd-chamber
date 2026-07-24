import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db } from './db/index.js'
import { sql } from 'drizzle-orm'
import { users } from './db/schema.js'
import { authMiddleware } from './middleware/auth.js'
import { loginHandler, logoutHandler, meHandler } from './auth/handlers.js'

const app = new Hono()

app.use('*', cors())

// ─── PUBLIC ROUTES ───────────────────────────────────────────

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/db-test', async (c) => {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users)
    return c.json({ count: result[0]?.count ?? 0 })
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

// Auth
app.post('/api/auth/login', loginHandler)
app.post('/api/auth/logout', logoutHandler)

// ─── PROTECTED ROUTES ────────────────────────────────────────

app.get('/api/auth/me', authMiddleware, meHandler)

// Example protected route (replace with real CRUD in Step 3)
app.get('/api/me', authMiddleware, (c) => {
  const userId = c.get('userId')
  return c.json({ userId, message: 'You are authenticated' })
})

// ─── SERVER ─────────────────────────────────────────────────

const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
