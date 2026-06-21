// src/services/posts.service.js
const postsRepo = require('../repositories/posts.repository');

class PostsService {
    getAllPosts() {
        // Забираємо пости з репозиторію
        const items = postsRepo.getAll();
        // Віддаємо у форматі { items: [...] }, як треба за умовою
        return { items };
    }

    createPost(dto) {
        // 1. Валідація даних (DTO)
        const errors = [];
        if (!dto.title || dto.title.trim() === "") {
            errors.push({ field: "title", message: "Заголовок обов'язковий" });
        }
        if (!dto.category) {
            errors.push({ field: "category", message: "Оберіть категорію" });
        }
        if (!dto.author || dto.author.trim() === "") {
            errors.push({ field: "author", message: "Вкажіть автора" });
        }
        if (!dto.body || dto.body.length < 5) {
            errors.push({ field: "body", message: "Текст має містити мінімум 5 символів" });
        }

        // Якщо є помилки, ми перервемо роботу і викинемо помилку
        if (errors.length > 0) {
            const error = new Error("Помилка валідації");
            error.status = 400;
            error.code = "VALIDATION_ERROR";
            error.details = errors;
            throw error;
        }

        // 2. Якщо все добре, передаємо дані в репозиторій для збереження
        const safeData = {
            title: dto.title.trim(),
            category: dto.category,
            author: dto.author.trim(),
            body: dto.body.trim()
        };

        return postsRepo.create(safeData);
    }

    deletePost(id) {
        const success = postsRepo.delete(id);
        if (!success) {
            const error = new Error("Пост не знайдено");
            error.status = 404;
            error.code = "NOT_FOUND";
            throw error;
        }
    }

    // Метод для оновлення поста
    updatePost(id, updateData) {
        // 1. Шукаємо індекс (порядковий номер) поста у нашому масиві за його ID
        // Примітка: 'posts' - це назва твого масиву з даними (може називатися інакше)
        const postIndex = posts.findIndex(post => post.id === id);

        // 2. Якщо такого поста немає (findIndex повернув -1)
        if (postIndex === -1) {
            // Створюємо помилку і передаємо її "вгору", щоб контролер віддав статус 404 (Не знайдено)
            const error = new Error("Пост з таким ID не знайдено");
            error.status = 404; 
            throw error;
        }

        // 3. Беремо старий пост зі "складу"
        const oldPost = posts[postIndex];

        // 4. Оновлюємо дані за допомогою "спреду" (трьох крапок ...)
        // Це магія JS: ми беремо всі поля старого поста і перезаписуємо їх новими полями з updateData
        const updatedPost = {
            ...oldPost,    // Розпаковуємо всі старі дані (id, title, category, author, body, createdAt)
            ...updateData  // Зверху накладаємо нові (наприклад, тільки новий title). Старі залишаються на місці!
        };

        // 5. Кладемо оновлений пост назад на "склад" (у масив)
        posts[postIndex] = updatedPost;

        // 6. Повертаємо оновлений результат митнику (контролеру)
        return updatedPost;
    }
}

module.exports = new PostsService();