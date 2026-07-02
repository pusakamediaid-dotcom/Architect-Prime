'use strict';

const { v4: uuidv4 } = require('uuid');

class PaymentEntity {
  constructor({
    id = uuidv4(),
    orderId,
    customerId,
    amount,
    currency = 'IDR',
    method,
    provider = null,
    providerReference = null,
    status = 'pending',
    metadata = {},
    createdAt = new Date(),
    updatedAt = new Date(),
    completedAt = null,
    failedAt = null,
    refundedAt = null
  }) {
    this.id = id;
    this.orderId = orderId;
    this.customerId = customerId;
    this.amount = amount;
    this.currency = currency;
    this.method = method;
    this.provider = provider;
    this.providerReference = providerReference;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.completedAt = completedAt;
    this.failedAt = failedAt;
    this.refundedAt = refundedAt;
  }

  static create(props) {
    return new PaymentEntity(props);
  }

  initiate(provider, providerReference = null) {
    this.status = 'processing';
    this.provider = provider;
    this.providerReference = providerReference;
    this.updatedAt = new Date();
    return this;
  }

  complete() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.updatedAt = new Date();
    return this;
  }

  fail(reason) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.metadata.failureReason = reason;
    this.updatedAt = new Date();
    return this;
  }

  refund(amount = null) {
    if (this.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }
    this.status = 'refunded';
    this.refundedAt = new Date();
    this.metadata.refundAmount = amount || this.amount;
    this.updatedAt = new Date();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      customerId: this.customerId,
      amount: this.amount,
      currency: this.currency,
      method: this.method,
      provider: this.provider,
      providerReference: this.providerReference,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      failedAt: this.failedAt ? this.failedAt.toISOString() : null,
      refundedAt: this.refundedAt ? this.refundedAt.toISOString() : null
    };
  }
}

module.exports = PaymentEntity;