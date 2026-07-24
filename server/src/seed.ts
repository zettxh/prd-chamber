import { hashSync } from 'bcryptjs'
import { db } from './db/index.js'
import { users } from './db/schema.js'
import { sql } from 'drizzle-orm'

// Run: npm run seed [email] [password] [name]
const email = process.argv[2] ?? 'zain@prdchamber.local'
const password = process.argv[3] ?? 'PRDChamber2026!'
const name = process.argv[4] ?? 'Zain'

async function seed() {
  // Check if user already exists
  const existing = await db.select({ id: users.id }).from(users).where(sql`${users.email} = ${email}`).limit(1)
  if (existing[0]) {
    console.log(`User ${email} already exists. Skipping.`)
    process.exit(0)
  }

  const passwordHash = hashSync(password, 10)
  const id = crypto.randomUUID()

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name,
    createdAt: new Date(),
  })

  console.log(`\n✅ User created successfully!
   Email:    ${email}
   Password: ${password}
   Name:     ${name}
   ID:       ${id}

⚠️  Change password after first login!
`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
