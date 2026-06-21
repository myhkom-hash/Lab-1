// src/repositories/users.repository.js
const { all, get, run } = require('../db/dbClient');

async function getAllUsers() {
  return all('SELECT id, name, createdAt FROM Users ORDER BY id DESC;');
}

async function getUserById(id) {
  return get('SELECT id, name, createdAt FROM Users WHERE id = ?;', [Number(id)]);
}

async function createUser({ name }) {
  const result = await run(
    'INSERT INTO Users (name, createdAt) VALUES (?, ?);',
    [name, new Date().toISOString()]
  );
  return getUserById(result.lastID);
}

async function updateUser(id, updates) {
  const fields = [];
  const params = [];

  if (updates.name) {
    fields.push('name = ?');
    params.push(updates.name);
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  params.push(Number(id));
  const result = await run(`UPDATE Users SET ${fields.join(', ')} WHERE id = ?;`, params);
  if (result.changes === 0) {
    return null;
  }

  return getUserById(id);
}

async function deleteUser(id) {
  const result = await run('DELETE FROM Users WHERE id = ?;', [Number(id)]);
  return result.changes > 0;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };