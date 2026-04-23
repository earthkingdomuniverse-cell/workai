import { FastifyPluginAsync } from 'fastify';
import { logger } from '../lib';

type FastifyRequestWithUser = { user: Record<string, unknown> | null };

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request, _reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = await validateToken(token);
      if (user) {
        (request as unknown as FastifyRequestWithUser).user = user;
      }
    } catch (error) {
      logger.debug(
        `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
        { error },
      );
    }
  });

  logger.info(`✅ Auth plugin registered`);
};

async function validateToken(_token: string) {
  const { shouldEnableMock } = await import('../config');

  if (shouldEnableMock()) {
    return {
      id: 'mock-user-1',
      email: 'user@example.com',
      role: 'user' as const,
      permissions: ['read' as const, 'write' as const],
      onboardingCompleted: true,
      trustScore: 85,
    };
  }

  return null;
}

export default authPlugin;
