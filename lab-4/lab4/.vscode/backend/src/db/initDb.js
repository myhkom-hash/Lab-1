// src/db/initDb.js
const { run, all } = require('./dbClient');

async function ensureColumn(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table});`);
  const exists = columns.some((row) => row.name === column);
  if (!exists) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

async function initDb() {
  await run('PRAGMA foreign_keys = ON;');

  await run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Posts (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  await ensureColumn('Posts', 'category', "TEXT NOT NULL DEFAULT 'Різне'");
  await ensureColumn('Posts', 'author', "TEXT NOT NULL DEFAULT 'Анонім'");

  await run(`
    CREATE TABLE IF NOT EXISTS Comments (
      id INTEGER PRIMARY KEY,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      body TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (postId) REFERENCES Posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT
    );
  `);

  console.log('DB schema initialized');
}

module.exports = { initDb }; 