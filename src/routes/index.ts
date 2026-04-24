import { FastifyPluginAsync } from 'fastify';
import { logger } from '../lib';

export const registerRoutes: FastifyPluginAsync = async (fastify) => {
  const health = (await import('./health')).default;
  const auth = (await import('./auth')).default;
  const offers = (await import('./offers')).default;
  const requests = (await import('./requests')).default;
  const proposals = (await import('./proposals')).default;
  const deals = (await import('./deals')).default;
  const transactions = (await import('./transactions')).default;
  const trust = (await import('./trust')).default;
  const reviews = (await import('./reviews')).default;
  const ai = (await import('./ai')).default;
  const recommendations = (await import('./recommendations')).default;
  const admin = (await import('./admin')).default;
  const billing = (await import('./billing')).default;
  const packaging = (await import('./packaging')).default;
  const lead = (await import('./lead')).default;
  const oss = (await import('./oss')).default;
  const skillExchange = (await import('./skill-exchange')).default;
  const zalo = (await import('./zalo')).default;

  await fastify.register(health);
  await fastify.register(auth);
  await fastify.register(offers);
  await fastify.register(requests);
  await fastify.register(proposals);
  await fastify.register(deals);
  await fastify.register(transactions);
  await fastify.register(trust);
  await fastify.register(reviews);
  await fastify.register(ai);
  await fastify.register(recommendations);
  await fastify.register(zalo);
  await fastify.register(billing);
  await fastify.register(packaging);
  await fastify.register(lead);
  await fastify.register(oss);
  await fastify.register(skillExchange);
  await fastify.register(admin);

  logger.info(`✅ Routes registered`);
};

export default registerRoutes;
