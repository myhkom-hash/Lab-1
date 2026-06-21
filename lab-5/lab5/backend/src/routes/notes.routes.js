// src/routes/notes.routes.js
// Лаб 5 — Сценарій В: IDOR / Broken Access Control

const express = require('express');
const notesController = require('../controllers/notes.controller');
const { demoAuth } = require('../middleware/demoAuth');

const router = express.Router();

// demoAuth застосовується до всіх маршрутів цього роутера
router.use(demoAuth);

router.get('/', notesController.getMyNotes.bind(notesController));
router.get('/:id', notesController.getById.bind(notesController));
router.post('/', notesController.create.bind(notesController));
router.put('/:id', notesController.update.bind(notesController));
router.patch('/:id', notesController.update.bind(notesController));
router.delete('/:id', notesController.delete.bind(notesController));

module.exports = router;
