'use strict';

class AuthMiddleware {
  constructor(jwtService, userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  authenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const token = authHeader.substring(7);
        const decoded = await this.jwtService.verify(token);

        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        if (user.status !== 'active') {
          return res.status(403).json({
            success: false,
            message: 'Account is not active'
          });
        }

        req.user = user;
        req.userId = user.id;
        next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }
        next(error);
      }
    };
  }

  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      next();
    };
  }

  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = await this.jwtService.verify(token);
          const user = await this.userRepository.findById(decoded.userId);
          
          if (user) {
            req.user = user;
            req.userId = user.id;
          }
        }
        
        next();
      } catch (error) {
        next();
      }
    };
  }
}

module.exports = AuthMiddleware;