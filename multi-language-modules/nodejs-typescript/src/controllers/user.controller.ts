import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../models/dto/user.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { NotFoundException } from '../exceptions/not-found.exception';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateUserDto;
      const user = await this.userService.create(dto);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      
      if (!user) {
        throw new NotFoundException('User');
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateUserDto;
      const user = await this.userService.update(id, dto);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20', role, status } = req.query;
      
      const result = await this.userService.findAll({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        role: role as string,
        status: status as string
      });
      
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      await this.userService.changePassword(id, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      await this.userService.verifyEmail(token as string);
      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, field } = req.query;
      const results = await this.userService.search(q as string, field as string);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;