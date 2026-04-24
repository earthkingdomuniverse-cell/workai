import Fastify, { FastifyInstance } from 'fastify';
import { config } from './config';
import { logger } from './lib';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';
import { AppError } from './lib/errors';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.app.logLevel,
    },
  });

  app.setErrorHandler((error, request, reply) => {
    logger.error(`Error: ${error.message}`, { error, reqId: request.id });

    if (error instanceof AppError) {
      reply.status(error.statusCode).send(error.toJSON());
      return;
    }

    reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred',
      },
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route not found`,
      },
    });
  });

  await app.register(registerPlugins);
  await app.register(registerRoutes, { prefix: `${config.api.prefix}/v1` });

  app.get('/', async (_request, reply) => {
    return reply.sendFile('index.html');
  });

  app.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.env,
      version: '1.0.0',
    });
  });

  return app;
}
