'use strict';

class PaymentInitiatedEvent {
  constructor(payment) {
    this.eventType = 'PaymentInitiatedEvent';
    this.paymentId = payment.id;
    this.orderId = payment.orderId;
    this.customerId = payment.customerId;
    this.amount = payment.amount;
    this.currency = payment.currency;
    this.method = payment.method;
    this.provider = payment.provider;
    this.timestamp = new Date().toISOString();
  }
}

class PaymentCompletedEvent {
  constructor(payment) {
    this.eventType = 'PaymentCompletedEvent';
    this.paymentId = payment.id;
    this.orderId = payment.orderId;
    this.customerId = payment.customerId;
    this.amount = payment.amount;
    this.currency = payment.currency;
    this.provider = payment.provider;
    this.providerReference = payment.providerReference;
    this.timestamp = new Date().toISOString();
  }
}

class PaymentFailedEvent {
  constructor(payment, reason) {
    this.eventType = 'PaymentFailedEvent';
    this.paymentId = payment.id;
    this.orderId = payment.orderId;
    this.customerId = payment.customerId;
    this.reason = reason;
    this.timestamp = new Date().toISOString();
  }
}

class PaymentRefundedEvent {
  constructor(payment) {
    this.eventType = 'PaymentRefundedEvent';
    this.paymentId = payment.id;
    this.orderId = payment.orderId;
    this.customerId = payment.customerId;
    this.amount = payment.amount;
    this.refundAmount = payment.metadata.refundAmount;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = {
  PaymentInitiatedEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent
};