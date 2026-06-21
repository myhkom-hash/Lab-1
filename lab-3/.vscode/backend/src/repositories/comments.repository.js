// src/repositories/comments.repository.js
const { all, get, run } = require('../db/dbClient');

const SORT_FIELDS = new Set(['createdAt', 'id']);
const ORDER_VALUES = new Set(['ASC', 'DESC']);

async function getAllComments({ postId, userId, sort, order, limit } = {}) {
  const params = [];
  const conditions = [];

  if (postId !== undefined) {
    conditions.push('postId = ?');
    params.push(Number(postId));
  }
  if (userId !== undefined) {
    conditions.push('userId = ?');
    params.push(Number(userId));
  }

  const safeSort = SORT_FIELDS.has(sort) ? sort : 'createdAt';
  const safeOrder = ORDER_VALUES.has((order || 'DESC').toUpperCase()) ? order.toUpperCase() : 'DESC';
  const parsedLimit = Number(limit);
  const limitClause = !Number.isNaN(parsedLimit) && parsedLimit > 0 ? ' LIMIT ?' : '';

  if (limitClause) {
    params.push(parsedLimit);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

  return all(
    `SELECT id, postId, userId, body, createdAt FROM Comments${where} ORDER BY ${safeSort} ${safeOrder}${limitClause};`,
    params
  );
}

async function getCommentById(id) {
  return get('SELECT id, postId, userId, body, createdAt FROM Comments WHERE id = ?;', [Number(id)]);
}

async function createComment({ postId, userId, body }) {
  const result = await run(
    'INSERT INTO Comments (postId, userId, body, createdAt) VALUES (?, ?, ?, ?);',
    [postId, userId, body, new Date().toISOString()]
  );
  return getCommentById(result.lastID);
}

async function updateComment(id, updates) {
  const fields = [];
  const params = [];

  if (updates.body) {
    fields.push('body = ?');
    params.push(updates.body);
  }

  if (fields.length === 0) {
    return getCommentById(id);
  }

  params.push(Number(id));
  const result = await run(`UPDATE Comments SET ${fields.join(', ')} WHERE id = ?;`, params);
  if (result.changes === 0) {
    return null;
  }

  return getCommentById(id);
}

async function deleteComment(id) {
  const result = await run('DELETE FROM Comments WHERE id = ?;', [Number(id)]);
  return result.changes > 0;
}

module.exports = { getAllComments, getCommentById, createComment, updateComment, deleteComment };
