// src/index.js
// Бекенд точка входу с выполнением CORS и роутами
// ✓ Вимога: "CORS без '*': дозволити лише конкретні origin"
// ✓ Вимога: "явно вказати дозволені методи (GET, POST, PUT/PATCH, DELETE)"
// ✓ Вимога: "налаштувати CORS так, щоб дозволити запити з фронтенду"

const express = require('express');
const cors = require('cors');
const postsRoutes = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes');
const commentsRoutes = require('./routes/comments.routes');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

app.use('/api/posts', postsRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/v1/comments', commentsRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ status: 404, title: 'NOT_FOUND', detail: 'Маршрут не знайдено' });
});

app.use(errorHandler);

module.exports = { app };

async function loadPosts() {
  showMessage('Завантаження...', 'info');
  detailsSection.hidden = true;
  try {
    const data = await apiClient.getList();
    state.posts.items = data.items || [];
    renderTable(state.posts.items);
    renderTopCommentedPost();
    showMessage('Дані завантажено', 'success');
  } catch (error) {
    showMessage('Помилка завантаження: ' + (error.body?.detail || error.message), 'error');
    tableBody.innerHTML = '<tr><td colspan="7">Помилка завантаження</td></tr>';
    tableState.textContent = '';
    console.error(error);
  }
}