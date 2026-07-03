import { z } from 'zod';

const RoleSchema = z.enum(['admin', 'moderator', 'user', 'guest']);
const StatusSchema = z.enum(['active', 'inactive', 'suspended', 'banned']);

export const RegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().max(30).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const AdminCreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().max(30).optional(),
    role: RoleSchema.optional(),
    status: StatusSchema.optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const UpdateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(30).nullable().optional(),
    avatar: z.string().url().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const AdminUpdateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(30).nullable().optional(),
    role: RoleSchema.optional(),
    status: StatusSchema.optional(),
    avatar: z.string().url().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const ChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(128),
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

// Backward-compatible aliases for older tests/imports.
export const CreateUserSchema = AdminCreateUserSchema;
export const UpdateUserSchema = AdminUpdateUserSchema;
