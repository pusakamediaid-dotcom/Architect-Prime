/**
 * API Gateway - Main Entry Point
 * Handles request routing, authentication, rate limiting
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

// Service URLs
const SERVICES = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004'
};

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Verify token with user service
    const response = await axios.get(`${SERVICES.user}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    req.user = response.data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.use('/api/users', authMiddleware, createProxy('/api/users', SERVICES.user));
app.use('/api/orders', authMiddleware, createProxy('/api/orders', SERVICES.order));
app.use('/api/payments', authMiddleware, createProxy('/api/payments', SERVICES.payment));
app.use('/api/notifications', authMiddleware, createProxy('/api/notifications', SERVICES.notification));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Proxy helper
function createProxy(path, target) {
  return async (req, res) => {
    try {
      const url = `${target}${req.originalUrl}`;
      const response = await axios({
        method: req.method,
        url,
        headers: {
          ...req.headers,
          host: undefined
        },
        data: req.body
      });
      res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'Service unavailable' });
      }
    }
  };
}

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});

module.exports = app;
