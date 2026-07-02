import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { validateRequest } from '../middleware/validate.middleware';
import { CreateUserSchema, LoginSchema } from '../validators/schemas/user.schema';

const router = Router();

router.post('/register', validateRequest(CreateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateRequest(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
