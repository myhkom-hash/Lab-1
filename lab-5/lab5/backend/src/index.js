// src/index.js
// Бекенд точка входу

const express = require('express');
const cors = require('cors');
const path = require('path');
const postsRoutes = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes');
const commentsRoutes = require('./routes/comments.routes');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { securityHeaders } = require('./middleware/securityHeaders');
const notesRoutes = require('./routes/notes.routes');

// app оголошується ПЕРЕД використанням (раніше був баг: app.use до const app)
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
];

const corsOptions = {
  origin(origin, callback) {
    if (
      origin === undefined ||
      origin === null ||
      origin === 'null' ||
      allowedOrigins.includes(origin) ||
      (typeof origin === 'string' && /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-UserId'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Лаб 5 — Сценарій Г: Security Misconfiguration

app.use(securityHeaders);
app.use(logger);

// Роздача статичних файлів фронтенду (з правильного шляху)
app.use(express.static(path.join(__dirname, '../../frontend')));

app.use('/api/posts', postsRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/v1/comments', commentsRoutes);
// Лаб 5 — Сценарій В: IDOR (захищено demoAuth middleware)
app.use('/api/notes', notesRoutes);
app.use('/api/v1/notes', notesRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ status: 404, title: 'NOT_FOUND', detail: 'Маршрут не знайдено' });
});

app.use(errorHandler);

module.exports = { app };
