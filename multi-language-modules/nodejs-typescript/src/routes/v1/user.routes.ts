import { Router, Request, Response } from 'express';
import { UserController } from '../../controllers/user.controller';
import { authMiddleware, authorizeMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../../validators/schemas/user.schema';

const router = Router();

export class UserRoutes {
  private controller: UserController;

  constructor(controller: UserController) {
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    router.post(
      '/',
      authMiddleware,
      authorizeMiddleware('admin'),
      validateRequest(CreateUserSchema),
      (req: Request, res: Response, next) => this.controller.create(req, res, next)
    );

    router.get(
      '/',
      authMiddleware,
      authorizeMiddleware('admin', 'moderator'),
      (req: Request, res: Response, next) => this.controller.list(req, res, next)
    );

    router.get(
      '/search',
      authMiddleware,
      (req: Request, res: Response, next) => this.controller.search(req, res, next)
    );

    router.get(
      '/:id',
      authMiddleware,
      (req: Request, res: Response, next) => this.controller.getById(req, res, next)
    );

    router.put(
      '/:id',
      authMiddleware,
      validateRequest(UpdateUserSchema),
      (req: Request, res: Response, next) => this.controller.update(req, res, next)
    );

    router.delete(
      '/:id',
      authMiddleware,
      authorizeMiddleware('admin'),
      (req: Request, res: Response, next) => this.controller.delete(req, res, next)
    );

    router.post(
      '/:id/change-password',
      authMiddleware,
      (req: Request, res: Response, next) => this.controller.changePassword(req, res, next)
    );

    router.get(
      '/verify-email',
      (req: Request, res: Response, next) => this.controller.verifyEmail(req, res, next)
    );
  }

  getRoutes(): Router {
    return router;
  }
}

export default new UserRoutes(new UserController).getRoutes();