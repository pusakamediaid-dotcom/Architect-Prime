import { describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../app';
import { prisma } from '../../database/prisma';

const userPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Password123',
};

async function createAdmin() {
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('AdminPass123', 12),
      role: 'admin',
      status: 'active',
      metadataJson: '{}',
    },
  });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'AdminPass123' })
    .expect(200);
  return login.body.token as string;
}

describe('User API integration', () => {
  it('registers, logs in, reads/updates/deletes own profile with SQLite', async () => {
    const registered = await request(app)
      .post('/api/auth/register')
      .send({ ...userPayload, role: 'admin' })
      .expect(201);

    expect(registered.body.success).toBe(true);
    expect(registered.body.user.email).toBe(userPayload.email);
    expect(registered.body.user.role).toBe('user');
    expect(JSON.stringify(registered.body)).not.toContain('passwordHash');
    expect(registered.body.token).toBeTruthy();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    const token = login.body.token;
    expect(token).toBeTruthy();

    const me = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.email).toBe(userPayload.email);

    const updated = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jane Updated', role: 'admin', status: 'banned' })
      .expect(200);
    expect(updated.body.data.name).toBe('Jane Updated');
    expect(updated.body.data.role).toBe('user');
    expect(updated.body.data.status).toBe('active');

    await request(app)
      .post('/api/users/me/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Password123', newPassword: 'NewPassword123' })
      .expect(200);

    await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: 'NewPassword123' })
      .expect(200);

    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('allows admin to create, list, search, update, get, and delete users', async () => {
    const adminToken = await createAdmin();

    const created = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'John Smith', email: 'john@example.com', password: 'Password123', role: 'moderator' })
      .expect(201);

    const createdId = created.body.data.id;
    expect(created.body.data.role).toBe('moderator');
    expect(JSON.stringify(created.body)).not.toContain('passwordHash');

    const fetched = await request(app)
      .get(`/api/users/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(fetched.body.data.name).toBe('John Smith');

    const listed = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(listed.body.data.length).toBe(2);

    const searched = await request(app)
      .get('/api/users/search?q=John&field=name')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(searched.body.data).toHaveLength(1);

    const updated = await request(app)
      .put(`/api/users/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'John Updated', status: 'active' })
      .expect(200);
    expect(updated.body.data.name).toBe('John Updated');

    await request(app)
      .delete(`/api/users/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app)
      .get(`/api/users/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('rejects duplicate emails and invalid login credentials', async () => {
    await request(app).post('/api/auth/register').send(userPayload).expect(201);
    await request(app).post('/api/auth/register').send(userPayload).expect(422);
    await request(app).post('/api/auth/login').send({ email: userPayload.email, password: 'WrongPass123' }).expect(422);
  });
});
