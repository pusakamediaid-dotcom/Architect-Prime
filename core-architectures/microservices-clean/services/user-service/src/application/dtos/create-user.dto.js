'use strict';

class CreateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone || null;
    this.dateOfBirth = data.dateOfBirth || null;
    this.address = data.address || null;
    this.role = data.role || 'user';
    this.metadata = data.metadata || {};
  }

  static fromRequest(body) {
    return new CreateUserDTO(body);
  }

  validate() {
    const errors = [];
    
    if (!this.name || this.name.length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }
    
    if (!this.password || this.password.length < 8) {
      errors.push('Password is required and must be at least 8 characters');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

class UpdateUserDTO {
  constructor(data) {
    this.name = data.name || null;
    this.phone = data.phone || null;
    this.dateOfBirth = data.dateOfBirth || null;
    this.address = data.address || null;
    this.avatar = data.avatar || null;
    this.metadata = data.metadata || null;
  }

  static fromRequest(body) {
    return new UpdateUserDTO(body);
  }

  hasUpdates() {
    return Object.values(this).some(v => v !== null);
  }
}

class UserResponseDTO {
  static fromEntity(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}

module.exports = { CreateUserDTO, UpdateUserDTO, UserResponseDTO };