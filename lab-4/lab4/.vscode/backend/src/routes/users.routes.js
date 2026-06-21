// src/routes/users.routes.js
const express = require('express');
const usersController = require('../controllers/users.controller');

const router = express.Router();

// ✅ НОВИЙ МАРШРУТ: статистика — кількість користувачів (має бути ДО /:id, щоб "stats" не сприймалось як id)
router.get('/stats/count', usersController.getCount.bind(usersController));

router.get('/', usersController.getAll.bind(usersController));
router.get('/:id', usersController.getById.bind(usersController));
router.post('/', usersController.create.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));

module.exports = router;