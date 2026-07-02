import request from 'supertest';
import app from '../app';

async function run() {
  const health = await request(app).get('/health').expect(200);
  if (health.body.status !== 'healthy') throw new Error('health endpoint returned unexpected status');

  const created = await request(app)
    .post('/api/users')
    .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'Password123' })
    .expect(201);
  if (!created.body.success || !created.body.data.id) throw new Error('user creation failed');

  const users = await request(app).get('/api/users').expect(200);
  if (!Array.isArray(users.body.data)) throw new Error('user list response is invalid');

  console.log('Node API smoke tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
