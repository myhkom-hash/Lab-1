// src/services/posts.service.js
const postsRepo = require('../repositories/posts.repository');
const usersRepo = require('../repositories/users.repository');
const commentsService = require('./comments.service');
const { ApiError } = require('../middleware/errorHandler');

const ALLOWED_CATEGORIES = ['Події', 'Навчання', 'Різне'];

class PostsService {
  async getAllPosts(query) {
    const items = await postsRepo.getAllPosts(query);
    return { items };
  }

  async getPostById(id) {
    const post = await postsRepo.getPostById(id);
    if (!post) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }
    return post;
  }

  async createPost(dto) {
    const errors = [];
    const title = dto.title ? dto.title.trim() : '';
    const category = dto.category ? dto.category.trim() : '';
    const author = dto.author ? dto.author.trim() : '';
    const body = dto.body ? dto.body.trim() : '';
    const userIdString = dto.userId !== undefined && dto.userId !== null ? String(dto.userId).trim() : '';

    if (!title) {
      errors.push({ field: 'title', message: "Заголовок обов'язковий" });
    }
    if (!category) {
      errors.push({ field: 'category', message: 'Оберіть категорію' });
    } else if (!ALLOWED_CATEGORIES.includes(category)) {
      errors.push({ field: 'category', message: `Категорія має бути однією з: ${ALLOWED_CATEGORIES.join(', ')}` });
    }
    if (!author) {
      errors.push({ field: 'author', message: 'Вкажіть автора' });
    }
    if (!body || body.length < 5) {
      errors.push({ field: 'body', message: 'Текст має містити мінімум 5 символів' });
    }
    if (!userIdString || !/^[0-9]+$/.test(userIdString)) {
      errors.push({ field: 'userId', message: 'ID користувача має містити лише цифри' });
    }

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
      userId: Number(userIdString),
      title,
      category,
      author,
      body,
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

  async updatePost(id, dto) {
    const existing = await postsRepo.getPostById(id);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Пост не знайдено');
    }

    const errors = [];
    const updates = {};

    if ('title' in dto) {
      const title = dto.title ? dto.title.trim() : '';
      if (!title) {
        errors.push({ field: 'title', message: "Заголовок обов'язковий" });
      } else {
        updates.title = title;
      }
    }

    if ('category' in dto) {
      const category = dto.category ? dto.category.trim() : '';
      if (!category) {
        errors.push({ field: 'category', message: 'Оберіть категорію' });
      } else if (!ALLOWED_CATEGORIES.includes(category)) {
        errors.push({ field: 'category', message: `Категорія має бути однією з: ${ALLOWED_CATEGORIES.join(', ')}` });
      } else {
        updates.category = category;
      }
    }

    if ('author' in dto) {
      const author = dto.author ? dto.author.trim() : '';
      if (!author) {
        errors.push({ field: 'author', message: 'Вкажіть автора' });
      } else {
        updates.author = author;
      }
    }

    if ('body' in dto) {
      const body = dto.body ? dto.body.trim() : '';
      if (!body || body.length < 5) {
        errors.push({ field: 'body', message: 'Текст має містити мінімум 5 символів' });
      } else {
        updates.body = body;
      }
    }

    if ('status' in dto) {
      updates.status = dto.status ? dto.status.trim().toLowerCase() : '';
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