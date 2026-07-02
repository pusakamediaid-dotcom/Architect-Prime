'use strict';

const { v4: uuidv4 } = require('uuid');

class OrderEntity {
  constructor({
    id = uuidv4(),
    customerId,
    items = [],
    status = 'pending',
    totalAmount = 0,
    currency = 'IDR',
    shippingAddress = null,
    billingAddress = null,
    paymentMethod = null,
    paymentStatus = 'pending',
    notes = '',
    metadata = {},
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.customerId = customerId;
    this.items = items;
    this.status = status;
    this.totalAmount = totalAmount;
    this.currency = currency;
    this.shippingAddress = shippingAddress;
    this.billingAddress = billingAddress;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.notes = notes;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props) {
    return new OrderEntity(props);
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    return this.totalAmount;
  }

  addItem(item) {
    const existingItem = this.items.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.items.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0
      });
    }
    this.calculateTotal();
    this.updatedAt = new Date();
    return this;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.calculateTotal();
    this.updatedAt = new Date();
    return this;
  }

  updateStatus(newStatus) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid order status: ${newStatus}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
    return this;
  }

  updatePaymentStatus(newPaymentStatus) {
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(newPaymentStatus)) {
      throw new Error(`Invalid payment status: ${newPaymentStatus}`);
    }
    this.paymentStatus = newPaymentStatus;
    this.updatedAt = new Date();
    return this;
  }

  cancel(reason = '') {
    this.status = 'cancelled';
    this.metadata.cancellationReason = reason;
    this.metadata.cancelledAt = new Date().toISOString();
    this.updatedAt = new Date();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      items: this.items,
      status: this.status,
      totalAmount: this.totalAmount,
      currency: this.currency,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      notes: this.notes,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

module.exports = OrderEntity;