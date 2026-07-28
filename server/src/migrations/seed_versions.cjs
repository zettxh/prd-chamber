const db = require('better-sqlite3')
const d = new db('./data/prd-chamber.db')

// Insert initial version for existing projects
const projects = d.prepare('SELECT id FROM projects').all()
for (const p of projects) {
  d.prepare(`
    INSERT INTO project_versions (id, project_id, version, trigger, summary, created_at)
    VALUES (lower(hex(randomblob(16))), ?, 1, 'manual', 'Project created', unixepoch())
  `).run(p.id)
  console.log(`Inserted for project: ${p.id}`)
}

d.close()
console.log('Done')
