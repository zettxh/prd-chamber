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

Generate EXACTLY 5 phases with EXACTLY 2-3 features per phase.

Output ONLY valid JSON matching this schema:
{
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Foundation / Auth & Core",
      "features": [
        {
          "name": "Feature Name",
          "description": "Brief description",
          "complexity": "low|medium|high",
          "sub_features": ["Sub feature 1", "Sub feature 2", "Sub feature 3"]
        }
      ]
    }
  ]
}

Rules:
- phase_number: 1 to 5
- phase_name: use Indonesian language, descriptive and meaningful
- features: 2-3 per phase
- sub_features: EXACTLY 3 per feature
- complexity: low (1-2 weeks), medium (2-4 weeks), high (4+ weeks)
- No markdown, no code blocks, pure JSON only
- All text in Indonesian language`
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
