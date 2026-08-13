import { Context } from 'hono'
import { db } from '../db/index.js'
import { eq, desc, and, sql } from 'drizzle-orm'
import { settings, activityLog, errorLog } from '../db/schema.js'
import { randomUUID } from 'crypto'

function generateId(): string {
  return randomUUID()
}

// Settings Handlers
export async function getSettingsHandler(c: Context) {
  const userId = c.get('userId')
  const [row] = await db.select().from(settings).where(eq(settings.userId, userId))
  return c.json(row ?? null)
}

export async function putSettingsHandler(c: Context) {
  const userId = c.get('userId')
  const body = await c.req.json<{
    llmProvider: string
    llmApiKey: string
    llmModel: string
    llmCustomEndpoint?: string
  }>()

  const existing = await db.select().from(settings).where(eq(settings.userId, userId))

  if (existing.length > 0) {
    await db.update(settings).set({
      llmProvider: body.llmProvider,
      llmApiKey: body.llmApiKey,
      llmModel: body.llmModel,
      llmCustomEndpoint: body.llmCustomEndpoint ?? null,
    }).where(eq(settings.userId, userId))
  } else {
    await db.insert(settings).values({
      userId,
      llmProvider: body.llmProvider,
      llmApiKey: body.llmApiKey,
      llmModel: body.llmModel,
      llmCustomEndpoint: body.llmCustomEndpoint ?? null,
    })
  }

  return c.json({ message: 'Settings saved' })
}

// Log Activity
export async function logActivity(
  userId: string,
  action: string,
  detail: string,
  projectId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await db.insert(activityLog).values({
      id: generateId(),
      userId,
      projectId: projectId ?? null,
      action,
      detail,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date(),
    })
  } catch (err) {
    console.error('[Activity] Failed to log:', err)
  }
}

// Log Error
export async function logError(
  userId: string,
  code: string,
  message: string,
  projectId?: string,
  stack?: string,
  context?: Record<string, unknown>
) {
  try {
    await db.insert(errorLog).values({
      id: generateId(),
      userId,
      projectId: projectId ?? null,
      code,
      message,
      stack: stack ?? null,
      context: context ? JSON.stringify(context) : null,
      createdAt: new Date(),
    })
  } catch (err) {
    console.error('[ErrorLog] Failed to log:', err)
  }
}

// GET /api/activity
export async function getActivityLog(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.query('projectId')
  const limit = parseInt(c.req.query('limit') || '50')

  const conditions = [eq(activityLog.userId, userId)]
  if (projectId) {
    conditions.push(eq(activityLog.projectId, projectId))
  }

  const result = await db
    .select({
      id: activityLog.id,
      projectId: activityLog.projectId,
      action: activityLog.action,
      detail: activityLog.detail,
      metadata: activityLog.metadata,
      createdAt: sql`datetime(${activityLog.createdAt}, 'unixepoch')`,
    })
    .from(activityLog)
    .where(and(...conditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)

  const withParsed = result.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }))

  return c.json({ activities: withParsed })
}

// GET /api/errors
export async function getErrorLog(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.query('projectId')
  const limit = parseInt(c.req.query('limit') || '50')

  const conditions = [eq(errorLog.userId, userId)]
  if (projectId) {
    conditions.push(eq(errorLog.projectId, projectId))
  }

  const result = await db
    .select({
      id: errorLog.id,
      projectId: errorLog.projectId,
      code: errorLog.code,
      message: errorLog.message,
      stack: errorLog.stack,
      createdAt: sql`datetime(${errorLog.createdAt}, 'unixepoch')`,
    })
    .from(errorLog)
    .where(and(...conditions))
    .orderBy(desc(errorLog.createdAt))
    .limit(limit)

  return c.json({ errors: result })
}

// GET /api/stats
export async function getUsageStats(c: Context) {
  const userId = c.get('userId')

  const projectRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLog)
    .where(and(
      eq(activityLog.userId, userId),
      eq(activityLog.action, 'project_created'),
    ))

  const prdRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLog)
    .where(and(
      eq(activityLog.userId, userId),
      eq(activityLog.action, 'prd_generated'),
    ))

  const taskRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLog)
    .where(and(
      eq(activityLog.userId, userId),
      eq(activityLog.action, 'tasks_generated'),
    ))

  return c.json({
    projectsCreated: projectRows[0]?.count ?? 0,
    prdsGenerated: prdRows[0]?.count ?? 0,
    tasksGenerated: taskRows[0]?.count ?? 0,
    storageUsed: '0 MB',
  })
}
