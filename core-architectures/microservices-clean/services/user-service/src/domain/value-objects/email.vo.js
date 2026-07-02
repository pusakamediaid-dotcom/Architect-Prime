'use strict';

class Email {
  constructor(address) {
    if (!Email.isValid(address)) {
      throw new Error(`Invalid email address: ${address}`);
    }
    this.address = address.toLowerCase();
  }

  static isValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other) {
    return this.address === other.address;
  }

  toString() {
    return this.address;
  }

  getDomain() {
    return this.address.split('@')[1];
  }

  getLocal() {
    return this.address.split('@')[0];
  }
}

class PhoneNumber {
  constructor(number, countryCode = '+62') {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 8 || cleaned.length > 15) {
      throw new Error(`Invalid phone number: ${number}`);
    }
    this.number = cleaned;
    this.countryCode = countryCode;
  }

  static isValid(number) {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 8 && cleaned.length <= 15;
  }

  toInternational() {
    return `${this.countryCode}${this.number}`;
  }

  toString() {
    return this.toInternational();
  }
}

class Address {
  constructor({ street, city, state, country, postalCode }) {
    this.street = street || '';
    this.city = city || '';
    this.state = state || '';
    this.country = country || '';
    this.postalCode = postalCode || '';
  }

  isComplete() {
    return !!(this.street && this.city && this.country && this.postalCode);
  }

  toString() {
    return [this.street, this.city, this.state, this.postalCode, this.country]
      .filter(part => part)
      .join(', ');
  }

  toJSON() {
    return {
      street: this.street,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode
    };
  }
}

module.exports = { Email, PhoneNumber, Address };