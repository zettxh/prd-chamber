import { Context } from 'hono'
import { db } from '../db/index.js'
import { projects, clarificationAnswers } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { chatCompletion } from '../llm/client.js'
import { settings as settingsTable } from '../db/schema.js'

interface Phase {
  phase_number: number
  phase_name: string
  features: Array<{
    name: string
    description: string
    complexity: 'low' | 'medium' | 'high'
    sub_features: string[]
  }>
}

function buildStructurePrompt(industry: string, clarificationAnswers: Record<string, string | string[] | null>): { messages: Array<{ role: string; content: string }> } {
  const answersStr = Object.entries(clarificationAnswers)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n')

  return {
    messages: [
      {
        role: 'system',
        content: `You are a product architect. Generate a feature structure for a software project based on the industry and clarification answers.

IMPORTANT: Output EXACTLY this JSON schema with EXACT constraints:

{
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Phase Name in Indonesian",
      "features": [
        {
          "name": "Feature Name",
          "description": "Brief description",
          "complexity": "low",
          "sub_features": ["Sub 1", "Sub 2", "Sub 3"]
        }
      ]
    }
  ]
}

STRICT RULES:
- phase_number: integer 1 to 5 only
- phase_name: Indonesian language, 2-4 words
- features: EXACTLY 2 per phase
- sub_features: EXACTLY 3 items per feature array only
- complexity: "low" OR "medium" OR "high"
- No markdown, no code blocks, no explanation — ONLY valid JSON
- All text in Indonesian language
- Total phases: 5
- Total features: 10 (2 per phase)
- Total sub_features: 30 (3 per feature, 3x2 per phase)`
      },
      {
        role: 'user',
        content: `Industry: ${industry}\nClarification Answers:\n${answersStr}`
      }
    ]
  }
}

export async function generateStructure(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId))
  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  // Get clarification answers from DB
  const [clarifyRow] = await db.select().from(clarificationAnswers)
    .where(eq(clarificationAnswers.projectId, projectId))

  const answers: Record<string, string | string[] | null> = clarifyRow
    ? JSON.parse(clarifyRow.answers)
    : {}

  // Get user LLM settings
  const [userSettings] = await db.select().from(settingsTable).where(eq(settingsTable.userId, userId))
  if (!userSettings?.llmApiKey) {
    return c.json({ error: 'LLM not configured. Please set API key in Settings.' }, 400)
  }

  const industryContext = project.description
    ? `${project.industry} — ${project.description}`
    : project.industry

  const promptData = buildStructurePrompt(industryContext, answers)

  try {
    const response = await chatCompletion(
      {
        provider: userSettings.llmProvider,
        apiKey: userSettings.llmApiKey,
        model: userSettings.llmModel,
        ...(userSettings.llmProvider === 'custom' && userSettings.llmCustomEndpoint
          ? { baseUrl: userSettings.llmCustomEndpoint }
          : {}),
      },
      promptData.messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    )

    const cleaned = response.replace(/^```json\n?|```\n?/gi, '').trim()
    const structure = JSON.parse(cleaned) as { phases: Phase[] }

    // Save structure to project
    await db.update(projects)
      .set({ structureData: JSON.stringify(structure) })
      .where(eq(projects.id, projectId))

    return c.json({ structure })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }
}

export async function getStructure(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId))
  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  if (!project.structureData) {
    return c.json({ structure: null })
  }

  return c.json({ structure: JSON.parse(project.structureData) })
}

export async function saveStructure(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId))
  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json<{ structure: { phases: Phase[] } }>()
  if (!body.structure?.phases) {
    return c.json({ error: 'structure.phases required' }, 400)
  }

  await db.update(projects)
    .set({ structureData: JSON.stringify(body.structure) })
    .where(eq(projects.id, projectId))

  return c.json({ message: 'Structure saved' })
}
