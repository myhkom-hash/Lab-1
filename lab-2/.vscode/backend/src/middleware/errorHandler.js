// src/middleware/errorHandler.js

// Клас для керованих помилок API
class ApiError extends Error {
    constructor(status, code, message, details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// Експортуємо клас, щоб сервіси могли його використовувати
module.exports = { ApiError };