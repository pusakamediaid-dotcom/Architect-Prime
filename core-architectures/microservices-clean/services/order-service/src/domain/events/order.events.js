'use strict';

class OrderCreatedEvent {
  constructor(order) {
    this.eventType = 'OrderCreatedEvent';
    this.orderId = order.id;
    this.customerId = order.customerId;
    this.totalAmount = order.totalAmount;
    this.currency = order.currency;
    this.items = order.items;
    this.timestamp = new Date().toISOString();
  }
}

class OrderUpdatedEvent {
  constructor(order, changes) {
    this.eventType = 'OrderUpdatedEvent';
    this.orderId = order.id;
    this.customerId = order.customerId;
    this.changes = changes;
    this.timestamp = new Date().toISOString();
  }
}

class OrderCancelledEvent {
  constructor(order, reason) {
    this.eventType = 'OrderCancelledEvent';
    this.orderId = order.id;
    this.customerId = order.customerId;
    this.reason = reason;
    this.refundRequired = order.paymentStatus === 'completed';
    this.timestamp = new Date().toISOString();
  }
}

class OrderStatusChangedEvent {
  constructor(order, previousStatus, newStatus) {
    this.eventType = 'OrderStatusChangedEvent';
    this.orderId = order.id;
    this.customerId = order.customerId;
    this.previousStatus = previousStatus;
    this.newStatus = newStatus;
    this.timestamp = new Date().toISOString();
  }
}

class PaymentCompletedEvent {
  constructor(orderId, paymentId, amount) {
    this.eventType = 'PaymentCompletedEvent';
    this.orderId = orderId;
    this.paymentId = paymentId;
    this.amount = amount;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderCancelledEvent,
  OrderStatusChangedEvent,
  PaymentCompletedEvent
};