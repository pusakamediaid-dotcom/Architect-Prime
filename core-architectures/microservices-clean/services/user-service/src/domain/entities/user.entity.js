'use strict';

const { v4: uuidv4 } = require('uuid');

class UserEntity {
  constructor({
    id = uuidv4(),
    name,
    email,
    passwordHash,
    phone = null,
    dateOfBirth = null,
    address = null,
    role = 'user',
    status = 'active',
    emailVerified = false,
    avatar = null,
    metadata = {},
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.phone = phone;
    this.dateOfBirth = dateOfBirth;
    this.address = address;
    this.role = role;
    this.status = status;
    this.emailVerified = emailVerified;
    this.avatar = avatar;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props) {
    return new UserEntity(props);
  }

  updateProfile(data) {
    if (data.name) this.name = data.name;
    if (data.phone) this.phone = data.phone;
    if (data.dateOfBirth) this.dateOfBirth = data.dateOfBirth;
    if (data.address) this.address = { ...this.address, ...data.address };
    if (data.avatar) this.avatar = data.avatar;
    if (data.metadata) this.metadata = { ...this.metadata, ...data.metadata };
    this.updatedAt = new Date();
    return this;
  }

  verifyEmail() {
    this.emailVerified = true;
    this.updatedAt = new Date();
    return this;
  }

  changeStatus(newStatus) {
    const validStatuses = ['active', 'inactive', 'suspended', 'banned'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
    return this;
  }

  changePassword(newPasswordHash) {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      address: this.address,
      role: this.role,
      status: this.status,
      emailVerified: this.emailVerified,
      avatar: this.avatar,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validate() {
    const errors = [];
    
    if (!this.name || this.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }
    
    if (!this.passwordHash) {
      errors.push('Password is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = UserEntity;