import { Context } from 'hono'
import { db } from '../db/index.js'
import { eq } from 'drizzle-orm'
import { projects, clarificationAnswers } from '../db/schema.js'
import { randomUUID } from 'crypto'

function generateId(): string {
  return randomUUID()
}

export async function saveClarificationAnswers(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const body = await c.req.json<{ answers: object; skipped?: string[] }>()

  if (!body.answers) {
    return c.json({ error: 'answers is required' }, 400)
  }

  // Verify project exists and belongs to user
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId))

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }

  if (project.userId !== userId) {
    return c.json({ error: 'Forbidden — you do not own this project' }, 403)
  }

  // Upsert: delete then insert
  await db.delete(clarificationAnswers).where(eq(clarificationAnswers.projectId, projectId))

  await db.insert(clarificationAnswers).values({
    id: generateId(),
    projectId,
    answers: JSON.stringify(body.answers),
    skipped: JSON.stringify(body.skipped ?? []),
    createdAt: new Date(),
  })

  return c.json({ message: 'Clarification answers saved' })
}

export async function getClarificationAnswers(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  // Verify project exists and belongs to user
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId))

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }

  if (project.userId !== userId) {
    return c.json({ error: 'Forbidden — you do not own this project' }, 403)
  }

  const [clarify] = await db
    .select()
    .from(clarificationAnswers)
    .where(eq(clarificationAnswers.projectId, projectId))

  if (!clarify) {
    return c.json({ answers: null, skipped: [] })
  }

  return c.json({
    answers: JSON.parse(clarify.answers),
    skipped: JSON.parse(clarify.skipped),
  })
}
