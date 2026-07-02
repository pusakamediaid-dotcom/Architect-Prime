'use strict';

class CreateOrderDTO {
  constructor(data) {
    this.customerId = data.customerId;
    this.items = data.items || [];
    this.shippingAddress = data.shippingAddress || null;
    this.billingAddress = data.billingAddress || null;
    this.paymentMethod = data.paymentMethod || 'bank_transfer';
    this.notes = data.notes || '';
    this.currency = data.currency || 'IDR';
    this.metadata = data.metadata || {};
  }

  static fromRequest(body) {
    return new CreateOrderDTO(body);
  }

  validate() {
    const errors = [];

    if (!this.customerId) {
      errors.push('Customer ID is required');
    }

    if (!this.items || this.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      this.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`Item ${index + 1}: Product ID is required`);
        }
        if (!item.name) {
          errors.push(`Item ${index + 1}: Name is required`);
        }
        if (!item.price || item.price <= 0) {
          errors.push(`Item ${index + 1}: Valid price is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
      });
    }

    if (!this.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      if (!this.shippingAddress.recipientName) {
        errors.push('Recipient name is required in shipping address');
      }
      if (!this.shippingAddress.phone) {
        errors.push('Phone is required in shipping address');
      }
      if (!this.shippingAddress.street) {
        errors.push('Street address is required');
      }
      if (!this.shippingAddress.city) {
        errors.push('City is required');
      }
      if (!this.shippingAddress.postalCode) {
        errors.push('Postal code is required');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

class UpdateOrderStatusDTO {
  constructor(data) {
    this.status = data.status;
    this.notes = data.notes || '';
  }

  static fromRequest(body) {
    return new UpdateOrderStatusDTO(body);
  }

  validate() {
    const errors = [];
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!this.status) {
      errors.push('Status is required');
    } else if (!validStatuses.includes(this.status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }
}

class OrderResponseDTO {
  static fromEntity(order) {
    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }

  static fromList(orders, meta = {}) {
    return {
      data: orders.map(order => this.fromEntity(order)),
      meta: {
        total: meta.total || orders.length,
        page: meta.page || 1,
        limit: meta.limit || orders.length,
        totalPages: meta.totalPages || 1
      }
    };
  }
}

module.exports = { CreateOrderDTO, UpdateOrderStatusDTO, OrderResponseDTO };