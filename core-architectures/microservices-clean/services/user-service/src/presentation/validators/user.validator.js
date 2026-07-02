'use strict';

class UserValidator {
  static validateCreateUser(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain uppercase, lowercase, and number');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    if (data.dateOfBirth && new Date(data.dateOfBirth) >= new Date()) {
      errors.push('Date of birth must be in the past');
    }

    if (data.role && !['user', 'admin', 'moderator'].includes(data.role)) {
      errors.push('Invalid role');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateUser(data) {
    const errors = [];

    if (data.name !== undefined && data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (data.email !== undefined && !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (data.phone !== undefined && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    if (data.dateOfBirth !== undefined && new Date(data.dateOfBirth) >= new Date()) {
      errors.push('Date of birth must be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLogin(data) {
    const errors = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isValidPhone(phone) {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  }
}

module.exports = UserValidator;