import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  industry: text('industry').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const projectVersions = sqliteTable('project_versions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  version: integer('version').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const clarificationAnswers = sqliteTable('clarification_answers', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  answers: text('answers').notNull(),
  skipped: text('skipped').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const settings = sqliteTable('settings', {
  userId: text('user_id').primaryKey().references(() => users.id),
  llmProvider: text('llm_provider').notNull(),
  llmApiKey: text('llm_api_key').notNull(),
  llmModel: text('llm_model').notNull(),
  llmCustomEndpoint: text('llm_custom_endpoint'),
})
