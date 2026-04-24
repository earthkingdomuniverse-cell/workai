import { FastifyPluginAsync } from 'fastify';
import { loadOSSPlugins } from '../open_source';

// Open Source Plugin Registry endpoints
const ossRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/open-source/plugins', async (_req, reply) => {
    const plugins = await loadOSSPlugins();
    const payload = plugins.map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      hasInit: typeof p.init === 'function',
    }));
    reply.send(payload);
  });
};

export default ossRoutes;
