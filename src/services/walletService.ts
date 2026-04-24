import { prisma } from '../lib/prisma';

export type WalletEntryType = 'deposit' | 'hold' | 'release' | 'refund' | 'fee' | 'withdrawal';

const PLATFORM_WALLET_USER_ID = process.env.PLATFORM_WALLET_USER_ID || 'platform';

async function getOrCreateWallet(tx: any, userId: string, currency = 'VND') {
  const existing = await tx.wallet.findUnique({ where: { userId } });

  if (existing) return existing;

  await tx.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@system.local`,
      passwordHash: 'system',
      role: userId === PLATFORM_WALLET_USER_ID ? 'platform' : 'member',
    },
  });

  return tx.wallet.create({
    data: { userId, currency, available: 0, held: 0, lifetimeIn: 0, lifetimeOut: 0 },
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
      const existing = await tx.walletLedgerEntry.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return existing;

      const wallet = await getOrCreateWallet(tx, input.userId, input.currency || 'VND');
      const balanceBefore = wallet.available;
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { available: wallet.available + input.amount, lifetimeIn: wallet.lifetimeIn + input.amount },
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
      const existing = await tx.walletLedgerEntry.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return existing;

      const wallet = await getOrCreateWallet(tx, input.userId, input.currency || 'VND');
      if (wallet.available < input.amount) throw new Error('INSUFFICIENT_FUNDS');

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { available: wallet.available - input.amount, held: wallet.held + input.amount },
      });

      return tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: input.userId,
          type: 'hold',
          direction: 'debit',
          amount: input.amount,
          currency: input.currency || wallet.currency,
          balanceBefore: wallet.available,
          balanceAfter: updated.available,
          heldBefore: wallet.held,
          heldAfter: updated.held,
          dealId: input.dealId,
          idempotencyKey: input.idempotencyKey,
          description: input.description || `Hold funds for deal ${input.dealId}`,
        },
      });
    });
  },

  async reverseWithdrawal(input: {
    userId: string;
    amount: number;
    currency?: string;
    transactionId?: string;
    idempotencyKey: string;
    description?: string;
    metadata?: any;
  }) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.walletLedgerEntry.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return existing;

      const wallet = await getOrCreateWallet(tx, input.userId, input.currency || 'VND');
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          available: wallet.available + input.amount,
          lifetimeOut: Math.max(0, wallet.lifetimeOut - input.amount),
        },
      });

      return tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          userId: input.userId,
          type: 'refund',
          direction: 'credit',
          amount: input.amount,
          currency: input.currency || wallet.currency,
          balanceBefore: wallet.available,
          balanceAfter: updated.available,
          heldBefore: wallet.held,
          heldAfter: updated.held,
          transactionId: input.transactionId,
          idempotencyKey: input.idempotencyKey,
          description: input.description || 'Withdrawal reversed',
          metadata: input.metadata,
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
      const existing = await tx.walletLedgerEntry.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return existing;

      const clientWallet = await getOrCreateWallet(tx, input.clientId, input.currency || 'VND');
      const providerWallet = await getOrCreateWallet(tx, input.providerId, input.currency || 'VND');
      const platformWallet = await getOrCreateWallet(tx, PLATFORM_WALLET_USER_ID, input.currency || 'VND');
      const feeAmount = Math.max(0, input.feeAmount || 0);
      const providerAmount = input.amount - feeAmount;

      if (providerAmount < 0) throw new Error('INVALID_FEE_AMOUNT');
      if (clientWallet.held < input.amount) throw new Error('INSUFFICIENT_HELD_FUNDS');

      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: { held: clientWallet.held - input.amount, lifetimeOut: clientWallet.lifetimeOut + input.amount },
      });

      const updatedProviderWallet = await tx.wallet.update({
        where: { id: providerWallet.id },
        data: { available: providerWallet.available + providerAmount, lifetimeIn: providerWallet.lifetimeIn + providerAmount },
      });

      const providerLedger = await tx.walletLedgerEntry.create({
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

      if (feeAmount > 0) {
        const updatedPlatformWallet = await tx.wallet.update({
          where: { id: platformWallet.id },
          data: { available: platformWallet.available + feeAmount, lifetimeIn: platformWallet.lifetimeIn + feeAmount },
        });

        await tx.walletLedgerEntry.create({
          data: {
            walletId: platformWallet.id,
            userId: PLATFORM_WALLET_USER_ID,
            type: 'fee',
            direction: 'credit',
            amount: feeAmount,
            currency: input.currency || platformWallet.currency,
            balanceBefore: platformWallet.available,
            balanceAfter: updatedPlatformWallet.available,
            heldBefore: platformWallet.held,
            heldAfter: updatedPlatformWallet.held,
            dealId: input.dealId,
            idempotencyKey: `${input.idempotencyKey}:fee`,
            description: `Platform fee from deal ${input.dealId}`,
            metadata: { providerAmount },
          },
        });
      }

      return providerLedger;
    });
  },
};
