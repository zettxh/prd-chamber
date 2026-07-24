import { Context } from 'hono'
import { db } from '../db/index.js'
import { projects, clarificationAnswers } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { chatCompletion, buildClarifyPrompt } from '../llm/client.js'
import { settings as settingsTable } from '../db/schema.js'

export async function generateClarifyQuestions(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!project[0]) return c.json({ error: 'Project not found' }, 404)
  if (project[0].userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const userSettings = await db.select().from(settingsTable).where(eq(settingsTable.userId, userId)).limit(1)
  if (!userSettings[0]?.llmApiKey) {
    return c.json({ error: 'LLM not configured. Please set API key in Settings.' }, 400)
  }

  const messages = buildClarifyPrompt(project[0].industry, project[0].description ?? undefined)

  try {
    const response = await chatCompletion(
      {
        provider: userSettings[0].llmProvider,
        apiKey: userSettings[0].llmApiKey,
        model: userSettings[0].llmModel,
      },
      messages
    )

    const cleaned = response.replace(/^```json\n?|```\n?/gi, '').trim()
    const questions = JSON.parse(cleaned)
    return c.json({ questions })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }
}

export async function saveClarificationAnswers(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!project[0]) return c.json({ error: 'Project not found' }, 404)
  if (project[0].userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json<{ answers?: Record<string, string | string[] | null>; skipped?: string[] }>()

  await db.delete(clarificationAnswers).where(eq(clarificationAnswers.projectId, projectId))
  await db.insert(clarificationAnswers).values({
    id: crypto.randomUUID(),
    projectId,
    answers: JSON.stringify(body.answers ?? {}),
    skipped: JSON.stringify(body.skipped ?? []),
    createdAt: new Date(),
  })

  return c.json({ message: 'Clarification answers saved' })
}

export async function getClarificationAnswers(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!project[0]) return c.json({ error: 'Project not found' }, 404)
  if (project[0].userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const rows = await db.select().from(clarificationAnswers)
    .where(eq(clarificationAnswers.projectId, projectId)).limit(1)

  if (!rows[0]) return c.json({ answers: null, skipped: [] })

  return c.json({
    answers: JSON.parse(rows[0].answers),
    skipped: JSON.parse(rows[0].skipped),
  })
}
