// Task Handlers — generate, get, update
import { Context } from 'hono'
import { db } from '../db/index.js'
import { projects } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { chatCompletion } from '../llm/client.js'
import { settings as settingsTable } from '../db/schema.js'
import { logActivity } from '../settings/handlers.js'
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
    const response = await chatCompletion(llmConfig, messages, undefined, 8192)

    // Strip markdown fences — be specific: opening ```json + closing ```
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice('```json'.length).trimStart()
    }
    // Remove trailing ``` with optional whitespace/newlines before it
    cleaned = cleaned.replace(/\n?\s*```\s*$/gi, '').trim()

    if (!cleaned) {
      return c.json({ error: 'LLM returned empty response. Try again.' }, 500)
    }

    // ─── Parse JSON — handle both direct object and escaped string ─────────
    let tasksArray: unknown[] | null = null

    // Try 1: direct parse
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        tasksArray = parsed
      } else if (parsed && typeof parsed === 'object' && 'tasks' in parsed) {
        const tv = (parsed as Record<string, unknown>).tasks
        if (Array.isArray(tv)) tasksArray = tv
      }
    } catch {}

    // Try 2: extract tasks array by counting brackets from "tasks" key
    if (!tasksArray) {
      const keyIdx = cleaned.indexOf('"tasks"')
      if (keyIdx !== -1) {
        let i = keyIdx + 7
        while (i < cleaned.length && cleaned[i] !== '[') i++
        if (i < cleaned.length) {
          let depth = 0, start = i
          for (; i < cleaned.length; i++) {
            if (cleaned[i] === '[') depth++
            else if (cleaned[i] === ']') { depth--; if (depth === 0) break }
          }
          if (depth === 0) {
            const raw = cleaned.slice(start, i + 1)
              .replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
            try { const p = JSON.parse(raw); if (Array.isArray(p)) tasksArray = p } catch {}
          }
        }
      }
    }

    if (!tasksArray || !Array.isArray(tasksArray)) {
      console.error('[TASKS] Parse failed. cleaned[0:80]:', cleaned.slice(0, 80))
      return c.json({ error: 'LLM returned invalid format. Try again.' }, 500)
    }

    // Assign stable IDs based on index (so IDs are deterministic)
    const tasksWithIds: Task[] = tasksArray.map((t, idx) => {
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

    // Log activity
    logActivity(userId, 'tasks_generated', `[${project.name}] Generated ${tasksWithIds.length} task(s)`, projectId, { taskCount: tasksWithIds.length })

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

  // Log activity
  const taskCount = body.tasks.length
  logActivity(userId, 'tasks_updated', `[${project.name}] Updated ${taskCount} task(s)`, projectId, { taskCount })

  return c.json({ message: 'Tasks updated' })
}
