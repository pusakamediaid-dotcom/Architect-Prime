/** JWT Authentication and Authorization Middleware */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: { userId: string; role?: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token) as { userId: string; role?: string };
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (_error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

export const authorizeMiddleware = (...roles: string[]) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (roles.length === 0) {
    next();
    return;
  }
  const role = req.user?.role;
  if (!role || !roles.includes(role)) {
    res.status(403).json({ success: false, error: 'Insufficient permissions' });
    return;
  }
  next();
};
