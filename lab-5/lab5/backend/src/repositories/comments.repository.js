// src/repositories/comments.repository.js
const { all, get, run } = require('../db/dbClient');
const { buildUpdateQuery } = require('../utils/db');

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
  const normalizedOrder = (order || 'DESC').toString().toUpperCase();
  const safeOrder = ORDER_VALUES.has(normalizedOrder) ? normalizedOrder : 'DESC';
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

//повертає пост з найбільшою кількістю коментарів (обчислення на бекенді через SQL)
async function getTopCommentedPost() {
  return get(`
    SELECT
      p.id,
      p.title,
      COUNT(c.id) AS commentCount
    FROM Posts p
    INNER JOIN Comments c ON c.postId = p.id
    GROUP BY p.id
    ORDER BY commentCount DESC
    LIMIT 1;
  `);
}

async function createComment({ postId, userId, body }) {
  const result = await run(
    'INSERT INTO Comments (postId, userId, body, createdAt) VALUES (?, ?, ?, ?);',
    [postId, userId, body, new Date().toISOString()]
  );
  return getCommentById(result.lastID);
}

async function updateComment(id, updates) {
  const query = buildUpdateQuery('Comments', id, updates);
  if (!query) return getCommentById(id);

  const result = await run(query.sql, query.params);
  if (result.changes === 0) return null;
  return getCommentById(id);
}

async function deleteComment(id) {
  const result = await run('DELETE FROM Comments WHERE id = ?;', [Number(id)]);
  return result.changes > 0;
}

module.exports = { getAllComments, getCommentById, getTopCommentedPost, createComment, updateComment, deleteComment };