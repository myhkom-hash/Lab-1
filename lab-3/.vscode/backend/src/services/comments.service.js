// src/services/comments.service.js
const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');
const postsRepo = require('../repositories/posts.repository');
const { ApiError } = require('../middleware/errorHandler');

class CommentsService {
  async getAllComments(query) {
    const items = await commentsRepo.getAllComments(query);
    return { items };
  }

  async getCommentById(id) {
    const comment = await commentsRepo.getCommentById(id);
    if (!comment) {
      throw new ApiError(404, 'NOT_FOUND', 'Коментар не знайдено');
    }
    return comment;
  }

  async createComment(dto) {
    const errors = [];
    if (!dto.postId || Number.isNaN(Number(dto.postId))) {
      errors.push({ field: 'postId', message: 'Потрібен коректний пост' });
    }
    if (!dto.userId || Number.isNaN(Number(dto.userId))) {
      errors.push({ field: 'userId', message: 'Потрібен коректний користувач' });
    }
    if (!dto.body || dto.body.trim().length < 3) {
      errors.push({ field: 'body', message: 'Текст коментаря має містити мінімум 3 символи' });
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані коментаря', errors);
    }

    const post = await postsRepo.getPostById(dto.postId);
    if (!post) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Пост не знайдено для коментаря', [
        { field: 'postId', message: 'Пост не існує' },
      ]);
    }

    const user = await usersRepo.getUserById(dto.userId);
    if (!user) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Користувача не знайдено для коментаря', [
        { field: 'userId', message: 'Користувач не існує' },
      ]);
    }

    const safeData = {
      postId: Number(dto.postId),
      userId: Number(dto.userId),
      body: dto.body.trim(),
    };

    return commentsRepo.createComment(safeData);
  }

  async updateComment(id, dto) {
    const existing = await commentsRepo.getCommentById(id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Коментар не знайдено');
    }

    const updates = {};
    if (dto.body) updates.body = dto.body.trim();

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Потрібно вказати принаймні одне поле для оновлення');
    }

    const updatedComment = await commentsRepo.updateComment(id, updates);
    if (!updatedComment) {
      throw new ApiError(404, 'NOT_FOUND', 'Коментар не знайдено');
    }
    return updatedComment;
  }

  async deleteComment(id) {
    const success = await commentsRepo.deleteComment(id);
    if (!success) {
      throw new ApiError(404, 'NOT_FOUND', 'Коментар не знайдено');
    }
  }
}

module.exports = new CommentsService();
