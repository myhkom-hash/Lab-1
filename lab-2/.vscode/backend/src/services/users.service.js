// src/services/users.service.js
const usersRepo = require('../repositories/users.repository');
// Імпортуємо наш клас помилки з middleware
const { ApiError } = require('../middleware/errorHandler');

class UsersService {
    getAllUsers() {
        return { items: usersRepo.getAll() };
    }

    getUserById(id) {
        const user = usersRepo.getById(id);
        if (!user) throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено"); // Керована помилка [cite: 865, 866]
        return user;
    }

    createUser(dto) {
        const errors = [];
        // Перевірка обов'язкових полів (required) [cite: 979]
        if (!dto.name || dto.name.trim().length < 2) {
            errors.push({ field: "name", message: "Ім'я має містити мінімум 2 символи" }); // Перевірка довжин [cite: 983]
        }
        if (!dto.email || !dto.email.includes('@')) {
            errors.push({ field: "email", message: "Введіть коректний email" });
        }

        if (errors.length > 0) {
            // При помилці валідації повертаємо керовану помилку 400 Bad Request [cite: 831, 863, 864]
            throw new ApiError(400, "VALIDATION_ERROR", "Некоректні дані користувача", errors);
        }

        const safeData = {
            name: dto.name.trim(),
            email: dto.email.trim().toLowerCase()
        };

        return usersRepo.create(safeData);
    }

    updateUser(id, dto) {
        this.getUserById(id); // Перевіряємо, чи існує
        
        const safeUpdate = {};
        if (dto.name) safeUpdate.name = dto.name.trim();
        if (dto.email) safeUpdate.email = dto.email.trim().toLowerCase();

        return usersRepo.update(id, safeUpdate);
    }

    deleteUser(id) {
        const success = usersRepo.delete(id);
        if (!success) throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено");
    }
}

module.exports = new UsersService();