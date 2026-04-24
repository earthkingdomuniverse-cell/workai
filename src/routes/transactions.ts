import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { prisma } from '../lib/prisma';

function serializeTransaction(transaction: any) {
  return {
    ...transaction,
    createdAt: transaction.createdAt?.toISOString?.() ?? transaction.createdAt,
    updatedAt: transaction.updatedAt?.toISOString?.() ?? transaction.updatedAt,
  };
}

function transactionToReceipt(transaction: any) {
  const createdAt = transaction.createdAt?.toISOString?.() ?? transaction.createdAt;
  const updatedAt = transaction.updatedAt?.toISOString?.() ?? transaction.updatedAt;
  const deal = transaction.deal;

  return {
    id: `receipt-${transaction.id}`,
    transactionId: transaction.id,
    dealId: transaction.dealId,
    userId: transaction.userId,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    provider: transaction.provider,
    providerRef: transaction.providerRef,
    referenceNumber: transaction.referenceNumber,
    issuedAt: createdAt,
    createdAt,
    updatedAt,
    deal: deal
      ? {
          id: deal.id,
          title: deal.title,
          status: deal.status,
          amount: deal.amount,
          currency: deal.currency,
          providerId: deal.providerId,
          clientId: deal.clientId,
        }
      : undefined,
  };
}

const transactionInclude = {
  deal: true,
};

const transactions: FastifyPluginAsync = async (fastify) => {
  fastify.get('/transactions', async (request, reply) => {
    const { userId, dealId, status, type } = request.query as Record<string, string | undefined>;
    const where: any = {};

    if (userId) where.userId = userId;
    if (dealId) where.dealId = dealId;
    if (status) where.status = status;
    if (type) where.type = type;

    const items = await prisma.transaction.findMany({
      where,
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reply, {
      items: items.map(serializeTransaction),
      total: items.length,
    });
  });

  fastify.get('/transactions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: transactionInclude,
    });

    if (!transaction) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        },
      });
    }

    return successResponse(reply, serializeTransaction(transaction));
  });

  fastify.get('/receipts', async (request, reply) => {
    const { dealId, userId, status, type } = request.query as Record<string, string | undefined>;
    const where: any = {};

    if (dealId) where.dealId = dealId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });

    const receipts = transactions.map(transactionToReceipt);
    return successResponse(reply, { items: receipts, total: receipts.length });
  });

  fastify.get('/deals/:id/receipts', async (request, reply) => {
    const { id } = request.params as { id: string };
    const transactions = await prisma.transaction.findMany({
      where: { dealId: id },
      include: transactionInclude,
      orderBy: { createdAt: 'desc' },
    });

    const receipts = transactions.map(transactionToReceipt);
    return successResponse(reply, { items: receipts, total: receipts.length });
  });

  fastify.get('/receipts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const transactionId = id.startsWith('receipt-') ? id.replace('receipt-', '') : id;
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: transactionInclude,
    });

    if (!transaction) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Receipt not found',
        },
      });
    }

    return successResponse(reply, transactionToReceipt(transaction));
  });
};

export default transactions;
