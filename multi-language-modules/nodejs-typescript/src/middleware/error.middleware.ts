import { Request, Response, NextFunction } from 'express';
import { AppException } from '../exceptions/app.exception';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err instanceof AppException ? err.statusCode : 500;
  const code = err instanceof AppException ? err.code : 'INTERNAL_ERROR';

  if (process.env.NODE_ENV !== 'test') {
    logger.error(`${req.method} ${req.path} failed`, { code, message: err.message });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    },
  });
}
