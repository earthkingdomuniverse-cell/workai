import { FastifyPluginAsync } from 'fastify';
import proposalRoutes from '../modules/proposal/routes';

const proposals: FastifyPluginAsync = async (fastify) => {
  await fastify.register(proposalRoutes, { prefix: '/proposals' });
};

export default proposals;
