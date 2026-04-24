import { FastifyPluginAsync } from 'fastify';
import { packagingService, PackagingState } from '../services/packagingService';

// Basic endpoints to illustrate packaging status flow
const packagingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/packaging/status', async (_req, reply) => {
    const state: PackagingState = packagingService.getState();
    return reply.send(state);
  });

  fastify.post('/packaging/build', async (_req, reply) => {
    packagingService.startBuild('Manual build triggered via API');
    return reply.status(202).send({ ok: true, status: packagingService.getState() });
  });

  fastify.post('/packaging/ready', async (request, reply) => {
    const { version } = request.body as { version?: string };
    packagingService.markReady(version);
    return reply.send({ ok: true, state: packagingService.getState() });
  });

  fastify.post('/packaging/deploy', async (_request, reply) => {
    packagingService.deploy('Deploy started via API');
    return reply.send({ ok: true, state: packagingService.getState() });
  });

  fastify.post('/packaging/publish', async (request, reply) => {
    const { version } = request.body as { version?: string };
    packagingService.publish(version);
    return reply.send({ ok: true, state: packagingService.getState() });
  });
};

export default packagingRoutes;
