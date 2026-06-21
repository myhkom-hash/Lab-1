// src/services/users.service.js
const usersRepo = require('../repositories/users.repository');
const { ApiError } = require('../middleware/errorHandler');

class UsersService {
  async getAllUsers() {
    const items = await usersRepo.getAllUsers();
    return { items };
  }

  async getUserById(id) {
    const user = await usersRepo.getUserById(id);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Користувача не знайдено');
    }
    return user;
  }

  async createUser(dto) {
    const errors = [];
    if (!dto.name || dto.name.trim().length < 2) {
      errors.push({ field: 'name', message: "Ім'я має містити мінімум 2 символи" });
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані користувача', errors);
    }

    const safeData = {
      name: dto.name.trim(),
    };

    return usersRepo.createUser(safeData);
  }

  async updateUser(id, dto) {
    await this.getUserById(id);

    const updateData = {};
    if (dto.name) updateData.name = dto.name.trim();

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Потрібно вказати хоча б одне поле для оновлення');
    }

    return usersRepo.updateUser(id, updateData);
  }

  async deleteUser(id) {
    const success = await usersRepo.deleteUser(id);
    if (!success) {
      throw new ApiError(404, 'NOT_FOUND', 'Користувача не знайдено');
    }
  }
}

module.exports = new UsersService();