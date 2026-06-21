// src/services/notes.service.js
// Лаб 5 — Сценарій В: IDOR / Broken Access Control

const notesRepo = require('../repositories/notes.repository');
const { ApiError } = require('../middleware/errorHandler');
const { validateRequired, validateMaxLength, collectErrors } = require('../utils/validation');

class NotesService {
  async getMyNotes(currentUserId) {
    const items = await notesRepo.getNotesByOwner(currentUserId);
    return { items };
  }

  async getNoteById(id, currentUserId) {
    // перевірка власника на рівні репозиторію
    const note = await notesRepo.getNoteByIdAndOwner(id, currentUserId);
    if (!note) {
      // Повертаємо 404, а не 403
      throw new ApiError(404, 'NOT_FOUND', 'Нотатку не знайдено');
    }
    return note;
  }

  async createNote(dto, currentUserId) {
    const errors = collectErrors([
      validateRequired(dto.title, 'title', 2),
      validateMaxLength(dto.title, 'title', 200),
      validateRequired(dto.content, 'content', 3),
      validateMaxLength(dto.content, 'content', 2000),
    ]);

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані нотатки', errors);
    }

    return notesRepo.createNote({
      ownerUserId: currentUserId,
      title: dto.title.trim(),
      content: dto.content.trim(),
    });
  }

  async updateNote(id, dto, currentUserId) {
    // Перевіряємо спочатку, чи нотатка взагалі існує і чи належить цьому користувачу
    const existing = await notesRepo.getNoteByIdAndOwner(id, currentUserId);
    if (!existing) {
      throw new ApiError(404, 'NOT_FOUND', 'Нотатку не знайдено');
    }

    const updates = {};
    const errors = [];

    if ('title' in dto) {
      const err = validateRequired(dto.title, 'title', 2) || validateMaxLength(dto.title, 'title', 200);
      if (err) errors.push(err);
      else updates.title = dto.title.trim();
    }

    if ('content' in dto) {
      const err = validateRequired(dto.content, 'content', 3) || validateMaxLength(dto.content, 'content', 2000);
      if (err) errors.push(err);
      else updates.content = dto.content.trim();
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані нотатки', errors);
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Потрібно вказати хоча б одне поле для оновлення');
    }

    const updated = await notesRepo.updateNote(id, currentUserId, updates);
    if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Нотатку не знайдено');
    return updated;
  }

  async deleteNote(id, currentUserId) {
    const deleted = await notesRepo.deleteNote(id, currentUserId);
    if (!deleted) {
      throw new ApiError(404, 'NOT_FOUND', 'Нотатку не знайдено');
    }
  }
}

module.exports = new NotesService();
