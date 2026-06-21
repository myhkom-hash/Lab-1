// src/repositories/users.repository.js
const { v4: uuidv4 } = require('uuid'); // Генерує ID на бекенді [cite: 918]

let users = []; // Дані зберігаємо в оперативній пам'яті [cite: 972]

class UsersRepository {
    getAll() { return users; }
    
    getById(id) { return users.find(u => u.id === id); }
    
    create(userData) {
        const newUser = { id: uuidv4(), ...userData, registeredAt: new Date().toISOString() };
        users.push(newUser);
        return newUser;
    }
    
    update(id, updateData) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...updateData };
        return users[index];
    }
    
    delete(id) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return false;
        users.splice(index, 1);
        return true;
    }
}

module.exports = new UsersRepository();