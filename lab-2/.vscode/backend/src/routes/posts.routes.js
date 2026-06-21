// src/routes/posts.routes.js

// Підключаємо express
const express = require('express');
// Створюємо міні-додаток для маршрутів (Router)
const router = express.Router();
// Підключаємо наш контролер
const postsController = require('../controllers/posts.controller');

// Коли приходить GET-запит на базовий шлях (/api/posts), викликаємо метод getAll [cite: 284]
router.get('/', postsController.getAll);

// Коли приходить POST-запит (створення), викликаємо метод create [cite: 285]
router.post('/', postsController.create);

// Коли приходить DELETE-запит з параметром :id (наприклад /api/posts/123), викликаємо delete [cite: 274, 286]
router.delete('/:id', postsController.delete);

router.patch('/:id', postsController.update);

// Експортуємо налаштований роутер
module.exports = router;