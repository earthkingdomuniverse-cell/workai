import { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { getPaymentProvider } from '../services/payments';
import { AppError } from '../lib/errors';

function verifyZaloMac(data: string, mac: string, key2: string): boolean {
  const calc = crypto.createHmac('sha256', key2).update(data).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(mac));
}

function parseEmbedData(raw: unknown): Record<string, any> {
  if (!raw || typeof raw !== 'string') return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const payments: FastifyPluginAsync = async (fastify) => {
  fastify.post('/payments/zalopay/create', async (request, reply) => {
    const body = request.body as any;

    if (!body.dealId || !body.userId) {
      throw new AppError('dealId and userId are required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const deal = await prisma.deal.findUnique({ where: { id: body.dealId } });

    if (!deal) {
      throw new AppError('Deal not found', { code: 'NOT_FOUND', statusCode: 404 });
    }

    if (deal.clientId !== body.userId) {
      throw new AppError('Only the client can fund this deal', {
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    if (deal.status !== 'created') {
      throw new AppError(`Cannot create payment for deal with status: ${deal.status}`, {
        code: 'BAD_REQUEST',
        statusCode: 400,
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
      userId: body.userId,
      amount,
      currency: 'VND',
      description: body.description || `Fund deal ${deal.id}`,
      callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
      metadata: { dealId: body.dealId },
    });

    await prisma.transaction.create({
      data: {
        dealId: body.dealId,
        userId: body.userId,
        type: 'fund',
        status: 'pending',
        amount,
        currency: 'VND',
        provider: 'zalopay',
        providerRef: result.providerRef,
        referenceNumber: `ZP-PENDING-${result.providerRef}`,
      },
    });

    return {
      provider: result.provider,
      providerRef: result.providerRef,
      checkoutUrl: result.checkoutUrl,
      status: result.status,
    };
  });

  fastify.post('/payments/zalopay/callback', async (request, reply) => {
    const body = request.body as any;
    const key2 = process.env.ZALOPAY_KEY2;

    if (!key2) {
      return { return_code: -1, return_message: 'missing callback key' };
    }

    const dataStr = body.data;
    const mac = body.mac;

    if (!dataStr || !mac || !verifyZaloMac(dataStr, mac, key2)) {
      return { return_code: -1, return_message: 'invalid mac' };
    }

    const data = JSON.parse(dataStr);
    const embedData = parseEmbedData(data.embed_data);
    const dealId = embedData.dealId;
    const providerRef = data.app_trans_id;
    const amount = Number(data.amount);

    if (!dealId || !providerRef || !amount) {
      return { return_code: 0, return_message: 'missing required payment data' };
    }

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });

    if (!deal) {
      return { return_code: 0, return_message: 'deal not found' };
    }

    if (amount > deal.amount) {
      return { return_code: 0, return_message: 'amount exceeds deal amount' };
    }

    await prisma.$transaction(async (tx) => {
      const existingCompleted = await tx.transaction.findFirst({
        where: {
          provider: 'zalopay',
          providerRef,
          status: 'completed',
        },
      });

      if (existingCompleted) {
        return;
      }

      const pending = await tx.transaction.findFirst({
        where: {
          provider: 'zalopay',
          providerRef,
          status: 'pending',
        },
      });

      if (pending) {
        await tx.transaction.update({
          where: { id: pending.id },
          data: {
            status: 'completed',
            amount,
            referenceNumber: `ZP-${data.zp_trans_id}`,
          },
        });
      } else {
        await tx.transaction.create({
          data: {
            dealId,
            userId: data.app_user,
            type: 'fund',
            status: 'completed',
            amount,
            currency: 'VND',
            provider: 'zalopay',
            providerRef,
            referenceNumber: `ZP-${data.zp_trans_id}`,
          },
        });
      }

      await tx.deal.update({
        where: { id: dealId },
        data: {
          status: 'funded',
          fundedAmount: amount,
        },
      });
    });

    return { return_code: 1, return_message: 'success' };
  });
};

export default payments;
