// src/repositories/posts.repository.js
const { all, get, run } = require('../db/dbClient');

async function getAllPosts({ userId, category, sort, order, status, limit } = {}) {
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
  const fields = [];
  const params = [];

  if (updates.title) {
    fields.push('title = ?');
    params.push(updates.title);
  }
  if (updates.body) {
    fields.push('body = ?');
    params.push(updates.body);
  }
  if (updates.category) {
    fields.push('category = ?');
    params.push(updates.category);
  }
  if (updates.status) {
    fields.push('status = ?');
    params.push(updates.status);
  }

  if (fields.length === 0) {
    return getPostById(id);
  }

  params.push(Number(id));
  const result = await run(`UPDATE Posts SET ${fields.join(', ')} WHERE id = ?;`, params);
  if (result.changes === 0) {
    return null;
  }

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