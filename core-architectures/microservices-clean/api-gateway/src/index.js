'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const config = require('../../shared/config');
const { EVENTS } = require('../../shared/constants/events');

class APIGateway {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors(config.cors));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('combined'));

    const limiter = rateLimit(config.rateLimit);
    this.app.use('/api/', limiter);
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    this.app.get('/api/users', this.proxyRequest(config.services.userService.url, '/users'));
    this.app.post('/api/users', this.proxyRequest(config.services.userService.url, '/users'));
    this.app.get('/api/users/:id', this.proxyRequest(config.services.userService.url, '/users/:id'));
    this.app.put('/api/users/:id', this.proxyRequest(config.services.userService.url, '/users/:id'));
    this.app.delete('/api/users/:id', this.proxyRequest(config.services.userService.url, '/users/:id'));

    this.app.get('/api/orders', this.proxyRequest(config.services.orderService.url, '/orders'));
    this.app.post('/api/orders', this.proxyRequest(config.services.orderService.url, '/orders'));
    this.app.get('/api/orders/:id', this.proxyRequest(config.services.orderService.url, '/orders/:id'));
    this.app.put('/api/orders/:id/status', this.proxyRequest(config.services.orderService.url, '/orders/:id/status'));

    this.app.post('/api/payments/initiate', this.proxyRequest(config.services.paymentService.url, '/payments/initiate'));
    this.app.post('/api/payments/confirm', this.proxyRequest(config.services.paymentService.url, '/payments/confirm'));
    this.app.get('/api/payments/:id', this.proxyRequest(config.services.paymentService.url, '/payments/:id'));

    this.app.post('/api/notifications/send', this.proxyRequest(config.services.notificationService.url, '/notifications/send'));
    this.app.get('/api/notifications/:userId', this.proxyRequest(config.services.notificationService.url, '/notifications/:userId'));
  }

  proxyRequest(targetService, path) {
    return async (req, res, next) => {
      try {
        const url = `${targetService}${path.replace(':id', req.params.id || '')}`;
        const params = { ...req.query };
        
        const response = await axios({
          method: req.method,
          url,
          data: req.body,
          params,
          headers: {
            'X-Request-ID': req.headers['x-request-id'] || require('uuid').v4(),
            'X-Forwarded-For': req.ip,
            'X-User-ID': req.headers['x-user-id']
          },
          timeout: config.services[Object.keys(config.services).find(
            key => config.services[key].url === targetService
          )]?.timeout || 5000
        });

        res.status(response.status).json(response.data);
      } catch (error) {
        if (error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        next(error);
      }
    };
  }

  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error('Gateway Error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal Gateway Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  start(port = process.env.PORT || 8080) {
    this.app.listen(port, () => {
      console.log(`API Gateway running on port ${port}`);
    });
  }
}

module.exports = APIGateway;