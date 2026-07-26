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

    // Strip markdown fences — be specific: opening ```json + closing ```
    // Don't consume characters beyond the fence markers
    let cleaned = response.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice('```json'.length).trimStart()
    }
    // Remove trailing ``` (with optional whitespace/newlines before it)
    cleaned = cleaned.replace(/\n?\s*```\s*$/gi, '').trim()

    if (!cleaned) {
      return c.json({ error: 'LLM returned empty response. Try again.' }, 500)
    }

    // ─── Parse: handle JSON STRING (LLM returns escaped string) ─────────
    // The LLM sometimes returns the JSON as a STRING with \" escapes inside.
    // We handle both: direct object { tasks: [...] } AND string { tasks: "..." }
    let tasksArray: unknown[] | null = null

    // Try 1: direct parse of cleaned text
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        tasksArray = parsed
      } else if (parsed && typeof parsed === 'object' && 'tasks' in parsed) {
        const tasksVal = (parsed as Record<string, unknown>).tasks
        if (Array.isArray(tasksVal)) {
          tasksArray = tasksVal
        } else if (typeof tasksVal === 'string') {
          // tasks is a STRING — double-parse
          try {
            tasksArray = JSON.parse(tasksVal)
          } catch {
            // Could be escaped string — try unescaping first
            try {
              const unescaped = tasksVal
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\\\/g, '\\')
              tasksArray = JSON.parse(unescaped)
            } catch {}
          }
        }
      }
    } catch {}

    // Try 2: extract "tasks" string via regex, then double-parse
    if (!tasksArray) {
      const tasksStrMatch = cleaned.match(/"tasks"\s*:\s*"((?:[^"\\]|\\.)*)"/)
      if (tasksStrMatch) {
        // Found "tasks": "..." — unescape and parse
        try {
          const unescaped = tasksStrMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
          tasksArray = JSON.parse(unescaped)
        } catch {}
      }
    }

    // Try 3: find the JSON array literal (handles \"escaped braces inside string)
    if (!tasksArray) {
      // Find "tasks": followed by [...]
      const arrStart = cleaned.indexOf('"tasks"')
      if (arrStart !== -1) {
        // Walk from "tasks" to find [
        let bracketStart = arrStart
        while (bracketStart < cleaned.length && cleaned[bracketStart] !== '[') bracketStart++
        if (bracketStart < cleaned.length) {
          // Count brackets to find matching ]
          let depth = 0
          let i = bracketStart
          for (; i < cleaned.length; i++) {
            const ch = cleaned[i]
            if (ch === '[') depth++
            else if (ch === ']') { depth--; if (depth === 0) break }
          }
          if (depth === 0) {
            const arrSlice = cleaned.slice(bracketStart, i + 1)
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\\\/g, '\\')
            try {
              const parsed = JSON.parse(arrSlice)
              if (Array.isArray(parsed)) tasksArray = parsed
            } catch {}
          }
        }
      }
    }

    if (!tasksArray) {
      console.error('[TASKS] Failed to parse. Raw response preview:', cleaned.slice(0, 300))
      return c.json({ error: 'LLM returned invalid format. Try again.' }, 500)
    }

    if (!Array.isArray(tasksArray)) {
      return c.json({ error: 'LLM returned unexpected format. Try again.' }, 500)
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
