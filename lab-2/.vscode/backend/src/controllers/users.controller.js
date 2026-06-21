// src/controllers/users.controller.js
const usersService = require('../services/users.service');

class UsersController {
    getAll(req, res, next) {
        try {
            res.status(200).json(usersService.getAllUsers()); // 200 OK - успішне читання [cite: 920]
        } catch (err) { next(err); }
    }

    getById(req, res, next) {
        try {
            res.status(200).json(usersService.getUserById(req.params.id));
        } catch (err) { next(err); }
    }

    create(req, res, next) {
        try {
            const newUser = usersService.createUser(req.body);
            res.status(201).json(newUser); // 201 Created - успішне створення [cite: 922]
        } catch (err) { next(err); }
    }

    update(req, res, next) {
        try {
            const updatedUser = usersService.updateUser(req.params.id, req.body);
            res.status(200).json(updatedUser);
        } catch (err) { next(err); }
    }

    delete(req, res, next) {
        try {
            usersService.deleteUser(req.params.id);
            res.status(204).send(); // 204 No Content - успішне видалення [cite: 923]
        } catch (err) { next(err); }
    }
}

module.exports = new UsersController();