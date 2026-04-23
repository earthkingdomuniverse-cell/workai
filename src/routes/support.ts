import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { aiSupportService } from '../services/aiSupportService';

const support: FastifyPluginAsync = async (fastify) => {
  // POST /api/ai/support
  fastify.post('/ai/support', async (request, reply) => {
    const { body } = request;

    try {
      const result = await aiSupportService.classifyAndRespond(body as any);
      return reply.send(successResponse(result, 'Support request processed successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'SUPPORT_ERROR',
          message: 'Failed to process support request',
        },
      });
    }
  });
};

export default support;
