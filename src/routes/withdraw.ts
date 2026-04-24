import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { walletService } from '../services/walletService';

const withdraw: FastifyPluginAsync = async (fastify) => {

  fastify.post('/withdraw', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user || user.userId === 'guest_user') {
      throw new AppError('Authentication required', { code: 'AUTH_ERROR', statusCode: 401 });
    }

    const body = request.body as any;
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const wallet = await walletService.getWallet(user.userId);

    if (wallet.available < amount) {
      throw new AppError('Insufficient balance', { code: 'INSUFFICIENT_FUNDS', statusCode: 400 });
    }

    const tx = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { userId: user.userId },
        data: {
          available: wallet.available - amount,
          lifetimeOut: wallet.lifetimeOut + amount
        }
      });

      await tx.walletLedgerEntry.create({
        data: {
          walletId: updatedWallet.id,
          userId: user.userId,
          type: 'withdrawal',
          direction: 'debit',
          amount,
          currency: wallet.currency,
          balanceBefore: wallet.available,
          balanceAfter: updatedWallet.available,
          heldBefore: wallet.held,
          heldAfter: updatedWallet.held,
          idempotencyKey: `withdraw:${user.userId}:${Date.now()}`,
          description: 'User withdrawal request'
        }
      });

      return tx.transaction.create({
        data: {
          userId: user.userId,
          type: 'withdrawal',
          status: 'pending',
          amount,
          currency: wallet.currency,
          provider: body.method || 'manual',
          referenceNumber: `WD-${Date.now()}`
        }
      });
    });

    return {
      status: 'pending',
      message: 'Withdrawal request created',
      transactionId: tx.id
    };
  });

  fastify.get('/withdraw', async (request, reply) => {
    const user = await authenticate(request, reply);

    const items = await prisma.transaction.findMany({
      where: {
        userId: user.userId,
        type: 'withdrawal'
      },
      orderBy: { createdAt: 'desc' }
    });

    return { items };
  });
};

export default withdraw;
