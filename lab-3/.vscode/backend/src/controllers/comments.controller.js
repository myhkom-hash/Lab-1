// src/controllers/comments.controller.js
const commentsService = require('../services/comments.service');

class CommentsController {
  async getAll(req, res, next) {
    try {
      const result = await commentsService.getAllComments(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const comment = await commentsService.getCommentById(req.params.id);
      res.status(200).json({ data: comment });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const dto = req.body;
      const comment = await commentsService.createComment(dto);
      res.status(201).json({ data: comment });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const comment = await commentsService.updateComment(req.params.id, req.body);
      res.status(200).json({ data: comment });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await commentsService.deleteComment(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentsController();
