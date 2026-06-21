// src/controllers/notes.controller.js

const notesService = require('../services/notes.service');

class NotesController {
  async getMyNotes(req, res, next) {
    try {
      const result = await notesService.getMyNotes(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const note = await notesService.getNoteById(req.params.id, req.user.id);
      res.status(200).json({ data: note });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const note = await notesService.createNote(req.body, req.user.id);
      res.status(201).json({ data: note });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const note = await notesService.updateNote(req.params.id, req.body, req.user.id);
      res.status(200).json({ data: note });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await notesService.deleteNote(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotesController();
