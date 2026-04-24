import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { trustService } from '../services/trustService';

const trust: FastifyPluginAsync = async (fastify) => {
  // GET /api/trust/me
  fastify.get('/trust/me', async (_request, reply) => {
    try {
      const profile = await trustService.getMyTrustProfile();
      return successResponse(reply, profile, { message: 'Trust profile retrieved successfully' });
    } catch (e: any) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Trust profile not found',
        },
      });
    }
  });

  // GET /api/trust/:userId
  fastify.get('/trust/:userId', async (request, reply) => {
    const { userId } = request.params as any;
    try {
      const profile = await trustService.getTrustProfile(userId);
      return successResponse(reply, profile, { message: 'Trust profile retrieved successfully' });
    } catch (e: any) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Trust profile not found',
        },
      });
    }
  });

  // GET /api/trust
  fastify.get('/trust', async (_request, reply) => {
    const profiles = await trustService.getAllTrustProfiles();
    return successResponse(reply, { items: profiles }, { message: 'Trust profiles retrieved successfully' });
  });
};

export default trust;
