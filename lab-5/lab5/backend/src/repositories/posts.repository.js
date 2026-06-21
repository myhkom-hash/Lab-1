// src/repositories/posts.repository.js


const { all, get, run } = require('../db/dbClient');
const { buildUpdateQuery } = require('../utils/db');

async function getAllPosts({ userId, category, sort, order, status, limit, search } = {}) {
  const params = [];
  const conditions = [];

  if (userId !== undefined) {
    conditions.push('userId = ?');
    params.push(Number(userId));
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  // пошуковий рядок передається як параметр (?)
  // а не конкатенується в SQL-рядок через ${search}
  if (search) {
    conditions.push('title LIKE ?');
    params.push(`%${search}%`);
  }

  const allowedSortFields = ['createdAt', 'title', 'id'];
  const allowedOrder = ['ASC', 'DESC'];
  const safeSort = allowedSortFields.includes(sort) ? sort : 'createdAt';
  const safeOrder = allowedOrder.includes((order || 'DESC').toUpperCase()) ? (order || 'DESC').toUpperCase() : 'DESC';
  const parsedLimit = Number(limit);
  const limitClause = !Number.isNaN(parsedLimit) && parsedLimit > 0 ? ' LIMIT ?' : '';

  if (limitClause) {
    params.push(parsedLimit);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  return all(
    `SELECT id, userId, title, category, author, body, status, createdAt FROM Posts${where} ORDER BY ${safeSort} ${safeOrder}${limitClause};`,
    params
  );
}

async function getPostById(id) {
  return get(
    'SELECT id, userId, title, category, author, body, status, createdAt FROM Posts WHERE id = ?;',
    [Number(id)]
  );
}

async function createPost({ userId, title, category, author, body, status }) {
  const result = await run(
    'INSERT INTO Posts (userId, title, category, author, body, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [userId, title, category, author, body, status, new Date().toISOString()]
  );
  return getPostById(result.lastID);
}

async function updatePost(id, updates) {
  const query = buildUpdateQuery('Posts', id, updates);
  if (!query) return getPostById(id);

  const result = await run(query.sql, query.params);
  if (result.changes === 0) return null;
  return getPostById(id);
}

async function deletePost(id) {
  const result = await run('DELETE FROM Posts WHERE id = ?;', [Number(id)]);
  return result.changes > 0;
}

async function getPostWithDetails(id) {
  return get(
    `SELECT
      p.id,
      p.userId,
      p.title,
      p.category,
      p.author,
      p.body,
      p.status,
      p.createdAt,
      u.name AS userName,
      COUNT(c.id) AS commentCount
    FROM Posts p
    LEFT JOIN Users u ON u.id = p.userId
    LEFT JOIN Comments c ON c.postId = p.id
    WHERE p.id = ?
    GROUP BY p.id;`,
    [Number(id)]
  );
}

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost, getPostWithDetails };