import { FastifyPluginAsync } from 'fastify';
import zaloClient from '../zalo';
import { logger } from '../lib';

// Basic webhook and push endpoints for Zalo integration (skeleton for MVP)
const zaloRoutes: FastifyPluginAsync = async (fastify) => {
  // Webhook endpoint to receive events from Zalo Open Platform
  fastify.post('/zalo/webhook', async (request, reply) => {
    const body = request.body as any;
    logger.info('Zalo webhook received', body);
    // In a real implementation, validate signature and process events
    reply.status(200).send({ ok: true });
  });

  // Simple endpoint to push a message to a Zalo user
  fastify.post('/zalo/push', async (request, reply) => {
    const { toZaloId, message } = request.body as any;
    if (!toZaloId || !message) {
      reply.status(400).send({ error: 'Missing toZaloId or message' });
      return;
    }
    try {
      await zaloClient.sendMessage(toZaloId, message);
      reply.status(200).send({ ok: true });
    } catch (e) {
      reply.status(500).send({ error: 'Failed to send message' });
    }
  });
};

export default zaloRoutes;
