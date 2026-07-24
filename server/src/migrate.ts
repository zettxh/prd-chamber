import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { mkdirSync } from 'fs'

mkdirSync('./data', { recursive: true })

const sqlite = new Database('./data/prd-chamber.db')
const db = drizzle(sqlite)

console.log('Running migrations...')
migrate(db, { migrationsFolder: './drizzle' })
console.log('Migrations complete!')
