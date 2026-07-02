'use strict';

class UserTransformer {
  static transformForList(users, meta = {}) {
    return {
      data: users.map(user => this.transformForShow(user)),
      meta: {
        total: meta.total || users.length,
        page: meta.page || 1,
        limit: meta.limit || users.length,
        totalPages: meta.totalPages || 1
      }
    };
  }

  static transformForShow(user) {
    if (!user) return null;
    return {
      id: user._id || user.id,
      type: 'user',
      attributes: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
        address: user.address || null,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null
      }
    };
  }

  static transformForPublic(user) {
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null
    };
  }

  static transformRelationship(user, relationships = []) {
    const transformed = this.transformForShow(user);
    transformed.relationships = {};
    
    for (const rel of relationships) {
      if (user[rel.name]) {
        transformed.relationships[rel.name] = {
          data: Array.isArray(user[rel.name]) 
            ? user[rel.name].map(item => ({ id: item._id || item.id, type: rel.type }))
            : { id: user[rel.name]._id || user[rel.name].id, type: rel.type }
        };
      }
    }
    
    return transformed;
  }
}

module.exports = UserTransformer;