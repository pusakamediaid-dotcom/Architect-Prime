import { z } from 'zod';

export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: z.enum(['admin', 'moderator', 'user', 'guest']).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const UpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'moderator', 'user', 'guest']).optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'banned']).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  query: z.any(),
  params: z.any(),
});
