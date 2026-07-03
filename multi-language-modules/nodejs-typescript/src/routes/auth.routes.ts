import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { validateRequest } from '../middleware/validate.middleware';
import { LoginSchema, RegisterSchema } from '../validators/schemas/user.schema';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/register', registerRateLimiter, validateRequest(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginRateLimiter, validateRequest(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
