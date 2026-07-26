// Task Handlers — generate, get, update
import { Context } from 'hono'
import { db } from '../db/index.js'
import { projects } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { chatCompletion } from '../llm/client.js'
import { settings as settingsTable } from '../db/schema.js'
import { buildTasksPrompt } from '../prompts/tasks.js'

// ─── Types ─────────────────────────────────────────────────────────

export interface Task {
  id: string
  phase: string
  feature: string
  task: string
  description: string
  effort: 'S' | 'M' | 'L'
  is_done: boolean
}

export interface TasksData {
  tasks: Task[]
  generatedAt: string
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

// ─── POST /api/projects/:id/generate-tasks ───────────────────────

export async function generateTasks(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  // Load structure data
  const structureData = project.structureData
    ? JSON.parse(project.structureData)
    : null

  if (!structureData) {
    return c.json({ error: 'No structure found. Generate structure first.' }, 400)
  }

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

  const industryContext = project.description
    ? `${project.industry} — ${project.description}`
    : project.industry

  const messages = buildTasksPrompt(industryContext, structureData)

  try {
    const response = await chatCompletion(llmConfig, messages)

    // Strip markdown code fences
    let cleaned = response.replace(/^```json\s*/gi, '').replace(/\s*```$/gi, '').trim()

    // Guard: empty
    if (!cleaned) {
      return c.json({ error: 'LLM returned empty response. Try again.' }, 500)
    }

    // Extract JSON object with "tasks" key — finds the first { ... } containing "tasks"
    let jsonStr: string | null = null
    let parsed: { tasks: unknown[] } | null = null

    // Strategy 1: direct parse
    try {
      const direct = JSON.parse(cleaned)
      if (Array.isArray(direct)) {
        parsed = { tasks: direct }
      } else if (direct && typeof direct === 'object' && 'tasks' in direct && Array.isArray((direct as Record<string, unknown>).tasks)) {
        parsed = direct as { tasks: unknown[] }
      }
    } catch {}

    // Strategy 2: extract first { ... "tasks" ... }
    if (!parsed) {
      const match = cleaned.match(/\{[\s\S]*?"tasks"[\s\S]*?\}/)
      if (match) {
        try {
          const extracted = JSON.parse(match[0])
          if (Array.isArray(extracted)) {
            parsed = { tasks: extracted }
          } else if (extracted && 'tasks' in extracted) {
            parsed = extracted as { tasks: unknown[] }
          }
        } catch {
          // try trimming mismatched braces
          try {
            let trimmed = match[0]
            // balance braces
            let depth = 0
            for (let i = 0; i < trimmed.length; i++) {
              if (trimmed[i] === '{') depth++
              else if (trimmed[i] === '}') depth--
              if (depth === 0 && i > 10) {
                trimmed = trimmed.slice(0, i + 1)
                break
              }
            }
            const balanced = JSON.parse(trimmed)
            if (Array.isArray(balanced)) {
              parsed = { tasks: balanced }
            } else if (balanced && 'tasks' in balanced) {
              parsed = balanced as { tasks: unknown[] }
            }
          } catch {}
        }
      }
    }

    // Strategy 3: extract bare arrays [[...]] or [...]
    if (!parsed) {
      const arrMatch = cleaned.match(/\[[\s\S]*?"[^"]+"\s*:[\s\S]*?\]/)
      if (arrMatch) {
        try {
          const arr = JSON.parse(arrMatch[0])
          if (Array.isArray(arr)) {
            parsed = { tasks: arr }
          }
        } catch {}
      }
    }

    if (!parsed || !Array.isArray(parsed.tasks)) {
      console.error('[TASKS] Could not parse LLM response:', response.slice(0, 200))
      return c.json({ error: 'LLM returned invalid format. Try again.' }, 500)
    }

    // Assign stable IDs based on index (so IDs are deterministic)
    const tasksWithIds: Task[] = parsed.tasks.map((t, idx) => {
      const task = t as Record<string, unknown>
      return {
        id: String(idx + 1),
        phase: String(task.phase ?? ''),
        feature: String(task.feature ?? ''),
        task: String(task.task ?? ''),
        description: String(task.description ?? ''),
        effort: (task.effort as Task['effort']) ?? 'M',
        is_done: false,
      }
    })

    const tasksData: TasksData = {
      tasks: tasksWithIds,
      generatedAt: new Date().toISOString(),
    }

    // Save to DB
    await db.update(projects)
      .set({ tasksData: JSON.stringify(tasksData), updatedAt: new Date() })
      .where(eq(projects.id, projectId))

    return c.json({ tasks: tasksData })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }
}

// ─── GET /api/projects/:id/tasks ────────────────────────────────

export async function getTasks(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  if (!project.tasksData) {
    return c.json({ tasks: null })
  }

  const tasksData = JSON.parse(project.tasksData) as TasksData
  return c.json({ tasks: tasksData })
}

// ─── PATCH /api/projects/:id/tasks ──────────────────────────────

export async function updateTasks(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json<{ tasks: Task[] }>()
  if (!body.tasks) return c.json({ error: 'tasks required' }, 400)

  const currentTasksData: TasksData | null = project.tasksData
    ? JSON.parse(project.tasksData)
    : null

  const updatedTasksData: TasksData = {
    tasks: body.tasks,
    generatedAt: currentTasksData?.generatedAt ?? new Date().toISOString(),
  }

  await db.update(projects)
    .set({ tasksData: JSON.stringify(updatedTasksData), updatedAt: new Date() })
    .where(eq(projects.id, projectId))

  return c.json({ message: 'Tasks updated' })
}
