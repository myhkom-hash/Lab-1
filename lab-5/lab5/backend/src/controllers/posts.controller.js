// src/controllers/posts.controller.js
const postsService = require('../services/posts.service');

class PostsController {
  async getAll(req, res, next) {
    try {
      const result = await postsService.getAllPosts(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const post = await postsService.getPostById(req.params.id);
      res.status(200).json({ data: post });
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req, res, next) {
    try {
      const post = await postsService.getPostDetails(req.params.id);
      res.status(200).json({ data: post });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const dto = req.body;
      const newPost = await postsService.createPost(dto);
      res.status(201).json({ data: newPost });
    } catch (error) {
      next(error);
    }
  }

  async createWithComment(req, res, next) {
    try {
      const dto = req.body;
      const result = await postsService.createPostWithComment(dto);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedPost = await postsService.updatePost(req.params.id, req.body);
      res.status(200).json({ data: updatedPost });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await postsService.deletePost(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostsController();