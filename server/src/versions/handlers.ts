// Version History Handlers — list, compare, restore
import { Context } from 'hono'
import { db } from '../db/index.js'
import { eq, desc, and, sql } from 'drizzle-orm'
import { projects, projectVersions } from '../db/schema.js'
import { withMutex } from '../utils/async.js'
import { randomUUID } from 'crypto'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VersionEntry {
  id: string
  version: number
  trigger: string
  summary: string
  createdAt: Date
}

// ─── Helper: Auto-snapshot ──────────────────────────────────────────────────

export type SnapshotTrigger = 'manual' | 'generation_complete' | 'outline_regen' | 'revision'

export async function createVersionSnapshot(
  projectId: string,
  trigger: SnapshotTrigger,
  summary: string,
  prdData: string | null
): Promise<void> {
  return withMutex(projectId, async () => {
    const now = new Date()

    // Get next version number
    const [maxRow] = await db
      .select({ maxVersion: sql<number>`max(${projectVersions.version})` })
      .from(projectVersions)
      .where(eq(projectVersions.projectId, projectId))

    const nextVersion = (maxRow?.maxVersion ?? 0) + 1

    await db.insert(projectVersions).values({
      id: randomUUID(),
      projectId,
      version: nextVersion,
      trigger,
      summary,
      prdDataSnapshot: prdData,
      createdAt: now,
    })

    // Prune: keep last 20 versions per project
    const allVersions = await db
      .select({ id: projectVersions.id, version: projectVersions.version })
      .from(projectVersions)
      .where(eq(projectVersions.projectId, projectId))
      .orderBy(desc(projectVersions.version))

    if (allVersions.length > 20) {
      const toDelete = allVersions.slice(20).map(v => v.id)
      for (const id of toDelete) {
        await db.delete(projectVersions).where(eq(projectVersions.id, id))
      }
    }
  })
}

// ─── GET /api/projects/:id/versions ─────────────────────────────────────────

export async function listVersions(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string

  // Verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const versions = await db
    .select({
      id: projectVersions.id,
      version: projectVersions.version,
      trigger: projectVersions.trigger,
      summary: projectVersions.summary,
      createdAt: projectVersions.createdAt,
    })
    .from(projectVersions)
    .where(eq(projectVersions.projectId, projectId))
    .orderBy(desc(projectVersions.version))

  return c.json({ versions })
}

// ─── GET /api/projects/:id/versions/:v1/compare/:v2 ─────────────────────────

export async function compareVersions(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const v1Id = c.req.param('v1') as string
  const v2Id = c.req.param('v2') as string

  // Verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const [v1] = await db
    .select({
      id: projectVersions.id,
      version: projectVersions.version,
      trigger: projectVersions.trigger,
      summary: projectVersions.summary,
      prdDataSnapshot: projectVersions.prdDataSnapshot,
      createdAt: projectVersions.createdAt,
    })
    .from(projectVersions)
    .where(and(
      eq(projectVersions.projectId, projectId),
      eq(projectVersions.id, v1Id)
    ))
    .limit(1)

  const [v2] = await db
    .select({
      id: projectVersions.id,
      version: projectVersions.version,
      trigger: projectVersions.trigger,
      summary: projectVersions.summary,
      prdDataSnapshot: projectVersions.prdDataSnapshot,
      createdAt: projectVersions.createdAt,
    })
    .from(projectVersions)
    .where(and(
      eq(projectVersions.projectId, projectId),
      eq(projectVersions.id, v2Id)
    ))
    .limit(1)

  if (!v1) return c.json({ error: 'Version 1 not found' }, 404)
  if (!v2) return c.json({ error: 'Version 2 not found' }, 404)

  return c.json({ v1, v2 })
}

// ─── POST /api/projects/:id/versions/:versionId/restore ─────────────────────

export async function restoreVersion(c: Context) {
  const userId = c.get('userId')
  const projectId = c.req.param('id') as string
  const versionId = c.req.param('versionId') as string

  // Verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!project) return c.json({ error: 'Project not found' }, 404)
  if (project.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  // Get the version to restore
  const [version] = await db
    .select()
    .from(projectVersions)
    .where(and(
      eq(projectVersions.projectId, projectId),
      eq(projectVersions.id, versionId)
    ))
    .limit(1)

  if (!version) return c.json({ error: 'Version not found' }, 404)

  // Save current prd_data as a "before restore" snapshot
  const now = new Date()
  const [maxRow] = await db
    .select({ maxVersion: sql<number>`max(${projectVersions.version})` })
    .from(projectVersions)
    .where(eq(projectVersions.projectId, projectId))

  const nextVersion = (maxRow?.maxVersion ?? 0) + 1

  await db.insert(projectVersions).values({
    id: randomUUID(),
    projectId,
    version: nextVersion,
    trigger: 'manual',
    summary: `Auto-backup before restoring to v${version.version}`,
    prdDataSnapshot: project.prdData,
    createdAt: now,
  })

  // Restore: overwrite project.prd_data with the snapshot
  await db
    .update(projects)
    .set({ prdData: version.prdDataSnapshot, updatedAt: now })
    .where(eq(projects.id, projectId))

  return c.json({
    message: `Restored to v${version.version}`,
    newVersion: nextVersion,
  })
}
