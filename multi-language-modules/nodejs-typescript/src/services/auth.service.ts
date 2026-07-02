/**
 * Authentication Service
 *
 * Demo-safe in-memory service for the runnable starter. Replace the repository
 * adapter with Prisma/PostgreSQL for production persistence.
 */

import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev-only-secret-change-me';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production');
}

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export class AuthService {
  private users = new Map<string, AuthUser>();

  async register(data: RegisterDto) {
    const email = data.email.toLowerCase();
    const existingUser = Array.from(this.users.values()).find((user) => user.email === email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user: AuthUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email,
      password: await bcrypt.hash(data.password, 12),
      role: 'user',
    };
    this.users.set(user.id, user);

    const token = this.generateToken(user.id, user.role);
    const { password, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async login(data: LoginDto) {
    const user = Array.from(this.users.values()).find(
      (candidate) => candidate.email === data.email.toLowerCase(),
    );
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.role);
    const { password, ...safeUser } = user;
    return { user: safeUser, token };
  }

  private generateToken(userId: string, role = 'user'): string {
    const options: SignOptions = { expiresIn: '1h' };
    return jwt.sign({ userId, role }, JWT_SECRET, options);
  }

  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}

export const authService = new AuthService();
