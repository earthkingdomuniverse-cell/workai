import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { registerRoutes } from '../index';
import { generateAccessToken } from '../../modules/auth/token';

async function buildTestApp() {
  const app = Fastify({ logger: false });
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = (error as any).statusCode || 500;
    const code = (error as any).code || 'INTERNAL_ERROR';
    reply.status(statusCode).send({
      error: {
        code,
        message: error.message,
      },
    });
  });
  await app.register(registerRoutes, { prefix: '/api/v1' });
  await app.ready();
  return app;
}

describe('auth contract', () => {
  it('returns 401 for missing token on protected notification endpoint', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'AUTHENTICATION_ERROR' },
    });

    await app.close();
  });

  it('returns 401 for missing token on protected deals endpoint', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/deals',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'AUTHENTICATION_ERROR' },
    });

    await app.close();
  });

  it('returns 401 for missing token on protected withdraw endpoint', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/withdraw',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'AUTHENTICATION_ERROR' },
    });

    await app.close();
  });

  it('returns 401 for missing token on review creation', async () => {
    const app = await buildTestApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/reviews',
      payload: {
        dealId: 'deal_test',
        subjectType: 'user',
        subjectId: 'user_test',
        rating: 5,
        comment: 'Great work and clear communication.',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'AUTHENTICATION_ERROR' },
    });

    await app.close();
  });

  it('returns 403 for member token on admin endpoint', async () => {
    const app = await buildTestApp();
    const token = await generateAccessToken({
      userId: 'member_test',
      email: 'member@example.com',
      role: 'member',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/overview',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: { code: 'ACCESS_DENIED' },
    });

    await app.close();
  });
});
