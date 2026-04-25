import { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { getPaymentProvider } from '../services/payments';
import { AppError } from '../lib/errors';
import { walletService } from '../services/walletService';
import { authenticate, AuthContext } from '../lib/auth';

function verifyZaloMac(data: string, mac: string, key2: string): boolean {
  const calc = crypto.createHmac('sha256', key2).update(data).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(mac));
}

function isOperatorUser(user: AuthContext) {
  return user.role === 'operator' || user.role === 'admin';
}

async function requirePaymentUser(request: any, reply: any): Promise<AuthContext> {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

function parseEmbedData(raw: unknown): Record<string, any> {
  if (!raw || typeof raw !== 'string') return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writePaymentAuditLog(input: {
  provider: string;
  providerRef?: string | null;
  eventType: string;
  status: string;
  dealId?: string | null;
  amount?: number | null;
  currency?: string | null;
  message?: string | null;
  raw?: any;
}) {
  await prisma.paymentAuditLog.create({
    data: {
      provider: input.provider,
      providerRef: input.providerRef || undefined,
      eventType: input.eventType,
      status: input.status,
      dealId: input.dealId || undefined,
      amount: input.amount || undefined,
      currency: input.currency || undefined,
      message: input.message || undefined,
      raw: input.raw,
    },
  });
}

const payments: FastifyPluginAsync = async (fastify) => {
  fastify.get('/payments/status', async (request, reply) => {
    const user = await requirePaymentUser(request, reply);
    const query = request.query as Record<string, string | undefined>;

    if (!query.provider || !query.providerRef) {
      throw new AppError('provider and providerRef are required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        provider: query.provider,
        providerRef: query.providerRef,
      },
      include: {
        deal: true,
      },
    });

    if (!transaction) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Payment not found' } });
    }

    const canView = isOperatorUser(user)
      || transaction.userId === user.userId
      || transaction.deal?.clientId === user.userId
      || transaction.deal?.providerId === user.userId;

    if (!canView) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Cannot view this payment' } });
    }

    return {
      provider: transaction.provider,
      providerRef: transaction.providerRef,
      status: transaction.status,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      dealId: transaction.dealId,
      dealStatus: transaction.deal?.status,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  });

  fastify.post('/payments/zalopay/create', async (request, reply) => {
    const user = await requirePaymentUser(request, reply);
    const body = request.body as any;

    if (!body.dealId) {
      throw new AppError('dealId is required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const deal = await prisma.deal.findUnique({ where: { id: body.dealId } });

    if (!deal) {
      throw new AppError('Deal not found', { code: 'NOT_FOUND', statusCode: 404 });
    }

    if (deal.clientId !== user.userId) {
      throw new AppError('Only the client can fund this deal', {
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    const amount = Number(body.amount || deal.amount);

    if (amount <= 0 || amount > deal.amount) {
      throw new AppError('Payment amount is invalid', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const provider = getPaymentProvider('zalopay');

    const result = await provider.createPayment({
      dealId: body.dealId,
      userId: user.userId,
      amount,
      currency: 'VND',
      description: body.description || `Top up wallet for deal ${deal.id}`,
      callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
      metadata: { dealId: body.dealId, userId: user.userId, purpose: 'wallet_topup' },
    });

    await prisma.transaction.create({
      data: {
        dealId: body.dealId,
        userId: user.userId,
        type: 'deposit',
        status: 'pending',
        amount,
        currency: 'VND',
        provider: 'zalopay',
        providerRef: result.providerRef,
        referenceNumber: `ZP-PENDING-${result.providerRef}`,
      },
    });

    await writePaymentAuditLog({
      provider: 'zalopay',
      providerRef: result.providerRef,
      eventType: 'create_wallet_topup',
      status: 'pending',
      dealId: body.dealId,
      amount,
      currency: 'VND',
      message: 'ZaloPay wallet top-up created',
      raw: result.raw,
    });

    return {
      provider: result.provider,
      providerRef: result.providerRef,
      checkoutUrl: result.checkoutUrl,
      status: result.status,
      purpose: 'wallet_topup',
    };
  });

  fastify.post('/payments/zalopay/callback', async (request, _reply) => {
    const body = request.body as any;
    const key2 = process.env.ZALOPAY_KEY2;

    if (!key2) {
      await writePaymentAuditLog({
        provider: 'zalopay',
        eventType: 'callback',
        status: 'failed',
        message: 'missing callback key',
        raw: body,
      });
      return { return_code: -1, return_message: 'missing callback key' };
    }

    const dataStr = body.data;
    const mac = body.mac;

    if (!dataStr || !mac || !verifyZaloMac(dataStr, mac, key2)) {
      await writePaymentAuditLog({
        provider: 'zalopay',
        eventType: 'callback',
        status: 'failed',
        message: 'invalid mac',
        raw: body,
      });
      return { return_code: -1, return_message: 'invalid mac' };
    }

    const data = JSON.parse(dataStr);
    const embedData = parseEmbedData(data.embed_data);
    const dealId = embedData.dealId;
    const providerRef = data.app_trans_id;
    const amount = Number(data.amount);
    const userId = embedData.userId || data.app_user;

    if (!providerRef || !amount || !userId) {
      await writePaymentAuditLog({
        provider: 'zalopay',
        providerRef,
        eventType: 'callback',
        status: 'failed',
        dealId,
        amount,
        currency: 'VND',
        message: 'missing required wallet top-up data',
        raw: data,
      });
      return { return_code: 0, return_message: 'missing required wallet top-up data' };
    }

    const completedTransaction = await prisma.$transaction(async (tx) => {
      const existingCompleted = await tx.transaction.findFirst({
        where: {
          provider: 'zalopay',
          providerRef,
          status: 'completed',
        },
      });

      if (existingCompleted) {
        await tx.paymentAuditLog.create({
          data: {
            provider: 'zalopay',
            providerRef,
            eventType: 'callback_duplicate',
            status: 'ignored',
            dealId,
            amount,
            currency: 'VND',
            message: 'duplicate completed wallet top-up callback ignored',
            raw: data,
          },
        });
        return existingCompleted;
      }

      const pending = await tx.transaction.findFirst({
        where: {
          provider: 'zalopay',
          providerRef,
          status: 'pending',
        },
      });

      if (pending) {
        return tx.transaction.update({
          where: { id: pending.id },
          data: {
            status: 'completed',
            amount,
            referenceNumber: `ZP-${data.zp_trans_id}`,
          },
        });
      }

      return tx.transaction.create({
        data: {
          dealId,
          userId,
          type: 'deposit',
          status: 'completed',
          amount,
          currency: 'VND',
          provider: 'zalopay',
          providerRef,
          referenceNumber: `ZP-${data.zp_trans_id}`,
        },
      });
    });

    await walletService.deposit({
      userId,
      amount,
      currency: 'VND',
      provider: 'zalopay',
      providerRef,
      transactionId: completedTransaction.id,
      idempotencyKey: `deposit:zalopay:${providerRef}`,
      description: 'ZaloPay wallet top-up',
      metadata: { dealId, raw: data },
    });

    await writePaymentAuditLog({
      provider: 'zalopay',
      providerRef,
      eventType: 'callback',
      status: 'success',
      dealId,
      amount,
      currency: 'VND',
      message: 'wallet top-up completed',
      raw: data,
    });

    return { return_code: 1, return_message: 'success' };
  });
};

export default payments;
