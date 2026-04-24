import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { prisma } from '../db/prismaClient';

const transactions: FastifyPluginAsync = async (fastify) => {
  // GET /api/transactions
  fastify.get('/transactions', async (request, reply) => {
    const { userId, dealId, status, type } = request.query as any;

    const where: any = {};
    if (userId) where.userId = userId;
    if (dealId) where.dealId = dealId;
    if (status) where.status = status;
    if (type) where.type = type;

    const items = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reply, { items, total: items.length });
  });

  // GET /api/transactions/:id
  fastify.get('/transactions/:id', async (request, reply) => {
    const { id } = request.params as any;
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        },
      });
    }

    return successResponse(reply, transaction);
  });

  // GET /api/deals/:id/receipts — keep for API compat but use transactions
  fastify.get('/deals/:id/receipts', async (request, reply) => {
    const { id } = request.params as any;
    const items = await prisma.transaction.findMany({
      where: { dealId: id },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(reply, { items, total: items.length });
  });
};

export default transactions;
