import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  AdminCreateUserSchema,
  AdminUpdateUserSchema,
  ChangePasswordSchema,
  UpdateMeSchema,
} from '../validators/schemas/user.schema';

const router = Router();
const controller = new UserController(new UserService());
const adminOnly = [authMiddleware, authorizeMiddleware('admin')];

router.get('/me', authMiddleware, (req: Request, res: Response, next) => controller.getMe(req, res, next));
router.put('/me', authMiddleware, validateRequest(UpdateMeSchema), (req: Request, res: Response, next) => controller.updateMe(req, res, next));
router.delete('/me', authMiddleware, (req: Request, res: Response, next) => controller.deleteMe(req, res, next));
router.post('/me/change-password', authMiddleware, validateRequest(ChangePasswordSchema), (req: Request, res: Response, next) => controller.changePassword(req, res, next));
router.get('/verify-email', (req: Request, res: Response, next) => controller.verifyEmail(req, res, next));

router.get('/', ...adminOnly, (req: Request, res: Response, next) => controller.list(req, res, next));
router.post('/', ...adminOnly, validateRequest(AdminCreateUserSchema), (req: Request, res: Response, next) => controller.create(req, res, next));
router.get('/search', ...adminOnly, (req: Request, res: Response, next) => controller.search(req, res, next));
router.get('/:id', ...adminOnly, (req: Request, res: Response, next) => controller.getById(req, res, next));
router.put('/:id', ...adminOnly, validateRequest(AdminUpdateUserSchema), (req: Request, res: Response, next) => controller.update(req, res, next));
router.delete('/:id', ...adminOnly, (req: Request, res: Response, next) => controller.delete(req, res, next));

export default router;
