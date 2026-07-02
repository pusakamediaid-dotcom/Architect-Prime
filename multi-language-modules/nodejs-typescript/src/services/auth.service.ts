import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { RegisterDto, LoginDto } from '../models/dto/user.dto';
import { UserRepository, userRepository, toSafeUser } from '../repositories/user.repository';
import { env } from '../config/env';
import { ValidationException } from '../exceptions/validation.exception';

const JWT_SECRET: Secret = env.jwtSecret;

export class AuthService {
  constructor(private readonly users: UserRepository = userRepository) {}

  async register(data: RegisterDto) {
    const existingUser = await this.users.findByEmailWithPassword(data.email);
    if (existingUser) {
      throw new ValidationException('Email already registered');
    }

    const user = await this.users.create({
      ...data,
      passwordHash: await bcrypt.hash(data.password, 12),
      role: 'user',
    });

    const token = this.generateToken(user.id, user.role);
    return { user, token };
  }

  async login(data: LoginDto) {
    const user = await this.users.findByEmailWithPassword(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new ValidationException('Invalid credentials');
    }

    const safeUser = toSafeUser(user);
    const token = this.generateToken(safeUser.id, safeUser.role);
    return { user: safeUser, token };
  }

  private generateToken(userId: string, role = 'user'): string {
    const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
    return jwt.sign({ userId, role }, JWT_SECRET, options);
  }

  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}

export const authService = new AuthService();
