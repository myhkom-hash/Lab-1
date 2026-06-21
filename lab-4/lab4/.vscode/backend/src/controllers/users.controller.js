// src/controllers/users.controller.js
const usersService = require('../services/users.service');

class UsersController {
  async getAll(req, res, next) {
    try {
      const result = await usersService.getAllUsers();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getCount(req, res, next) {
    try {
      const result = await usersService.getUsersCount();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await usersService.getUserById(req.params.id);
      res.status(200).json({ data: user });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const newUser = await usersService.createUser(req.body);
      res.status(201).json({ data: newUser });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updatedUser = await usersService.updateUser(req.params.id, req.body);
      res.status(200).json({ data: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await usersService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsersController();