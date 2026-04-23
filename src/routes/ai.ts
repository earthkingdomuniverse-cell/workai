import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { aiService } from '../services/aiService';
import { aiSupportService } from '../services/aiSupportService';

const ai: FastifyPluginAsync = async (fastify) => {
  // POST /api/ai/match
  fastify.post('/ai/match', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = await aiService.match(body as any);
      return reply.send(successResponse(result, 'AI match completed successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'AI_MATCH_ERROR',
          message: 'Failed to perform AI match',
        },
      });
    }
  });

  // POST /api/ai/price
  fastify.post('/ai/price', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = await aiService.suggestPrice(body);
      return reply.send(successResponse(result, 'Price suggestion completed successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'AI_PRICE_ERROR',
          message: 'Failed to generate price suggestion',
        },
      });
    }
  });

  // POST /api/ai/support
  fastify.post('/ai/support', async (request, reply) => {
    const body = request.body as any;

    try {
      const result = await aiSupportService.classifyAndRespond(body);
      return reply.send(successResponse(result, 'Support classification completed successfully'));
    } catch (error) {
      return reply.status(500).send({
        error: {
          code: 'AI_SUPPORT_ERROR',
          message: 'Failed to process support request',
        },
      });
    }
  });
};

export default ai;
