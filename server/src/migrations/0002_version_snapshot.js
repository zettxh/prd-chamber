// Migration: rename project_versions content → trigger/summary/prd_data_snapshot
const db = require('better-sqlite3')
const d = new db('./data/prd-chamber.db')

// Rename old table
d.exec('ALTER TABLE project_versions RENAME TO project_versions_old')

// Create new table with new schema
d.exec(`
CREATE TABLE project_versions (
  id text PRIMARY KEY NOT NULL,
  project_id text NOT NULL,
  version integer NOT NULL,
  trigger text NOT NULL DEFAULT 'manual',
  summary text NOT NULL,
  prd_data_snapshot text,
  created_at integer NOT NULL
)
`)

// Migrate existing data
d.exec(`
INSERT INTO project_versions (id, project_id, version, trigger, summary, created_at)
SELECT id, project_id, version, 'manual', 'Manual save', created_at
FROM project_versions_old
`)

// Drop old table
d.exec('DROP TABLE project_versions_old')

d.close()
console.log('Migration done')
