// PRD Handlers — outline, generate, revise
import { Context } from 'hono'
import { db } from '../db/index.js'
import { projects, clarificationAnswers } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { chatCompletion } from '../llm/client.js'
import { settings as settingsTable } from '../db/schema.js'
import { buildOutlinePrompt } from './outline-prompt.js'
import { buildSectionPrompt } from './content-prompts.js'
import { buildRevisionPrompt } from './revision-prompt.js'
import { Readable } from 'node:stream'

// ─── Types ─────────────────────────────────────────────────────────

export interface PrdSection {
  id: string
  name: string
  description: string
  priority: number
  is_mandatory: boolean
  content: string | null
  order: number
}

export interface PrdData {
  tier: number
  tier_reason: string
  flags: string[]
  sections: PrdSection[]
  skipped_sections: Array<{ id: string; reason: string }>
}

// ─── LLM Config Helper ─────────────────────────────────────────────

async function getLLMConfig(userId: string) {
  const [userSettings] = await db.select().from(settingsTable)
    .where(eq(settingsTable.userId, userId)).limit(1)

  if (!userSettings?.llmApiKey) {
    throw new Error('LLM_NOT_CONFIGURED')
  }

  return {
    provider: userSettings.llmProvider,
    apiKey: userSettings.llmApiKey,
    model: userSettings.llmModel,
    ...(userSettings.llmProvider === 'custom' && userSettings.llmCustomEndpoint
      ? { baseUrl: userSettings.llmCustomEndpoint }
      : {}),
  }
}

// ─── GET /api/projects/:id/prd ─────────────────────────────────────

export async function getPrd(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  if (!project.prdData) {
    return c.json({ prdData: null, status: 'empty' })
  }

  const prdData = JSON.parse(project.prdData) as PrdData
  return c.json({ prdData, status: 'ok' })
}

// ─── POST /api/projects/:id/prd/outline ────────────────────────────

export async function generateOutline(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  // Load clarification answers
  const [clarifyRow] = await db.select().from(clarificationAnswers)
    .where(eq(clarificationAnswers.projectId, projectId)).limit(1)

  const answers = clarifyRow
    ? JSON.parse(clarifyRow.answers)
    : {}

  // Load structure data
  const structureData = project.structureData
    ? JSON.parse(project.structureData)
    : null

  // Get LLM config
  let llmConfig
  try {
    llmConfig = await getLLMConfig(userId)
  } catch (err) {
    if ((err as Error).message === 'LLM_NOT_CONFIGURED') {
      return c.json({ error: 'LLM not configured. Please set API key in Settings.' }, 400)
    }
    throw err
  }

  const messages = buildOutlinePrompt(
    project.industry,
    project.description ?? undefined,
    answers,
    structureData
  )

  try {
    const response = await chatCompletion(llmConfig, messages)

    const cleaned = response.replace(/```json\n?|```\n?/gi, '').trim()
    const parsed = JSON.parse(cleaned) as {
      tier: number
      tier_reason: string
      flags: string[]
      sections: Array<{
        id: string
        name: string
        description: string
        priority: number
        is_mandatory: boolean
      }>
      skipped_sections: Array<{ id: string; reason: string }>
    }

    // Assign order
    const sections: PrdSection[] = parsed.sections
      .sort((a, b) => a.priority - b.priority)
      .map((s, idx) => ({
        ...s,
        content: null,
        order: idx,
      }))

    const prdData: PrdData = {
      tier: parsed.tier,
      tier_reason: parsed.tier_reason,
      flags: parsed.flags,
      sections,
      skipped_sections: parsed.skipped_sections,
    }

    // Save to DB
    await db.update(projects)
      .set({ prdData: JSON.stringify(prdData), updatedAt: new Date() })
      .where(eq(projects.id, projectId))

    return c.json({ prdData })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }
}

// ─── PUT /api/projects/:id/prd/sections ────────────────────────────

export async function updatePrdSections(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json<{ sections: PrdSection[] }>()
  if (!body.sections) return c.json({ error: 'sections required' }, 400)

  const currentPrd: PrdData | null = project.prdData
    ? JSON.parse(project.prdData)
    : null

  const updatedPrd: PrdData = currentPrd
    ? { ...currentPrd, sections: body.sections }
    : { tier: 0, tier_reason: '', flags: [], sections: body.sections, skipped_sections: [] }

  await db.update(projects)
    .set({ prdData: JSON.stringify(updatedPrd), updatedAt: new Date() })
    .where(eq(projects.id, projectId))

  return c.json({ message: 'Sections updated' })
}

// ─── POST /api/projects/:id/prd/generate ──────────────────────────
// SSE stream — generate content per section sequentially

export async function generatePrdContent(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  if (project.userId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  if (!project.prdData) {
    return c.json({ error: 'No PRD outline found. Generate outline first.' }, 400)
  }

  const prdData: PrdData = JSON.parse(project.prdData)
  const sectionsToGenerate = prdData.sections

  // Load clarification answers
  const [clarifyRow] = await db.select().from(clarificationAnswers)
    .where(eq(clarificationAnswers.projectId, projectId)).limit(1)

  const answers = clarifyRow
    ? JSON.parse(clarifyRow.answers)
    : {}

  const structureData = project.structureData
    ? JSON.parse(project.structureData)
    : null

  // Get LLM config
  let llmConfig
  try {
    llmConfig = await getLLMConfig(userId)
  } catch {
    return c.json({ code: 'LLM_NOT_CONFIGURED', message: 'LLM not configured', action: 'redirect_settings' }, 400)
  }

  // Sort sections by priority
  const sortedSections = [...sectionsToGenerate].sort((a, b) => a.priority - b.priority)

  // Track generated content for context
  const generatedSections: Array<{ id: string; name: string; content: string }> = []

  // Updated prdData for DB save at end
  const updatedPrd: PrdData = {
    ...prdData,
    sections: sortedSections.map((s, idx) => ({ ...s, content: null, order: idx })),
  }

  // Async generator SSE — uses raw Node.js streams, no Web Streams API buffering
  async function* generateSSE() {
    yield `event: outline_confirmed\ndata: ${JSON.stringify({
      section_count: sortedSections.length,
      sections: sortedSections.map(s => ({ id: s.id, name: s.name })),
    })}\n\n`

    try {
      for (let i = 0; i < sortedSections.length; i++) {
        const section = sortedSections[i]

        yield `event: generating\ndata: ${JSON.stringify({
          current_section: section.id,
          section_name: section.name,
          progress: Math.round((i / sortedSections.length) * 100),
        })}\n\n`

        try {
          const messages = buildSectionPrompt(
            section,
            project.industry,
            project.description ?? undefined,
            answers,
            structureData,
            generatedSections
          )

          const response = await chatCompletion(llmConfig!, messages)
          const content = response.replace(/^```markdown\n?|```\n?$/gi, '').trim()

          generatedSections.push({ id: section.id, name: section.name, content })

          yield `event: section_complete\ndata: ${JSON.stringify({ section_id: section.id, content })}\n\n`

          updatedPrd.sections = updatedPrd.sections.map(s =>
            s.id === section.id ? { ...s, content } : s
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          yield `event: section_error\ndata: ${JSON.stringify({ section_id: section.id, error: message, retryable: true })}\n\n`
        }
      }

      // Save to DB (best effort)
      try {
        await db.update(projects)
          .set({ prdData: JSON.stringify(updatedPrd), updatedAt: new Date() })
          .where(eq(projects.id, projectId))
      } catch {
        // ignore
      }

      yield `event: complete\ndata: ${JSON.stringify({
        project_id: projectId,
        sections_generated: generatedSections.length,
        total_sections: sortedSections.length,
      })}\n\n`
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      yield `event: fatal_error\ndata: ${JSON.stringify({ code: 'GENERATION_FAILED', message, action: 'retry' })}\n\n`
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return c.newResponse(Readable.from(generateSSE()) as any, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

// ─── PUT /api/projects/:id/prd/sections/:sectionId ─────────────────

export async function updateSectionContent(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const sectionId = c.req.param('sectionId') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json<{ content: string }>()
  if (!body.content) return c.json({ error: 'content required' }, 400)

  const prdData: PrdData | null = project.prdData
    ? JSON.parse(project.prdData)
    : null

  if (!prdData) return c.json({ error: 'No PRD outline found' }, 400)

  const updatedSections = prdData.sections.map(s =>
    s.id === sectionId ? { ...s, content: body.content } : s
  )

  await db.update(projects)
    .set({
      prdData: JSON.stringify({ ...prdData, sections: updatedSections }),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))

  return c.json({ message: 'Section content updated' })
}

// ─── POST /api/projects/:id/prd/sections/:sectionId/revise ────────

export async function reviseSection(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const sectionId = c.req.param('sectionId') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const prdData: PrdData | null = project.prdData
    ? JSON.parse(project.prdData)
    : null

  if (!prdData) return c.json({ error: 'No PRD outline found' }, 400)

  const sectionToRevise = prdData.sections.find(s => s.id === sectionId)
  if (!sectionToRevise) return c.json({ error: 'Section not found' }, 404)

  const body = await c.req.json<{
    type: 'add' | 'remove' | 'modify'
    description: string
  }>()

  if (!body.type || !body.description) {
    return c.json({ error: 'type and description required' }, 400)
  }

  let llmConfig
  try {
    llmConfig = await getLLMConfig(userId)
  } catch {
    return c.json({ error: 'LLM not configured' }, 400)
  }

  const messages = buildRevisionPrompt(sectionToRevise, prdData.sections, {
    type: body.type,
    description: body.description,
  })

  try {
    const response = await chatCompletion(llmConfig, messages)
    const proposedContent = response.replace(/^```markdown\n?|```\n?$/gi, '').trim()

    return c.json({ proposed_content: proposedContent, section_id: sectionId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }
}

// ─── POST /api/projects/:id/prd/regenerate-outline ────────────────

export async function regenerateOutline(c: Context) {
  // Same as generateOutline — reset content to null, regenerate
  return generateOutline(c)
}
