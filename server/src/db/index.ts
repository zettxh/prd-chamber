import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'

mkdirSync('./data', { recursive: true })

const sqlite = new Database('./data/prd-chamber.db')
export const db = drizzle(sqlite)
