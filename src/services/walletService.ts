import { prisma } from '../lib/prisma';

export type WalletEntryType = 'deposit' | 'hold' | 'release' | 'refund' | 'fee' | 'withdrawal';

async function getOrCreateWallet(tx: any, userId: string, currency = 'VND') {
  const existing = await tx.wallet.findUnique({ where: { userId } });

  if (existing) return existing;

  return tx.wallet.create({
    data: {
      userId,
      currency,
      available: 0,
      held: 0,
      lifetimeIn: 0,
      lifetimeOut: 0,
    },
  });
}

export const walletService = {
  async getWallet(userId: string) {
    return prisma.wallet.upsert({
      where: { userId },
      create: { userId, currency: 'VND' },
      update: {},
      include: { ledger: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
  },

  async deposit(input: {
    userId: string;
    amount: number;
    currency?: string;
    provider?: string;
    providerRef?: string;
    transactionId?: string;
    description?: string;
    metadata?: any;
    idempotencyKey: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.walletLedgerEntry.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;

      const wallet = await getOrCreateWallet(tx, input.userId, input.currency || 'VND');
      const balanceBefore = wallet.available;
      const balanceAfter = balanceBefore + input.amount;

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          available: balanceAfter,
          lifetimeIn: wallet.lifetimeIn + input.amount,
        },
      });

      return tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: input.userId,
          type: 'deposit',
          direction: 'credit',
          amount: input.amount,
          currency: input.currency || wallet.currency,
          balanceBefore,
          balanceAfter: updated.available,
          heldBefore: wallet.held,
          heldAfter: updated.held,
          provider: input.provider,
          providerRef: input.providerRef,
          transactionId: input.transactionId,
          idempotencyKey: input.idempotencyKey,
          description: input.description,
          metadata: input.metadata,
        },
      });
    });
  },

  async holdForDeal(input: {
    userId: string;
    dealId: string;
    amount: number;
    currency?: string;
    idempotencyKey: string;
    description?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.walletLedgerEntry.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;

      const wallet = await getOrCreateWallet(tx, input.userId, input.currency || 'VND');

      if (wallet.available < input.amount) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      const balanceBefore = wallet.available;
      const heldBefore = wallet.held;
      const balanceAfter = wallet.available - input.amount;
      const heldAfter = wallet.held + input.amount;

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          available: balanceAfter,
          held: heldAfter,
        },
      });

      return tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: input.userId,
          type: 'hold',
          direction: 'debit',
          amount: input.amount,
          currency: input.currency || wallet.currency,
          balanceBefore,
          balanceAfter: updated.available,
          heldBefore,
          heldAfter: updated.held,
          dealId: input.dealId,
          idempotencyKey: input.idempotencyKey,
          description: input.description || `Hold funds for deal ${input.dealId}`,
        },
      });
    });
  },

  async releaseDeal(input: {
    clientId: string;
    providerId: string;
    dealId: string;
    amount: number;
    currency?: string;
    feeAmount?: number;
    idempotencyKey: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.walletLedgerEntry.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;

      const clientWallet = await getOrCreateWallet(tx, input.clientId, input.currency || 'VND');
      const providerWallet = await getOrCreateWallet(tx, input.providerId, input.currency || 'VND');
      const feeAmount = input.feeAmount || 0;
      const providerAmount = input.amount - feeAmount;

      if (clientWallet.held < input.amount) {
        throw new Error('INSUFFICIENT_HELD_FUNDS');
      }

      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: {
          held: clientWallet.held - input.amount,
          lifetimeOut: clientWallet.lifetimeOut + input.amount,
        },
      });

      const updatedProviderWallet = await tx.wallet.update({
        where: { id: providerWallet.id },
        data: {
          available: providerWallet.available + providerAmount,
          lifetimeIn: providerWallet.lifetimeIn + providerAmount,
        },
      });

      return tx.walletLedgerEntry.create({
        data: {
          walletId: providerWallet.id,
          userId: input.providerId,
          type: 'release',
          direction: 'credit',
          amount: providerAmount,
          currency: input.currency || providerWallet.currency,
          balanceBefore: providerWallet.available,
          balanceAfter: updatedProviderWallet.available,
          heldBefore: providerWallet.held,
          heldAfter: updatedProviderWallet.held,
          dealId: input.dealId,
          idempotencyKey: input.idempotencyKey,
          description: `Release funds from deal ${input.dealId}`,
          metadata: { feeAmount },
        },
      });
    });
  },
};
