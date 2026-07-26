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

// ─── DEBUG: Raw LLM Response ──────────────────────────────────────
// TEMPORARY — remove after debugging
export async function debugTasksLLM(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  const [project] = await db.select().from(projects)
    .where(eq(projects.id, projectId)).limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const structureData = project.structureData
    ? JSON.parse(project.structureData)
    : null

  if (!structureData) return c.json({ error: 'No structure found' }, 400)

  const [userSettings] = await db.select().from(settingsTable)
    .where(eq(settingsTable.userId, userId)).limit(1)
  if (!userSettings?.llmApiKey) return c.json({ error: 'LLM not configured' }, 400)

  const industryContext = project.description
    ? `${project.industry} — ${project.description}`
    : project.industry

  const messages = buildTasksPrompt(industryContext, structureData)

  try {
    const raw = await chatCompletion({
      provider: userSettings.llmProvider,
      apiKey: userSettings.llmApiKey,
      model: userSettings.llmModel,
      ...(userSettings.llmProvider === 'custom' && userSettings.llmCustomEndpoint
        ? { baseUrl: userSettings.llmCustomEndpoint }
        : {}),
    }, messages)

    return c.json({ raw, length: raw.length, first200: raw.slice(0, 200) })
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
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

    // Strip markdown code fences first
    let cleaned = response.replace(/```json\s*/gi, '').replace(/\s*```\s*$/gi, '').trim()

    // Guard: empty
    if (!cleaned) {
      return c.json({ error: 'LLM returned empty response. Try again.' }, 500)
    }

    // ─── Extract JSON via balanced brace counting ───────────────────
    // Finds the FIRST '{' whose object contains "tasks", then counts braces
    // to extract the complete balanced object (no regex guesswork)
    function extractBalancedObject(text: string): string | null {
      // Strategy A: find first '{' whose object has "tasks", extract to closing '}'
      const firstBrace = text.indexOf('{')
      if (firstBrace === -1) return null

      let depth = 0
      let start = -1
      let inTasksObject = false

      for (let i = firstBrace; i < text.length; i++) {
        const ch = text[i]

        if (ch === '{') {
          if (start === -1) start = i
          depth++
        } else if (ch === '}') {
          depth--
          if (depth === 0 && start !== -1) {
            // Found balanced top-level object
            const candidate = text.slice(start, i + 1)
            // Check if this object contains "tasks"
            if (candidate.includes('"tasks"')) {
              return candidate
            }
            // Not the right object — reset and keep searching from here
            start = -1
            depth = 0
          }
        }
      }
      return null
    }

    let parsed: { tasks: unknown[] } | null = null

    // Strategy 1: direct parse (cleaned is already fence-stripped)
    try {
      const direct = JSON.parse(cleaned)
      if (Array.isArray(direct)) {
        parsed = { tasks: direct }
      } else if (direct && typeof direct === 'object' && 'tasks' in direct && Array.isArray((direct as Record<string, unknown>).tasks)) {
        parsed = direct as { tasks: unknown[] }
      }
    } catch {}

    // Strategy 2: balanced brace extraction — find first object containing "tasks"
    if (!parsed) {
      const balanced = extractBalancedObject(cleaned)
      if (balanced) {
        try {
          const obj = JSON.parse(balanced)
          if (Array.isArray(obj)) {
            parsed = { tasks: obj }
          } else if (obj && 'tasks' in obj) {
            parsed = obj as { tasks: unknown[] }
          }
        } catch {}
      }
    }

    // Strategy 3: find first object with "tasks" anywhere in raw response
    // (handles cases where there's text before the JSON)
    if (!parsed) {
      const taskObjStart = cleaned.indexOf('"tasks"')
      if (taskObjStart !== -1) {
        // Walk backward to find the opening brace
        let objStart = taskObjStart
        while (objStart >= 0 && cleaned[objStart] !== '{') objStart--
        if (objStart >= 0) {
          const slice = cleaned.slice(objStart)
          const balanced2 = extractBalancedObject(slice)
          if (balanced2) {
            try {
              const obj = JSON.parse(balanced2)
              if (Array.isArray(obj)) {
                parsed = { tasks: obj }
              } else if (obj && 'tasks' in obj) {
                parsed = obj as { tasks: unknown[] }
              }
            } catch {}
          }
        }
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
