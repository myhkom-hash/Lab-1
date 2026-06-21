// src/db/migrate.js
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const { run, all, exec } = require('./dbClient');

async function migrate() {
  await run('PRAGMA foreign_keys = ON;');

  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  const appliedRows = await all('SELECT filename FROM schema_migrations;');
  const appliedSet = new Set(appliedRows.map((row) => row.filename));

  for (const file of files) {
    if (appliedSet.has(file)) {
      continue;
    }

    const fullPath = join(migrationsDir, file);
    const sql = readFileSync(fullPath, 'utf8').trim();
    if (!sql) {
      continue;
    }

    await exec(sql);
    await run(
      `INSERT OR IGNORE INTO schema_migrations (filename, appliedAt) VALUES (?, ?);`,
      [file, new Date().toISOString()]
    );
    console.log(`Migration applied: ${file}`);
  }
}

module.exports = { migrate };

if (require.main === module) {
  migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

