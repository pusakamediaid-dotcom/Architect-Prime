import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

const userPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Password123',
};

describe('User API integration', () => {
  it('registers, logs in, creates, reads, lists, searches, updates, and deletes users with SQLite', async () => {
    const registered = await request(app)
      .post('/api/auth/register')
      .send(userPayload)
      .expect(201);

    expect(registered.body.success).toBe(true);
    expect(registered.body.user.email).toBe(userPayload.email);
    expect(JSON.stringify(registered.body)).not.toContain('passwordHash');
    expect(registered.body.token).toBeTruthy();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    const token = login.body.token;
    expect(token).toBeTruthy();

    const created = await request(app)
      .post('/api/users')
      .send({ name: 'John Smith', email: 'john@example.com', password: 'Password123', role: 'moderator' })
      .expect(201);

    const createdId = created.body.data.id;
    expect(created.body.data.email).toBe('john@example.com');
    expect(JSON.stringify(created.body)).not.toContain('passwordHash');

    const fetched = await request(app).get(`/api/users/${createdId}`).expect(200);
    expect(fetched.body.data.name).toBe('John Smith');

    const listed = await request(app).get('/api/users').expect(200);
    expect(listed.body.data.length).toBe(2);
    expect(listed.body.meta.total).toBe(2);

    const searched = await request(app).get('/api/users/search?q=John&field=name').expect(200);
    expect(searched.body.data).toHaveLength(1);

    const updated = await request(app)
      .put(`/api/users/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Updated', status: 'active' })
      .expect(200);
    expect(updated.body.data.name).toBe('John Updated');

    await request(app)
      .delete(`/api/users/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app).get(`/api/users/${createdId}`).expect(404);
  });

  it('rejects duplicate emails and invalid login credentials', async () => {
    await request(app).post('/api/auth/register').send(userPayload).expect(201);
    await request(app).post('/api/auth/register').send(userPayload).expect(422);
    await request(app).post('/api/auth/login').send({ email: userPayload.email, password: 'WrongPass123' }).expect(422);
  });

  it('validates auth middleware and protected mutations', async () => {
    const registered = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Auth User', email: 'auth@example.com', password: 'Password123' })
      .expect(201);

    const token = registered.body.token;
    const created = await request(app)
      .post('/api/users')
      .send({ name: 'Protected User', email: 'protected@example.com', password: 'Password123' })
      .expect(201);

    await request(app)
      .put(`/api/users/${created.body.data.id}`)
      .send({ name: 'No Token' })
      .expect(401);

    await request(app)
      .put(`/api/users/${created.body.data.id}`)
      .set('Authorization', 'Bearer invalid-token')
      .send({ name: 'Invalid Token' })
      .expect(401);

    await request(app)
      .post(`/api/users/${registered.body.user.id}/change-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Password123', newPassword: 'NewPassword123' })
      .expect(200);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'auth@example.com', password: 'NewPassword123' })
      .expect(200);

    await request(app)
      .get('/api/users/verify-email?token=demo-token')
      .expect(200);
  });

  it('validates request body and not-found update/delete cases', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: 'x', email: 'bad-email', password: 'short' })
      .expect(422);

    const registered = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin User', email: 'admin@example.com', password: 'Password123' })
      .expect(201);

    await request(app)
      .put('/api/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${registered.body.token}`)
      .send({ name: 'Missing User' })
      .expect(404);

    await request(app)
      .delete('/api/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${registered.body.token}`)
      .expect(404);
  });

});
