// src/controllers/posts.controller.js

// Підключаємо наш сервіс, де лежить уся логіка
const postsService = require('../services/posts.service');

class PostsController {
    
    // Метод для отримання всіх постів (GET /api/posts)
    getAll(req, res, next) {
        try {
            // Викликаємо метод сервісу, який поверне { items: [...] }
            const result = postsService.getAllPosts();
            // Відправляємо успішний статус 200 (OK) і дані у форматі JSON [cite: 217, 219]
            res.status(200).json(result);
        } catch (error) { 
            // Якщо щось пішло не так, передаємо помилку далі в центральний обробник
            next(error); 
        }
    }

    // Метод для створення нового поста (POST /api/posts)
    create(req, res, next) {
         try {
             // req.body містить дані, які клієнт надіслав у форматі JSON (DTO)
             const dto = req.body;

            // --- НАША НОВА ПЕРЕВІРКА ПОЧИНАЄТЬСЯ ТУТ ---
            // 1. Створюємо список дозволених категорій
            const allowedCategories = ["Навчання", "Події", "Різне"];

            // 2. Перевіряємо, чи входить категорія, яку нам прислали (dto.category), у наш список
            if (!allowedCategories.includes(dto.category)) {
                // 3. Якщо ні — б'ємо на сполох і повертаємо статус 400 (Поганий запит)
                    return res.status(400).json({
                    error: { 
                    message: "Помилка: Можна використовувати лише категорії: Навчання, Події, Різне!" 
                    }
                });
            }
            // --- НАША НОВА ПЕРЕВІРКА ЗАКІНЧУЄТЬСЯ ТУТ ---

            // Якщо код дійшов сюди, значить категорія правильна! 
            // Сервіс створює пост
            const newPost = postsService.createPost(dto);
            
            // Відправляємо статус 201 і сам створений об'єкт
            res.status(201).json(newPost);
        } catch (error) { 
         next(error); 
        }
    }

    // Метод для видалення поста (DELETE /api/posts/:id)
    delete(req, res, next) {
    try {
        const id = req.params.id;

            // --- НАША ВАЛІДАЦІЯ DELETE ---
            // Припустимо, що справжній ID (uuid) завжди довший за 10 символів.
            // Якщо нам прислали щось коротке або пусте — відбиваємо запит.
            if (!id || id.length < 10) {
                return res.status(400).json({
                    error: { message: "Помилка: Недійсний формат ID!" }
                });
            }
            // ------------------------------

        postsService.deletePost(id);
         res.status(204).send();
        } catch (error) { 
         next(error); 
        }
     }

     // Метод для часткового оновлення поста (PATCH /api/posts/:id)
    update(req, res, next) {
        try {
            const id = req.params.id;
            const dto = req.body; // Тут лежать поля, які клієнт хоче змінити

            // --- НАША ВАЛІДАЦІЯ PATCH ---

            // 1. Перевіряємо категорію (ЯКЩО її намагаються змінити)
            // dto.category означає "Якщо в об'єкті dto є поле category"
            if (dto.category) {
                const allowedCategories = ["Навчання", "Події", "Різне"];
                if (!allowedCategories.includes(dto.category)) {
                    return res.status(400).json({
                        error: { message: "Помилка: Невідома категорія при оновленні!" }
                    });
                }
            }

            // 2. Перевіряємо заголовок (ЯКЩО його намагаються змінити)
            // dto.title !== undefined означає "Якщо поле title взагалі прислали"
            if (dto.title !== undefined) {
                // .trim() забирає пробіли по краях. Якщо після цього текст пустий - помилка.
                if (dto.title.trim() === "") {
                    return res.status(400).json({
                        error: { message: "Помилка: Заголовок не може бути пустим!" }
                    });
                }
            }

            // 3. Аналогічно можна перевірити довжину тексту поста
            if (dto.body !== undefined && dto.body.length < 5) {
                return res.status(400).json({
                    error: { message: "Помилка: Текст має містити мінімум 5 символів!" }
                });
            }
            // ------------------------------

            // Якщо всі перевірки пройдені, передаємо дані в сервіс для оновлення
            // (У тебе в posts.service.js має бути створена функція updatePost)
            const updatedPost = postsService.updatePost(id, dto);
            
            // Відправляємо успішний статус 200 і оновлений пост
            res.status(200).json(updatedPost);
        } catch (error) {
            next(error);
        }
    }
}

// Експортуємо готовий об'єкт контролера
module.exports = new PostsController();