/**
 * User Controller
 * Handles user-related HTTP requests
 */

const User = require('../models/user.model');
const { validationResult } = require('express-validator');

class UserController {
  
  /**
   * Display user profile
   * GET /users/:id
   */
  async show(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).render('errors/404', {
          title: 'User Not Found',
          user: req.user
        });
      }
      
      res.render('users/profile', {
        title: `${user.name}'s Profile`,
        user: req.user,
        profileUser: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update user profile
   * PUT /users/:id
   */
  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        return res.redirect(`/users/${req.params.id}/edit`);
      }
      
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).render('errors/404', {
          title: 'User Not Found',
          user: req.user
        });
      }
      
      // Check authorization
      if (req.user.id !== user.id && req.user.role !== 'admin') {
        req.flash('error', 'Unauthorized access');
        return res.redirect('/');
      }
      
      await user.update({
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        // Add more fields as needed
      });
      
      req.flash('success', 'Profile updated successfully');
      res.redirect(`/users/${user.id}`);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * List all users (admin only)
   * GET /users
   */
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows: users } = await User.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] }
      });
      
      res.render('users/index', {
        title: 'All Users',
        user: req.user,
        users,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
