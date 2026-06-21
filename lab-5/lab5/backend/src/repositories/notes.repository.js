// src/repositories/notes.repository.js


const { all, get, run } = require('../db/dbClient');

async function getNotesByOwner(ownerUserId) {
  return all(
    'SELECT id, ownerUserId, title, content, createdAt FROM Notes WHERE ownerUserId = ? ORDER BY createdAt DESC;',
    [ownerUserId]
  );
}

async function getNoteByIdAndOwner(id, ownerUserId) {
  // перевіряємо і id, і власника в одному SQL-запиті
  return get(
    'SELECT id, ownerUserId, title, content, createdAt FROM Notes WHERE id = ? AND ownerUserId = ?;',
    [Number(id), Number(ownerUserId)]
  );
}

// Лише для перевірки існування запису (для IDOR-демонстрації у тестах/звіті)
async function getNoteByIdUnsafe(id) {
  return get(
    'SELECT id, ownerUserId, title, content, createdAt FROM Notes WHERE id = ?;',
    [Number(id)]
  );
}

async function createNote({ ownerUserId, title, content }) {
  const result = await run(
    'INSERT INTO Notes (ownerUserId, title, content, createdAt) VALUES (?, ?, ?, ?);',
    [Number(ownerUserId), title, content, new Date().toISOString()]
  );
  return getNoteByIdUnsafe(result.lastID);
}

async function updateNote(id, ownerUserId, updates) {
  const fields = Object.keys(updates)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(updates), Number(id), Number(ownerUserId)];
  const result = await run(
    `UPDATE Notes SET ${fields} WHERE id = ? AND ownerUserId = ?;`,
    values
  );
  if (result.changes === 0) return null;
  return getNoteByIdUnsafe(id);
}

async function deleteNote(id, ownerUserId) {
  const result = await run(
    'DELETE FROM Notes WHERE id = ? AND ownerUserId = ?;',
    [Number(id), Number(ownerUserId)]
  );
  return result.changes > 0;
}

module.exports = {
  getNotesByOwner,
  getNoteByIdAndOwner,
  getNoteByIdUnsafe,
  createNote,
  updateNote,
  deleteNote,
};
