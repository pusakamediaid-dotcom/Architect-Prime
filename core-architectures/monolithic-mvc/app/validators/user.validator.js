'use strict';

const Joi = require('joi');

class UserValidator {
  static get createSchema() {
    return Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
      dateOfBirth: Joi.date().less('now').optional(),
      address: Joi.object({
        street: Joi.string().max(255).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional(),
        country: Joi.string().max(100).optional(),
        postalCode: Joi.string().max(20).optional()
      }).optional(),
      metadata: Joi.object().optional()
    });
  }

  static get updateSchema() {
    return Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
      dateOfBirth: Joi.date().less('now').optional(),
      address: Joi.object({
        street: Joi.string().max(255).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(100).optional(),
        country: Joi.string().max(100).optional(),
        postalCode: Joi.string().max(20).optional()
      }).optional(),
      metadata: Joi.object().optional()
    }).min(1);
  }

  static get loginSchema() {
    return Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });
  }

  static validate(schema, data) {
    return schema.validate(data, { abortEarly: false });
  }

  static validateCreate(data) {
    return this.validate(this.createSchema, data);
  }

  static validateUpdate(data) {
    return this.validate(this.updateSchema, data);
  }

  static validateLogin(data) {
    return this.validate(this.loginSchema, data);
  }
}

module.exports = UserValidator;