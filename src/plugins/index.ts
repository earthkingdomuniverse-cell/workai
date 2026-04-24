import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { config } from '../config';
import { logger } from '../lib';

export const registerPlugins: FastifyPluginAsync = async (fastify) => {
  await fastify.register(sensible);

  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../landing'),
    prefix: '/',
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: config.flags.enableMockMode
      ? false
      : {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
          },
        },
  });

  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.window,
    allowList: config.flags.enableMockMode ? ['/health', '/api/health'] : undefined,
  });

  if (config.flags.enableSwagger) {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: config.app.name,
          description: 'SkillValue AI Backend API',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.app.port}`,
            description: 'Development',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformSpecificationClone: true,
    });

    logger.info(`📚 Swagger UI available at /docs`);
  }

  logger.info(`✅ Plugins registered`);
};
