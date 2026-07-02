import { describe, expect, it } from 'vitest';
import { CreateUserSchema, LoginSchema, UpdateUserSchema } from '../../validators/schemas/user.schema';

describe('user validation schemas', () => {
  it('accepts a valid create user payload', () => {
    const result = CreateUserSchema.safeParse({
      body: { name: 'Valid User', email: 'valid@example.com', password: 'Password123' },
      query: {},
      params: {},
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = CreateUserSchema.safeParse({
      body: { name: 'Bad User', email: 'not-an-email', password: 'Password123' },
      query: {},
      params: {},
    });
    expect(result.success).toBe(false);
  });

  it('accepts login payload and partial updates', () => {
    expect(LoginSchema.safeParse({ body: { email: 'u@example.com', password: 'Password123' }, query: {}, params: {} }).success).toBe(true);
    expect(UpdateUserSchema.safeParse({ body: { status: 'active', role: 'user' }, query: {}, params: {} }).success).toBe(true);
  });
});
