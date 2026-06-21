// src/middleware/errorHandler.js

class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  const msg = String(err && err.message ? err.message : err);
  if (msg.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ error: { message: 'Користувач з таким ім\'ям вже існує' } });
  }

  if (msg.includes('NOT NULL constraint failed') || msg.includes('CHECK constraint failed')) {
    return res.status(400).json({ error: { message: 'Неправильні дані запиту' } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Внутрішня помилка сервера' } });
}

module.exports = { errorHandler, ApiError };