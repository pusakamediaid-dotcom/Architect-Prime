import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationException } from '../exceptions/validation.exception';

export const validateRequest = (schema: ZodSchema) => (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    next(new ValidationException(result.error.issues.map((issue) => issue.message).join('; ')));
    return;
  }
  next();
};
