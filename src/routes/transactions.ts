import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { mockTransactions, mockReceipts } from '../mocks/transactions';

const transactions: FastifyPluginAsync = async (fastify) => {
  // GET /api/transactions
  fastify.get('/transactions', async (request, reply) => {
    const { userId, dealId, status, type } = request.query as any;

    let filteredTransactions = [...mockTransactions];

    if (userId) {
      filteredTransactions = filteredTransactions.filter((t) => t.userId === userId);
    }

    if (dealId) {
      filteredTransactions = filteredTransactions.filter((t) => t.dealId === dealId);
    }

    if (status) {
      filteredTransactions = filteredTransactions.filter((t) => t.status === status);
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter((t) => t.type === type);
    }

    return reply.send(
      successResponse({ items: filteredTransactions, total: filteredTransactions.length }, 'Transactions retrieved successfully'),
    );
  });

  // GET /api/transactions/:id
  fastify.get('/transactions/:id', async (request, reply) => {
    const { id } = request.params as any;
    const transaction = mockTransactions.find((t) => t.id === id);

    if (!transaction) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        },
      });
    }

    return reply.send(successResponse(transaction, 'Transaction retrieved successfully'));
  });

  // GET /api/receipts
  fastify.get('/receipts', async (request, reply) => {
    const { dealId } = request.query as any;
    const receipts = dealId ? mockReceipts.filter((r) => r.dealId === dealId) : mockReceipts;
    return reply.send(successResponse({ items: receipts, total: receipts.length }, 'Receipts retrieved successfully'));
  });

  // GET /api/deals/:id/receipts
  fastify.get('/deals/:id/receipts', async (request, reply) => {
    const { id } = request.params as any;
    const receipts = mockReceipts.filter((r) => r.dealId === id);

    return reply.send(successResponse({ items: receipts, total: receipts.length }, 'Receipts retrieved successfully'));
  });

  // GET /api/receipts/:id
  fastify.get('/receipts/:id', async (request, reply) => {
    const { id } = request.params as any;
    const receipt = mockReceipts.find((r) => r.id === id);

    if (!receipt) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Receipt not found',
        },
      });
    }

    return reply.send(successResponse(receipt, 'Receipt retrieved successfully'));
  });
};

export default transactions;
