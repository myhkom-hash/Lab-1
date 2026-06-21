// src/middleware/demoAuth.js
// Лаб №5 — Сценарій В: IDOR / Broken Access Control

const { getUserById } = require('../repositories/users.repository');

async function demoAuth(req, res, next) {
  const raw = req.header('X-Demo-UserId');

  if (!raw) {
    return res.status(401).json({
      status: 401,
      title: 'UNAUTHORIZED',
      detail: "Заголовок X-Demo-UserId обов'язковий для цього маршруту",
    });
  }

  const userId = Number(raw);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(401).json({
      status: 401,
      title: 'UNAUTHORIZED',
      detail: 'X-Demo-UserId має бути цілим додатнім числом',
    });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({
        status: 401,
        title: 'UNAUTHORIZED',
        detail: 'Користувача з таким ID не знайдено',
      });
    }

    
    req.user = { id: user.id, name: user.name };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { demoAuth };
