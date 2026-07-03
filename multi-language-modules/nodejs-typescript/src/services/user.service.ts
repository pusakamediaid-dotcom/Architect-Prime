import bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserDto } from '../models/dto/user.dto';
import { NotFoundException } from '../exceptions/not-found.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { AppException } from '../exceptions/app.exception';
import { UserRepository, userRepository } from '../repositories/user.repository';

export class UserService {
  constructor(private readonly users: UserRepository = userRepository) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    const existingUser = await this.users.findByEmailWithPassword(dto.email);
    if (existingUser) {
      throw new ValidationException('Email already registered');
    }
    return this.users.create({
      ...dto,
      passwordHash: await bcrypt.hash(dto.password, 12),
    });
  }

  async findById(id: string): Promise<UserDto | null> {
    return this.users.findById(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.users.update(id, dto);
    if (!user) throw new NotFoundException('User');
    return user;
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const { role: _role, status: _status, ...safeDto } = dto;
    return this.update(id, safeDto);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.users.delete(id);
    if (!deleted) throw new NotFoundException('User');
  }

  async findAll(filter: { page: number; limit: number; role?: string; status?: string }) {
    return this.users.list(filter);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const safeUser = await this.users.findById(id);
    if (!safeUser) throw new NotFoundException('User');
    const user = await this.users.findByEmailWithPassword(safeUser.email);
    if (!user) throw new NotFoundException('User');
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new ValidationException('Current password is invalid');
    }
    const updated = await this.users.updatePasswordHash(id, await bcrypt.hash(newPassword, 12));
    if (!updated) throw new NotFoundException('User');
  }

  async verifyEmail(_token: string): Promise<void> {
    throw new AppException('Email verification is not implemented yet.', 501, 'NOT_IMPLEMENTED');
  }

  async search(query: string, field = 'name'): Promise<UserDto[]> {
    return this.users.search(query || '', field);
  }
}
