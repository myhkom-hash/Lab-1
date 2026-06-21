// src/middleware/errorHandler.js
// Централізована обробка помилок
// ✓ Вимога: "Зробити централізовану обробку помилок"
// ✓ Вимога: "повертати коректні HTTP-коди (400/404/409/500)"
// ✓ Вимога: "узгоджений формат помилки (ProblemDetails-подібна відповідь)"

class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function buildProblemDetails({ status = 500, title = 'INTERNAL_ERROR', detail = 'Внутрішня помилка сервера', errors = null }) {
  const result = { status, title, detail };
  if (errors) {
    result.errors = errors;
  }
  return result;
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json(buildProblemDetails({
      status: err.status,
      title: err.code,
      detail: err.message,
      errors: err.details,
    }));
  }

  const msg = String(err && err.message ? err.message : err);
  if (msg.includes('UNIQUE constraint failed')) {
    return res.status(409).json(buildProblemDetails({
      status: 409,
      title: 'CONFLICT',
      detail: 'Запис з такими даними вже існує',
    }));
  }

  if (msg.includes('NOT NULL constraint failed') || msg.includes('CHECK constraint failed')) {
    return res.status(400).json(buildProblemDetails({
      status: 400,
      title: 'BAD_REQUEST',
      detail: 'Неправильні дані запиту',
    }));
  }

  console.error(err);
  res.status(500).json(buildProblemDetails({
    status: 500,
    title: 'INTERNAL_ERROR',
    detail: 'Внутрішня помилка сервера',
  }));
}

module.exports = { errorHandler, ApiError };