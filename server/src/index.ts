import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { sql } from 'drizzle-orm'
import { users } from './db/schema.js'

// Ensure data directory exists
mkdirSync('./data', { recursive: true })

const sqlite = new Database('./data/prd-chamber.db')
const db = drizzle(sqlite)

const app = new Hono()

app.use('*', cors())

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

const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
