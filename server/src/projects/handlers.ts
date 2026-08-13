import { Context } from 'hono'
import { db } from '../db/index.js'
import { eq, desc, and, or, isNull } from 'drizzle-orm'
import { projects, projectVersions, clarificationAnswers } from '../db/schema.js'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { chatCompletion } from '../llm/client.js'
import { settings as settingsTable } from '../db/schema.js'

function generateId(): string {
  return randomUUID()
}

export async function listProjects(c: Context) {
  const userId = c.get('userId')
  const showArchived = c.req.query('archived') === 'true'

  const condition = showArchived
    ? and(eq(projects.userId, userId), eq(projects.isArchived, 1))
    : and(eq(projects.userId, userId), or(eq(projects.isArchived, 0), isNull(projects.isArchived)))

  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      industry: projects.industry,
      isArchived: projects.isArchived,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      clarificationQuestions: projects.clarificationQuestions,
      clarificationAnswersId: clarificationAnswers.id,
      structureData: projects.structureData,
      prdData: projects.prdData,
      tasksData: projects.tasksData,
    })
    .from(projects)
    .leftJoin(clarificationAnswers, eq(clarificationAnswers.projectId, projects.id))
    .where(condition)
    .orderBy(desc(projects.createdAt))

  // Compute step from progress data
  const withStep = result.map(row => {
    let step: string
    if (row.tasksData && row.tasksData !== 'null') {
      step = 'tasks'
    } else if (row.prdData && row.prdData !== 'null') {
      try {
        const prd = JSON.parse(row.prdData)
        if (prd.sections && prd.sections.some((s: { content?: string }) => s.content)) {
          step = 'prd'
        } else {
          step = 'structured'
        }
      } catch {
        step = 'structured'
      }
    } else if (row.structureData && row.structureData !== 'null') {
      step = 'structured'
    } else if (row.clarificationAnswersId) {
      step = 'clarifying'
    } else {
      step = 'draft'
    }
    return { ...row, step }
  })

  return c.json({ projects: withStep })
}

export async function createProject(c: Context) {
  const userId = c.get('userId')
  const body = await c.req.json<{ name: string; industry: string; description?: string }>()

  if (!body.name || !body.industry) {
    return c.json({ error: 'name and industry are required' }, 400)
  }

  const now = new Date()
  const projectId = generateId()

  await db.insert(projects).values({
    id: projectId,
    userId,
    name: body.name,
    industry: body.industry,
    description: body.description ?? null,
    createdAt: now,
    updatedAt: now,
  })
  // Auto-generate title from description via LLM
  const userSettings = await db.select().from(settingsTable).where(eq(settingsTable.userId, userId)).limit(1)
  if (userSettings[0]?.llmApiKey && body.description) {
    try {
      const messages = [
        {
          role: 'user' as const,
          content: `Based on this project idea, generate a short, catchy project title (max 60 characters, in Indonesian if the idea is in Indonesian, otherwise English). Only output the title, nothing else.\n\nProject idea: ${body.description}`,
        },
      ]
      const generatedTitle = await chatCompletion(
        {
          provider: userSettings[0].llmProvider,
          apiKey: userSettings[0].llmApiKey,
          model: userSettings[0].llmModel,
          ...(userSettings[0].llmProvider === 'custom' && userSettings[0].llmCustomEndpoint
            ? { baseUrl: userSettings[0].llmCustomEndpoint }
            : {}),
        },
        messages
      )
      const title = generatedTitle.trim().slice(0, 80)
      if (title) {
        await db.update(projects).set({ name: title }).where(eq(projects.id, projectId))
      }
    } catch {
      // Non-blocking: keep original name if LLM fails
    }
  }

  // Create initial version entry
  await db.insert(projectVersions).values({
    id: generateId(),
    projectId,
    version: 1,
    trigger: 'manual',
    summary: 'Project created',
    prdDataSnapshot: null,
    createdAt: now,
  })

  return c.json({ id: projectId, name: body.name, industry: body.industry }, 201)
}

export async function getProject(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }

  if (project.userId !== userId) {
    return c.json({ error: 'Forbidden — you do not own this project' }, 403)
  }

  const versions = await db
    .select()
    .from(projectVersions)
    .where(eq(projectVersions.projectId, projectId))
    .orderBy(desc(projectVersions.version))

  const [clarify] = await db
    .select()
    .from(clarificationAnswers)
    .where(eq(clarificationAnswers.projectId, projectId))

  return c.json({
    project: {
      id: project.id,
      name: project.name,
      industry: project.industry,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    versions,
    clarificationAnswers: clarify
      ? {
          answers: clarify.answers,
          skipped: clarify.skipped,
        }
      : null,
  })
}

export async function generateProjectTitle(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const userSettings = await db.select().from(settingsTable).where(eq(settingsTable.userId, userId)).limit(1)
  if (!userSettings[0]?.llmApiKey) {
    return c.json({ error: 'LLM not configured' }, 400)
  }

  // Build context: prefer Ringkasan Eksekutif if PRD exists, else description + clarification answers
  let context = ''
  if (project.prdData) {
    try {
      const prd = JSON.parse(project.prdData)
      // Build text from ALL sections, extracting body content only
      const allText = prd.sections
        .map((s: { title?: string; content?: string }) => {
          const title = s.title ?? ''
          const content = s.content ?? ''
          // Remove markdown formatting to get plain text
          const plainContent = content
            .replace(/#{1,6}\s+/g, '')       // remove # headers
            .replace(/\*\*/g, '')              // remove bold markers
            .replace(/\*/g, '')                // remove italic markers
            .replace(/`{1,3}[^`]*`{1,3}/g, '') // remove code
            .replace(/\n{3,}/g, '\n\n')       // collapse multiple newlines
            .trim()
          return `${title}\n${plainContent}`
        })
        .filter(Boolean)
        .join('\n\n')

      if (allText.trim()) {
        context = allText.slice(0, 800)
      }
    } catch {}
  }

  // Fallback: description + clarification answers
  if (!context && project.description) {
    context = project.description ?? ''
    if (project.clarificationQuestions) {
      try {
        const questions = JSON.parse(project.clarificationQuestions)
        const [clarify] = await db.select().from(clarificationAnswers)
          .where(eq(clarificationAnswers.projectId, projectId)).limit(1)
        if (clarify) {
          const answers = JSON.parse(clarify.answers)
          for (const q of questions) {
            const a = answers[q.id]
            if (a) context += `\n${q.label}: ${Array.isArray(a) ? a.join(', ') : a}`
          }
        }
      } catch {}
    }
  }

  if (!context.trim()) {
    return c.json({ error: 'No content available for title generation' }, 400)
  }

  try {
    const messages = [
      {
        role: 'user' as const,
        content: `You are a smart project title generator. Read the content below carefully.

CRITICAL RULES:
1. If the content contains an EXISTING product/app name (e.g., "ClipMaster adalah...", "Aplikasi bernama X...", "Product name is Y...", "merupakan aplikasi bernama..."), you MUST use that exact existing name as the title.
2. Do NOT create a new creative title if an existing product name already appears in the content.
3. Output only the title, nothing else.
4. The title MUST be exactly 4-7 words describing the core of the project.
5. Max 60 characters total.
6. Indonesian language preferred, English if project is English.

Content:
${context}`,
      },
    ]
    const generated = await chatCompletion(
      {
        provider: userSettings[0].llmProvider,
        apiKey: userSettings[0].llmApiKey,
        model: userSettings[0].llmModel,
        ...(userSettings[0].llmProvider === 'custom' && userSettings[0].llmCustomEndpoint
          ? { baseUrl: userSettings[0].llmCustomEndpoint }
          : {}),
      },
      messages
    )
    const title = generated.trim().slice(0, 80)
    if (!title) return c.json({ error: 'Failed to generate title' }, 500)

    await db.update(projects).set({ name: title, updatedAt: new Date() }).where(eq(projects.id, projectId))
    return c.json({ name: title })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return c.json({ error: msg }, 500)
  }
}

export async function updateProject(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const body = await c.req.json<{ name?: string; industry?: string; description?: string; isArchived?: boolean }>()

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }

  if (project.userId !== userId) {
    return c.json({ error: 'Forbidden — you do not own this project' }, 403)
  }

  // Only create version snapshot if not just archiving
  const isOnlyArchiving = body.name === undefined && body.industry === undefined &&
    body.description === undefined && body.isArchived !== undefined

  if (!isOnlyArchiving) {
    const [maxVersionRow] = await db
      .select({ maxVersion: sql<number>`max(${projectVersions.version})` })
      .from(projectVersions)
      .where(eq(projectVersions.projectId, projectId))

    const nextVersion = (maxVersionRow?.maxVersion ?? 0) + 1
    await db.insert(projectVersions).values({
      id: generateId(),
      projectId,
      version: nextVersion,
      trigger: 'manual',
      summary: 'Project updated',
      prdDataSnapshot: project.prdData,
      createdAt: new Date(),
    })
  }

  await db
    .update(projects)
    .set({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.industry !== undefined ? { industry: body.industry } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.isArchived !== undefined ? { isArchived: body.isArchived ? 1 : 0 } : {}),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))

  return c.json({ message: 'Project updated' })
}

export async function deleteProject(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))

  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }

  if (project.userId !== userId) {
    return c.json({ error: 'Forbidden — you do not own this project' }, 403)
  }

  // Must archive before permanent delete
  if (!project.isArchived) {
    return c.json({ error: 'Archive the project before deleting. PATCH /api/projects/:id with {"isArchived": true}' }, 400)
  }

  // Delete related records first
  await db.delete(clarificationAnswers).where(eq(clarificationAnswers.projectId, projectId))
  await db.delete(projectVersions).where(eq(projectVersions.projectId, projectId))
  await db.delete(projects).where(eq(projects.id, projectId))

  return c.json({ message: 'Project permanently deleted' })
}
