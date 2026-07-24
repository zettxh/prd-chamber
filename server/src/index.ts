import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { db } from './db/index.js'
import { sql } from 'drizzle-orm'
import { users } from './db/schema.js'
import { authMiddleware } from './middleware/auth.js'
import { loginHandler, logoutHandler, meHandler } from './auth/handlers.js'
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from './projects/handlers.js'
import { saveClarificationAnswers, getClarificationAnswers, generateClarifyQuestions } from './clarify/handlers.js'
import { getSettingsHandler, putSettingsHandler } from './settings/handlers.js'
import { generateStructure, getStructure } from './structure/handlers.js'

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

// Projects CRUD
app.get('/api/projects', authMiddleware, listProjects)
app.post('/api/projects', authMiddleware, createProject)
app.get('/api/projects/:id', authMiddleware, getProject)
app.patch('/api/projects/:id', authMiddleware, updateProject)
app.delete('/api/projects/:id', authMiddleware, deleteProject)

// Clarification
app.post('/api/projects/:id/clarify/generate', authMiddleware, generateClarifyQuestions)
app.post('/api/projects/:id/clarify', authMiddleware, saveClarificationAnswers)
app.get('/api/projects/:id/clarify', authMiddleware, getClarificationAnswers)

// Structure
app.post('/api/projects/:id/structure/generate', authMiddleware, generateStructure)
app.get('/api/projects/:id/structure', authMiddleware, getStructure)

// Settings
app.get('/api/settings', authMiddleware, getSettingsHandler)
app.put('/api/settings', authMiddleware, putSettingsHandler)

// ─── SERVER ─────────────────────────────────────────────────

const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
