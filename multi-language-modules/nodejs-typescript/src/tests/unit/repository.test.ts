import { describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import { PrismaUserRepository } from '../../repositories/user.repository';

describe('PrismaUserRepository', () => {
  it('creates safe users without exposing passwordHash', async () => {
    const repository = new PrismaUserRepository();
    const user = await repository.create({
      name: 'Repo User',
      email: 'repo@example.com',
      password: 'Password123',
      passwordHash: await bcrypt.hash('Password123', 12),
      metadata: { source: 'unit-test' },
    });

    expect(user.email).toBe('repo@example.com');
    expect(JSON.stringify(user)).not.toContain('passwordHash');
    expect(user.metadata.source).toBe('unit-test');
  });

  it('handles update/delete misses and fallback search field safely', async () => {
    const repository = new PrismaUserRepository();
    await expect(repository.update('00000000-0000-4000-8000-000000000000', { name: 'Missing' })).resolves.toBeNull();
    await expect(repository.delete('00000000-0000-4000-8000-000000000000')).resolves.toBe(false);
    await expect(repository.updatePasswordHash('00000000-0000-4000-8000-000000000000', 'hash')).resolves.toBe(false);

    await repository.create({
      name: 'Search User',
      email: 'search@example.com',
      password: 'Password123',
      passwordHash: await bcrypt.hash('Password123', 12),
    });

    const results = await repository.search('Search', 'unsupported-field');
    expect(results).toHaveLength(1);
  });

});
