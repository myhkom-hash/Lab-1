// src/services/posts.service.js
// Бізнес-логіка для операцій з постами
const postsRepo = require('../repositories/posts.repository');
const usersRepo = require('../repositories/users.repository');
const commentsService = require('./comments.service');
const { ApiError } = require('../middleware/errorHandler');
const { validateRequired, validateEnum, validatePositiveInteger, validateMaxLength, collectErrors } = require('../utils/validation');

const ALLOWED_CATEGORIES = ['Події', 'Навчання', 'Різне'];
const ALLOWED_STATUSES = ['draft', 'published'];

class PostsService {
  // Get posts with filtering, search, and pagination
  // Лаб 5 — Сценарій А: параметр search передається в репозиторій як є;

  async getAllPosts(query) {
    const items = await postsRepo.getAllPosts(query);
    return { items };
  }

  // Get post by ID
  async getPostById(id) {
    const post = await postsRepo.getPostById(id);
    if (!post) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }
    return post;
  }

  async createPost(dto) {
    const errors = collectErrors([
      validateRequired(dto.title, 'title', 3),
      validateRequired(dto.category, 'category'),
      validateEnum(dto.category, 'category', ALLOWED_CATEGORIES),
      validateRequired(dto.author, 'author', 2),
      validateRequired(dto.body, 'body', 5),
      validateMaxLength(dto.body, 'body', 1000),
      validatePositiveInteger(dto.userId, 'userId', 1),
      dto.status ? validateEnum(dto.status, 'status', ALLOWED_STATUSES) : null,
    ]);

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані поста', errors);
    }

    const user = await usersRepo.getUserById(dto.userId);
    if (!user) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Користувача не знайдено для поста', [
        { field: 'userId', message: 'Користувач не існує' },
      ]);
    }

    const safeData = {
      userId: Number(dto.userId),
      title: dto.title.trim(),
      category: dto.category.trim(),
      author: dto.author.trim(),
      body: dto.body.trim(),
      status: dto.status ? dto.status.trim().toLowerCase() : 'draft',
    };

    return postsRepo.createPost(safeData);
  }

  async createPostWithComment(dto) {
    const post = await this.createPost(dto);
    try {
      const comment = await commentsService.createComment({
        postId: post.id,
        userId: dto.userId,
        body: dto.commentBody ? String(dto.commentBody).trim() : 'Початковий коментар',
      });
      return { post, comment };
    } catch (error) {
      await postsRepo.deletePost(post.id);
      throw error;
    }
  }

  async getPostDetails(id) {
    const post = await postsRepo.getPostWithDetails(id);
    if (!post) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }
    return post;
  }

  // Update post
  async updatePost(id, dto) {
    const existing = await postsRepo.getPostById(id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }

    const errors = [];
    const updates = {};

    if ('title' in dto) {
      const err = validateRequired(dto.title, 'title', 3);
      if (err) errors.push(err);
      else updates.title = dto.title.trim();
    }

    if ('category' in dto) {
      const err = validateRequired(dto.category, 'category') || validateEnum(dto.category, 'category', ALLOWED_CATEGORIES);
      if (err) errors.push(err);
      else updates.category = dto.category.trim();
    }

    if ('author' in dto) {
      const err = validateRequired(dto.author, 'author', 2);
      if (err) errors.push(err);
      else updates.author = dto.author.trim();
    }

    if ('body' in dto) {
      const err = validateRequired(dto.body, 'body', 5) || validateMaxLength(dto.body, 'body', 1000);
      if (err) errors.push(err);
      else updates.body = dto.body.trim();
    }

    if ('status' in dto) {
      const err = validateEnum(dto.status, 'status', ALLOWED_STATUSES);
      if (err) errors.push(err);
      else updates.status = dto.status.trim().toLowerCase();
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані поста', errors);
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Потрібно вказати принаймні одне поле для оновлення');
    }

    const updated = await postsRepo.updatePost(id, updates);
    if (!updated) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }

    return updated;
  }

  async deletePost(id) {
    if (Number.isNaN(Number(id))) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректний ідентифікатор поста');
    }

    const success = await postsRepo.deletePost(id);
    if (!success) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }
  }
}

module.exports = new PostsService();