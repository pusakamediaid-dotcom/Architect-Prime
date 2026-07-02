import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('API smoke test', () => {
  it('serves health and documentation endpoints', async () => {
    const health = await request(app).get('/health').expect(200);
    expect(health.body.status).toBe('healthy');

    const docs = await request(app).get('/docs/').expect(200);
    expect(docs.text).toContain('Swagger UI');
  });

  it('returns safe 404 response without stack trace', async () => {
    const result = await request(app).get('/does-not-exist').expect(404);
    expect(result.body.error).toBe('Not Found');
    expect(JSON.stringify(result.body)).not.toContain('stack');
  });
});
