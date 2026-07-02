'use strict';

const OrderEntity = require('../../domain/entities/order.entity');
const { OrderCreatedEvent } = require('../../domain/events/order.events');

class CreateOrderUseCase {
  constructor(orderRepository, messagingService, cacheService) {
    this.orderRepository = orderRepository;
    this.messagingService = messagingService;
    this.cacheService = cacheService;
  }

  async execute(createOrderDTO) {
    const order = OrderEntity.create({
      customerId: createOrderDTO.customerId,
      items: createOrderDTO.items,
      shippingAddress: createOrderDTO.shippingAddress,
      billingAddress: createOrderDTO.billingAddress || createOrderDTO.shippingAddress,
      paymentMethod: createOrderDTO.paymentMethod,
      notes: createOrderDTO.notes || '',
      currency: createOrderDTO.currency || 'IDR',
      metadata: createOrderDTO.metadata || {}
    });

    order.calculateTotal();

    if (order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const savedOrder = await this.orderRepository.save(order);

    await this.cacheService.invalidate(`customer:${createOrderDTO.customerId}:orders`);

    const event = new OrderCreatedEvent(savedOrder);
    await this.messagingService.publish('order.events', event);

    return savedOrder;
  }
}

class GetOrderUseCase {
  constructor(orderRepository, cacheService) {
    this.orderRepository = orderRepository;
    this.cacheService = cacheService;
  }

  async execute(orderId, customerId = null) {
    const cacheKey = `order:${orderId}`;
    const cachedOrder = await this.cacheService.get(cacheKey);
    
    if (cachedOrder) {
      return cachedOrder;
    }

    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (customerId && order.customerId !== customerId) {
      throw new Error('Access denied');
    }

    await this.cacheService.set(cacheKey, order, 300);
    return order;
  }
}

class CancelOrderUseCase {
  constructor(orderRepository, messagingService, cacheService) {
    this.orderRepository = orderRepository;
    this.messagingService = messagingService;
    this.cacheService = cacheService;
  }

  async execute(orderId, customerId, reason) {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new Error('Access denied');
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    const previousStatus = order.status;
    order.cancel(reason);

    const updatedOrder = await this.orderRepository.save(order);

    await this.cacheService.invalidate(`order:${orderId}`);
    await this.cacheService.invalidate(`customer:${customerId}:orders`);

    const event = new (require('../../domain/events/order.events').OrderCancelledEvent)(updatedOrder, reason);
    await this.messagingService.publish('order.events', event);

    return updatedOrder;
  }
}

module.exports = { CreateOrderUseCase, GetOrderUseCase, CancelOrderUseCase };