'use strict';

const config = {
  env: process.env.NODE_ENV || 'development',
  
  services: {
    userService: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      timeout: 5000,
      retries: 3
    },
    orderService: {
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
      timeout: 5000,
      retries: 3
    },
    paymentService: {
      url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
      timeout: 10000,
      retries: 3
    },
    notificationService: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
      timeout: 5000,
      retries: 2
    }
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      options: {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000
      }
    },
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'architect_prime',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      pool: {
        min: 2,
        max: 10
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0')
    }
  },

  messageQueue: {
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      exchanges: {
        user: 'user.events',
        order: 'order.events',
        payment: 'payment.events',
        notification: 'notification.events'
      }
    },
    kafka: {
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      clientId: 'architect-prime',
      groupId: 'architect-prime-group'
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d',
    refreshExpiresIn: '30d',
    algorithm: 'HS256'
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: ['console', 'file']
  },

  monitoring: {
    prometheus: {
      enabled: process.env.PROMETHEUS_ENABLED === 'true',
      port: parseInt(process.env.PROMETHEUS_PORT || '9090')
    },
    healthCheck: {
      enabled: true,
      interval: 30000
    }
  },

  cache: {
    defaultTTL: 300,
    userTTL: 600,
    orderTTL: 300,
    productTTL: 1800
  }
};

module.exports = config;