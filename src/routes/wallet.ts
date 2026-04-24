import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { walletService } from '../services/walletService';

async function requireWalletUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

const wallet: FastifyPluginAsync = async (fastify) => {
  fastify.get('/wallet', async (request, reply) => {
    const user = await requireWalletUser(request, reply);
    const walletRecord = await walletService.getWallet(user.userId);

    return {
      id: walletRecord.id,
      userId: walletRecord.userId,
      currency: walletRecord.currency,
      available: walletRecord.available,
      held: walletRecord.held,
      lifetimeIn: walletRecord.lifetimeIn,
      lifetimeOut: walletRecord.lifetimeOut,
      createdAt: walletRecord.createdAt.toISOString(),
      updatedAt: walletRecord.updatedAt.toISOString(),
    };
  });

  fastify.get('/wallet/ledger', async (request, reply) => {
    const user = await requireWalletUser(request, reply);
    const walletRecord = await walletService.getWallet(user.userId);

    return {
      items: walletRecord.ledger.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      total: walletRecord.ledger.length,
    };
  });
};

export default wallet;
