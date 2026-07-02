import bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserDto } from '../models/dto/user.dto';
import { NotFoundException } from '../exceptions/not-found.exception';

interface StoredUser extends UserDto {
  passwordHash: string;
}

const sanitize = (user: StoredUser): UserDto => {
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  return safeUser;
};

export class UserService {
  private users = new Map<string, StoredUser>();

  async create(dto: CreateUserDto): Promise<UserDto> {
    const now = new Date();
    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone ?? null,
      dateOfBirth: dto.dateOfBirth ?? null,
      address: dto.address ?? null,
      role: dto.role ?? 'user',
      status: 'active',
      emailVerified: false,
      avatar: null,
      metadata: dto.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      passwordHash: await bcrypt.hash(dto.password, 12),
    };
    this.users.set(user.id, user);
    return sanitize(user);
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = this.users.get(id);
    return user ? sanitize(user) : null;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = this.users.get(id);
    if (!user) throw new NotFoundException('User');
    const updated: StoredUser = { ...user, ...dto, updatedAt: new Date() };
    this.users.set(id, updated);
    return sanitize(updated);
  }

  async delete(id: string): Promise<void> {
    if (!this.users.delete(id)) throw new NotFoundException('User');
  }

  async findAll(filter: { page: number; limit: number; role?: string; status?: string }) {
    const page = Math.max(filter.page || 1, 1);
    const limit = Math.min(Math.max(filter.limit || 20, 1), 100);
    let data = Array.from(this.users.values());
    if (filter.role) data = data.filter((user) => user.role === filter.role);
    if (filter.status) data = data.filter((user) => user.status === filter.status);
    const total = data.length;
    const start = (page - 1) * limit;
    return {
      data: data.slice(start, start + limit).map(sanitize),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async changePassword(id: string, _currentPassword: string, newPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new NotFoundException('User');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date();
  }

  async verifyEmail(_token: string): Promise<void> {
    // Token verification is intentionally left as an integration point for email providers.
  }

  async search(query: string, field = 'name'): Promise<UserDto[]> {
    const q = (query || '').toLowerCase();
    return Array.from(this.users.values())
      .filter((user) => String((user as unknown as Record<string, unknown>)[field] ?? '').toLowerCase().includes(q))
      .map(sanitize);
  }
}
