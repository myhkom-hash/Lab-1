// src/routes/comments.routes.js
const express = require('express');
const commentsController = require('../controllers/comments.controller');

const router = express.Router();

router.get('/', commentsController.getAll.bind(commentsController));
router.get('/:id', commentsController.getById.bind(commentsController));
router.post('/', commentsController.create.bind(commentsController));
router.put('/:id', commentsController.update.bind(commentsController));
router.delete('/:id', commentsController.delete.bind(commentsController));

module.exports = router;
