import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Import the app builder from the backend
import { buildApp } from '../app';

describe('Health endpoint', () => {
  let app: any;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app && app.close) await app.close();
  });

  it('GET /health should return status ok', async () => {
    // Route is prefixed with /api/v1 in the app
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty('status', 'ok');
    expect(typeof body.timestamp).toBe('string');
  });
});
