import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

async function registerUser(email: string) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Regular User', email, password: 'Password123' })
    .expect(201);
  return response.body.token as string;
}

describe('User API security boundaries', () => {
  it('blocks public access to user admin endpoints', async () => {
    await request(app).get('/api/users').expect(401);
    await request(app).get('/api/users/search?q=a').expect(401);
    await request(app).get('/api/users/00000000-0000-4000-8000-000000000000').expect(401);
    await request(app)
      .post('/api/users')
      .send({ name: 'Public', email: 'public@example.com', password: 'Password123' })
      .expect(401);
  });

  it('blocks normal users from admin list/search/get/update/delete endpoints', async () => {
    const token = await registerUser('user-a@example.com');

    await request(app).get('/api/users').set('Authorization', `Bearer ${token}`).expect(403);
    await request(app).get('/api/users/search?q=a').set('Authorization', `Bearer ${token}`).expect(403);
    await request(app)
      .get('/api/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    await request(app)
      .put('/api/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad' })
      .expect(403);
    await request(app)
      .delete('/api/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('prevents user A from changing user B through /me-only design', async () => {
    const tokenA = await registerUser('user-a@example.com');
    const userB = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: 'user-b@example.com', password: 'Password123' })
      .expect(201);

    await request(app)
      .put(`/api/users/${userB.body.user.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Hacked' })
      .expect(403);

    await request(app)
      .delete(`/api/users/${userB.body.user.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });

  it('does not allow public registration to set admin role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Role Hacker', email: 'role@example.com', password: 'Password123', role: 'admin' })
      .expect(201);

    expect(response.body.user.role).toBe('user');
  });

  it('does not return fake success for email verification', async () => {
    const response = await request(app).get('/api/users/verify-email?token=demo-token').expect(501);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_IMPLEMENTED');
  });

  it('attaches rate-limit headers to auth endpoints', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' })
      .expect(422);

    expect(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']).toBeTruthy();
  });
});
