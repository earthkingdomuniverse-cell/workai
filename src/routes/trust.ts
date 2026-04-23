import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { mockTrustProfiles } from '../mocks/trust';

const trust: FastifyPluginAsync = async (fastify) => {
  // GET /api/trust/me
  fastify.get('/trust/me', async (_request, reply) => {
    // Return the first trust profile as an example
    if (mockTrustProfiles.length > 0) {
      return reply.send(
        successResponse(mockTrustProfiles[0], 'Trust profile retrieved successfully'),
      );
    }

    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Trust profile not found',
      },
    });
  });

  // GET /api/trust/:userId
  fastify.get('/trust/:userId', async (request, reply) => {
    const { userId } = request.params as any;
    const profile = mockTrustProfiles.find((p) => p.userId === userId);

    if (!profile) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Trust profile not found',
        },
      });
    }

    return reply.send(successResponse(profile, 'Trust profile retrieved successfully'));
  });

  // GET /api/trust
  fastify.get('/trust', async (_request, reply) => {
    return reply.send(
      successResponse({ items: mockTrustProfiles }, 'Trust profiles retrieved successfully'),
    );
  });
};

export default trust;
