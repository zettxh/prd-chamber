import { Context } from 'hono'
import { db } from '../db/index.js'
import { settings } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export async function getSettingsHandler(c: Context) {
  const userId = c.get('userId')

  const row = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1)

  if (!row[0]) {
    return c.json({ llmProvider: '', llmApiKey: '', llmModel: '' })
  }

  return c.json({
    llmProvider: row[0].llmProvider,
    llmApiKey: row[0].llmApiKey,
    llmModel: row[0].llmModel,
    llmCustomEndpoint: row[0].llmCustomEndpoint ?? '',
  })
}

export async function putSettingsHandler(c: Context) {
  const userId = c.get('userId')
  const body = await c.req.json<{ llmProvider: string; llmApiKey: string; llmModel: string; llmCustomEndpoint?: string }>()

  if (!body.llmProvider || !body.llmApiKey || !body.llmModel) {
    return c.json({ error: 'All fields required' }, 400)
  }

  // Upsert
  await db.delete(settings).where(eq(settings.userId, userId))
  await db.insert(settings).values({
    userId,
    llmProvider: body.llmProvider,
    llmApiKey: body.llmApiKey,
    llmModel: body.llmModel,
    llmCustomEndpoint: body.llmCustomEndpoint ?? null,
  })

  return c.json({ message: 'Settings saved' })
}
