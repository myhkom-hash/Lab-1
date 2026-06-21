// src/services/users.service.js

const usersRepo = require('../repositories/users.repository');
const { ApiError } = require('../middleware/errorHandler');
const { validateRequired, collectErrors } = require('../utils/validation');

class UsersService {
  async getAllUsers() {
    const items = await usersRepo.getAllUsers();
    return { items };
  }

  async getUsersCount() {
    const count = await usersRepo.getUsersCount();
    return { count };
  }

  async getUserById(id) {
    const user = await usersRepo.getUserById(id);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Користувача не знайдено');
    }
    return user;
  }

  async createUser(dto) {
    const errors = collectErrors([
      validateRequired(dto.name, 'name', 2)
    ]);

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані користувача', errors);
    }

    const name = dto.name.trim();
    const existingUser = await usersRepo.getUserByName(name);
    if (existingUser) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Користувач з таким іменем вже існує', [
        { field: 'name', message: 'Імя вже зайняте' },
      ]);
    }

    const safeData = { name };
    return usersRepo.createUser(safeData);
  }

  // Update user
  async updateUser(id, dto) {
    const user = await this.getUserById(id);

    const updateData = {};
    if (dto.name) {
      updateData.name = dto.name.trim();
      const existingUser = await usersRepo.getUserByName(updateData.name);
      if (existingUser && existingUser.id !== user.id) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Користувач з таким іменем вже існує', [
          { field: 'name', message: 'Імя вже зайняте' },
        ]);
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Потрібно вказати хоча б одне поле для оновлення');
    }

    return usersRepo.updateUser(id, updateData);
  }

  // Delete user
  async deleteUser(id) {
    const success = await usersRepo.deleteUser(id);
    if (!success) {
      throw new ApiError(404, 'NOT_FOUND', 'Користувача не знайдено');
    }
  }
}

module.exports = new UsersService();