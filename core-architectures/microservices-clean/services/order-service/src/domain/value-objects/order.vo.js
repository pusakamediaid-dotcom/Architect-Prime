'use strict';

class Money {
  constructor(amount, currency = 'IDR') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency;
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString() {
    return `${this.currency} ${this.amount.toLocaleString()}`;
  }
}

class OrderItem {
  constructor({ productId, name, price, quantity, discount = 0 }) {
    this.productId = productId;
    this.name = name;
    this.price = new Money(price);
    this.quantity = quantity;
    this.discount = new Money(discount);
  }

  getSubtotal() {
    return this.price.multiply(this.quantity).subtract(this.discount);
  }

  toJSON() {
    return {
      productId: this.productId,
      name: this.name,
      price: this.price.amount,
      quantity: this.quantity,
      discount: this.discount.amount
    };
  }
}

class ShippingAddress {
  constructor({ recipientName, phone, street, city, state, postalCode, country }) {
    this.recipientName = recipientName;
    this.phone = phone;
    this.street = street;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country || 'Indonesia';
  }

  toString() {
    return `${this.recipientName}\n${this.street}\n${this.city}, ${this.state} ${this.postalCode}\n${this.country}`;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = { Money, OrderItem, ShippingAddress };