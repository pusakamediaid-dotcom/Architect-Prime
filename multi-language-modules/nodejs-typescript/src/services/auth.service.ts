/**
 * Authentication Service
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  
  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword
      }
    });
    
    const token = this.generateToken(user.id);
    
    return { user, token };
  }
  
  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(data.password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    const token = this.generateToken(user.id);
    
    return { user, token };
  }
  
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }
  
  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}

export const authService = new AuthService();
