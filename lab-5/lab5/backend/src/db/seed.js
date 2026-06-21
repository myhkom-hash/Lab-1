// src/db/seed.js
const { migrate } = require('./migrate');
const { run } = require('./dbClient');

async function seed() {
  await migrate();
  const now = new Date().toISOString();

  await run(
    `INSERT OR IGNORE INTO Users (name, createdAt) VALUES (?, ?);`,
    ['Alice', now]
  );

  await run(
    `INSERT OR IGNORE INTO Users (name, createdAt) VALUES (?, ?);`,
    ['Bob', now]
  );

  await run(
    `INSERT OR IGNORE INTO Users (name, createdAt) VALUES (?, ?);`,
    ['Carol', now]
  );

  await run(
    `INSERT OR IGNORE INTO Posts (userId, title, category, author, body, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [1, 'Hello', 'Різне', 'Alice', 'First post created during seeding', now, 'published']
  );

  await run(
    `INSERT OR IGNORE INTO Posts (userId, title, category, author, body, createdAt, status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [2, 'Second entry', 'Навчання', 'Bob', 'Second seeded post for the app.', now, 'draft']
  );

  await run(
    `INSERT OR IGNORE INTO Comments (postId, userId, body, createdAt) VALUES (?, ?, ?, ?);`,
    [1, 2, 'Nice post, Alice!', now]
  );

  await run(
    `INSERT OR IGNORE INTO Comments (postId, userId, body, createdAt) VALUES (?, ?, ?, ?);`,
    [1, 3, 'Thanks for the update.', now]
  );

  console.log('Seed completed');
}


seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});