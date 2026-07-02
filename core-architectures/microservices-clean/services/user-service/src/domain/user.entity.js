/**
 * User Entity - Domain Layer
 * Core business logic for User
 */

class User {
  constructor({ id, name, email, password, role, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role || 'user';
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
  
  // Business methods
  isAdmin() {
    return this.role === 'admin';
  }
  
  canAccess(resource) {
    // Authorization logic
    if (this.isAdmin()) return true;
    // Add more rules as needed
    return true;
  }
  
  updateProfile(data) {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    this.updatedAt = new Date();
  }
  
  changePassword(newPassword) {
    this.password = newPassword;
    this.updatedAt = new Date();
  }
  
  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
