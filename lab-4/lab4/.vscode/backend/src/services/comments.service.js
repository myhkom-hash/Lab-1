// src/services/comments.service.js
// Handles business logic for comment operations: validation, existence checks for post/user, and repository calls.

const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');
const postsRepo = require('../repositories/posts.repository');
const { ApiError } = require('../middleware/errorHandler');
const { validateRequired, validatePositiveInteger, collectErrors } = require('../utils/validation');

class CommentsService {
  // Get comments with filtering
  async getAllComments(query) {
    const items = await commentsRepo.getAllComments(query);
    return { items };
  }

  // ✅ НОВИЙ МЕТОД: повертає пост з найбільшою кількістю коментарів (обчислено на бекенді)
  async getTopCommentedPost() {
    const post = await commentsRepo.getTopCommentedPost();
    // post може бути null якщо коментарів немає взагалі
    return { data: post || null };
  }

  // Get comment by ID with existence check
  async getCommentById(id) {
    const comment = await commentsRepo.getCommentById(id);
    if (!comment) {
      throw new ApiError(404, 'NOT_FOUND', 'Коментар не знайдено');
    }
    return comment;
  }

  // Create comment with validation and existence checks
  async createComment(dto) {
    const errors = collectErrors([
      validatePositiveInteger(dto.postId, 'postId'),
      validatePositiveInteger(dto.userId, 'userId'),
      validateRequired(dto.body, 'body', 3)
    ]);

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