import { FastifyPluginAsync } from 'fastify';
import { config } from '../config';

const health: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.env,
      version: '1.0.0',
    });
  });

  fastify.get('/', async (_request, reply) => {
    return reply.send({
      name: config.app.name,
      version: '1.0.0',
      environment: config.app.env,
      apiVersion: config.api.version,
      health: '/health',
      docs: config.flags.enableSwagger ? '/docs' : undefined,
    });
  });
};

export default health;
