import { db } from './db/index.js'
import { projects, projectVersions } from './db/schema.js'
import { randomUUID } from 'crypto'

function generateId(): string {
  return randomUUID()
}

async function seed() {
  const userId = process.argv[2]

  if (!userId) {
    console.error('Usage: npx tsx src/seed-project.ts <userId>')
    process.exit(1)
  }

  const now = new Date()
  const projectId = generateId()

  await db.insert(projects).values({
    id: projectId,
    userId,
    name: 'POS Kopi Shop',
    industry: 'F&B / Coffee Shop',
    description: 'Point of sale system for a specialty coffee shop',
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(projectVersions).values({
    id: generateId(),
    projectId,
    version: 1,
    content: '{}',
    createdAt: now,
  })

  console.log(`Created project "${projectId}" for user "${userId}"`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
