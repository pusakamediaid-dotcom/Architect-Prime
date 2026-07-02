'use strict';

class MongoUserRepository {
  constructor(mongoClient) {
    this.collection = mongoClient.db('users').collection('users');
    this.indexes = [
      { key: { email: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { role: 1 } },
      { key: { createdAt: -1 } }
    ];
  }

  async initialize() {
    for (const index of this.indexes) {
      await this.collection.createIndex(index.key, { unique: index.unique || false });
    }
  }

  async save(user) {
    const document = {
      ...user.toJSON ? user.toJSON() : user,
      _id: user.id,
      createdAt: user.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    await this.collection.updateOne(
      { _id: document._id },
      { $set: document },
      { upsert: true }
    );
    
    return user;
  }

  async findById(id) {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email) {
    const doc = await this.collection.findOne({ email: email.toLowerCase() });
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    
    const skip = (page - 1) * limit;
    const docs = await this.collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await this.collection.countDocuments(filter);
    
    return {
      data: docs.map(doc => this.toEntity(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, updates) {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    return result ? this.toEntity(result) : null;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  toEntity(doc) {
    return {
      id: doc._id,
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      phone: doc.phone,
      dateOfBirth: doc.dateOfBirth,
      address: doc.address,
      role: doc.role,
      status: doc.status,
      emailVerified: doc.emailVerified,
      avatar: doc.avatar,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}

module.exports = MongoUserRepository;