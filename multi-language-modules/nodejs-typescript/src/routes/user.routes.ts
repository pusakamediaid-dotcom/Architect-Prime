import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../validators/schemas/user.schema';

const router = Router();
const controller = new UserController(new UserService());

router.get('/', (req: Request, res: Response, next) => controller.list(req, res, next));
router.post('/', validateRequest(CreateUserSchema), (req: Request, res: Response, next) => controller.create(req, res, next));
router.get('/search', (req: Request, res: Response, next) => controller.search(req, res, next));
router.get('/verify-email', (req: Request, res: Response, next) => controller.verifyEmail(req, res, next));
router.get('/:id', (req: Request, res: Response, next) => controller.getById(req, res, next));
router.put('/:id', authMiddleware, validateRequest(UpdateUserSchema), (req: Request, res: Response, next) => controller.update(req, res, next));
router.delete('/:id', authMiddleware, (req: Request, res: Response, next) => controller.delete(req, res, next));
router.post('/:id/change-password', authMiddleware, (req: Request, res: Response, next) => controller.changePassword(req, res, next));

export default router;
