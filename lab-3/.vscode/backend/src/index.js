// src/index.js

const express = require('express');
const cors = require('cors');
const postsRoutes = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes');
const commentsRoutes = require('./routes/comments.routes');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Маршрут не знайдено' } });
});

app.use(errorHandler);

module.exports = { app };
