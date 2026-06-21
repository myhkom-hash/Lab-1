// src/repositories/users.repository.js
const { all, get, run } = require('../db/dbClient');
const { buildUpdateQuery } = require('../utils/db');

async function getAllUsers() {
  return all('SELECT id, name, createdAt FROM Users ORDER BY id DESC;');
}

async function getUserById(id) {
  return get('SELECT id, name, createdAt FROM Users WHERE id = ?;', [Number(id)]);
}

async function getUserByName(name) {
  return get('SELECT id, name, createdAt FROM Users WHERE name = ?;', [name]);
}

// ✅ НОВА ФУНКЦІЯ: підраховує кількість користувачів на рівні БД
async function getUsersCount() {
  const row = await get('SELECT COUNT(*) AS count FROM Users;');
  return row ? row.count : 0;
}

async function createUser({ name }) {
  const result = await run(
    'INSERT INTO Users (name, createdAt) VALUES (?, ?);',
    [name, new Date().toISOString()]
  );
  return getUserById(result.lastID);
}

async function updateUser(id, updates) {
  const query = buildUpdateQuery('Users', id, updates);
  if (!query) return getUserById(id);

  const result = await run(query.sql, query.params);
  if (result.changes === 0) return null;
  return getUserById(id);
}

async function deleteUser(id) {
  const result = await run('DELETE FROM Users WHERE id = ?;', [Number(id)]);
  return result.changes > 0;
}

module.exports = { getAllUsers, getUserById, getUserByName, getUsersCount, createUser, updateUser, deleteUser };