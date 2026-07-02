/**
 * Monolithic MVC Server
 * Main entry point for the application
 */

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const indexRoutes = require('./app/routes/index.routes');
const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');

// Import middleware
const { setLocals } = require('./app/middleware/common.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.disable('x-powered-by');

// Request logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Static files
app.use(express.static('public'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', 'app/views');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Set locals middleware
app.use(setLocals);

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('errors/404', { 
    title: 'Page Not Found',
    user: req.user 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500', { 
    title: 'Server Error',
    user: req.user,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
