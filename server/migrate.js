const Database = require('better-sqlite3');
const db = new Database('./data/prd-chamber.db');
const migrations = [
  `CREATE TABLE IF NOT EXISTS activity_log (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT, action TEXT NOT NULL, detail TEXT NOT NULL, metadata TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS error_log (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT, code TEXT NOT NULL, message TEXT NOT NULL, stack TEXT, context TEXT, created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id)`,
  `CREATE INDEX IF NOT EXISTS idx_error_user ON error_log(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_error_project ON error_log(project_id)`,
];
migrations.forEach((sql, i) => { try { db.exec(sql); console.log('OK', i+1); } catch (e) { console.error('ERR', i+1, e.message); } });
const at = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_log'").all();
const et = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='error_log'").all();
console.log('activity_log:', at.length > 0 ? 'exists' : 'missing');
console.log('error_log:', et.length > 0 ? 'exists' : 'missing');
db.close();
