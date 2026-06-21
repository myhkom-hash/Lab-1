// src/routes/posts.routes.js
const express = require('express');
const postsController = require('../controllers/posts.controller');

const router = express.Router();

router.get('/', postsController.getAll.bind(postsController));
router.get('/:id/details', postsController.getDetails.bind(postsController));
router.get('/:id', postsController.getById.bind(postsController));
router.post('/', postsController.create.bind(postsController));
router.post('/with-comment', postsController.createWithComment.bind(postsController));
router.put('/:id', postsController.update.bind(postsController));
router.patch('/:id', postsController.update.bind(postsController));
router.delete('/:id', postsController.delete.bind(postsController));

module.exports = router;