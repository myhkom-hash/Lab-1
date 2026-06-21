// src/repositories/posts.repository.js
const { v4: uuidv4 } = require('uuid'); // Бібліотека для генерації унікальних ID

// Тут будуть зберігатися наші пости на сервері (поки він працює)
let posts = [];

class PostsRepository {
    getAll() {
        return posts; // Повертає всі пости
    }
    
    getById(id) {
        return posts.find(p => p.id === id); // Шукає пост за ID
    }
    
    create(postData) {
        // Створюємо новий об'єкт: генеруємо ID, додаємо дані від користувача і дату
        const newPost = { 
            id: uuidv4(), 
            ...postData, 
            createdAt: new Date().toLocaleString() 
        };
        posts.push(newPost); // Зберігаємо в масив
        return newPost;
    }
    
    update(id, updateData) {
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        // Оновлюємо пост: беремо старі дані і перезаписуємо новими
        posts[index] = { ...posts[index], ...updateData };
        return posts[index];
    }
    
    delete(id) {
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        posts.splice(index, 1); // Видаляємо з масиву
        return true;
    }
}

module.exports = new PostsRepository();