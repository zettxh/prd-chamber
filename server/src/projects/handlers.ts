import { Context } from 'hono'
import { db } from '../db/index.js'
import { eq, desc } from 'drizzle-orm'
import { projects, projectVersions, clarificationAnswers } from '../db/schema.js'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

function generateId(): string {
  return randomUUID()
}

export async function listProjects(c: Context) {
  const userId = c.get('userId')

  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      industry: projects.industry,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))

  return c.json({ projects: result })
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

  // Create initial version entry
  await db.insert(projectVersions).values({
    id: generateId(),
    projectId,
    version: 1,
    content: '{}',
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

export async function updateProject(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const body = await c.req.json<{ name?: string; industry?: string; description?: string }>()

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

  // Get current max version
  const [maxVersionRow] = await db
    .select({ maxVersion: sql<number>`max(${projectVersions.version})` })
    .from(projectVersions)
    .where(eq(projectVersions.projectId, projectId))

  const nextVersion = (maxVersionRow?.maxVersion ?? 0) + 1

  await db.insert(projectVersions).values({
    id: generateId(),
    projectId,
    version: nextVersion,
    content: '{}',
    createdAt: new Date(),
  })

  await db
    .update(projects)
    .set({
      name: body.name ?? project.name,
      industry: body.industry ?? project.industry,
      description: body.description ?? project.description,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))

  return c.json({ message: 'Project updated', version: nextVersion })
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

  // Delete related records first
  await db.delete(clarificationAnswers).where(eq(clarificationAnswers.projectId, projectId))
  await db.delete(projectVersions).where(eq(projectVersions.projectId, projectId))
  await db.delete(projects).where(eq(projects.id, projectId))

  return c.json({ message: 'Project deleted' })
}
