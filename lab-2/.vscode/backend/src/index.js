// src/index.js

const express = require('express');
const cors = require('cors'); // Підключаємо CORS
const postsRoutes = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes'); 
const logger = require('./middleware/logger');

const app = express();

// MIDDLEWARE
app.use(cors()); // Дозволяємо фронтенду робити запити сюди
app.use(express.json()); // Дозволяємо серверу читати JSON
app.use(logger); // Логування запитів

// МАРШРУТИ
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes); 

// ОБРОБКА НЕІСНУЮЧИХ МАРШРУТІВ (404)
app.use((req, res, next) => {
    res.status(404).json({ error: { message: "Маршрут не знайдено" } });
});

// ЦЕНТРАЛІЗОВАНА ОБРОБКА ПОМИЛОК
app.use((err, req, res, next) => {
    if (err.status) {
        return res.status(err.status).json({
            error: { 
                code: err.code, 
                message: err.message, 
                details: err.details 
            }
        });
    }
    
    console.error("Неочікувана помилка:", err);
    res.status(500).json({ error: { message: "Внутрішня помилка сервера" } });
});

// ЗАПУСК СЕРВЕРА
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер успішно запущено на порту ${PORT}`);
});