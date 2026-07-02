import { Prisma, User } from '@prisma/client';
import { prisma } from '../database/prisma';
import { CreateUserDto, UpdateUserDto, UserDto, UserRole, UserStatus } from '../models/dto/user.dto';

export type SafeUser = UserDto;

export interface UserListOptions {
  page: number;
  limit: number;
  role?: string;
  status?: string;
}

export interface UserListResult {
  data: SafeUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserRepository {
  create(data: CreateUserDto & { passwordHash: string }): Promise<SafeUser>;
  findById(id: string): Promise<SafeUser | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  list(options: UserListOptions): Promise<UserListResult>;
  update(id: string, data: UpdateUserDto): Promise<SafeUser | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  search(query: string, field?: string): Promise<SafeUser[]>;
}

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  dateOfBirth: user.dateOfBirth,
  address: safeJsonParse(user.addressJson, null),
  role: user.role as UserRole,
  status: user.status as UserStatus,
  emailVerified: user.emailVerified,
  avatar: user.avatar,
  metadata: safeJsonParse<Record<string, unknown>>(user.metadataJson, {}),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class PrismaUserRepository implements UserRepository {
  async create(data: CreateUserDto & { passwordHash: string }): Promise<SafeUser> {
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizeEmail(data.email),
        passwordHash: data.passwordHash,
        phone: data.phone ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        addressJson: data.address ? JSON.stringify(data.address) : null,
        role: data.role ?? 'user',
        status: 'active',
        metadataJson: JSON.stringify(data.metadata ?? {}),
      },
    });
    return toSafeUser(user);
  }

  async findById(id: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toSafeUser(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  }

  async list(options: UserListOptions): Promise<UserListResult> {
    const page = Math.max(options.page || 1, 1);
    const limit = Math.min(Math.max(options.limit || 20, 1), 100);
    const where: Prisma.UserWhereInput = {
      ...(options.role ? { role: options.role } : {}),
      ...(options.status ? { status: options.status } : {}),
    };

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: users.map(toSafeUser),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<SafeUser | null> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(data.email !== undefined ? { email: normalizeEmail(data.email) } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth } : {}),
          ...(data.address !== undefined ? { addressJson: data.address ? JSON.stringify(data.address) : null } : {}),
          ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
          ...(data.role !== undefined ? { role: data.role } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.metadata !== undefined ? { metadataJson: JSON.stringify(data.metadata) } : {}),
        },
      });
      return toSafeUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    try {
      await prisma.user.update({ where: { id }, data: { passwordHash } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  async search(query: string, field = 'name'): Promise<SafeUser[]> {
    const allowedFields = new Set(['name', 'email', 'role', 'status']);
    const searchField = allowedFields.has(field) ? field : 'name';
    const users = await prisma.user.findMany({
      where: {
        [searchField]: {
          contains: query || '',
        },
      } as Prisma.UserWhereInput,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return users.map(toSafeUser);
  }
}

export const userRepository = new PrismaUserRepository();
