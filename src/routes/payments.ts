import { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { getPaymentProvider } from '../services/payments';

function verifyZaloMac(data: string, mac: string, key2: string): boolean {
  const calc = crypto.createHmac('sha256', key2).update(data).digest('hex');
  return calc === mac;
}

const payments: FastifyPluginAsync = async (fastify) => {
  fastify.post('/payments/zalopay/create', async (request, reply) => {
    const body = request.body as any;

    const provider = getPaymentProvider('zalopay');

    const result = await provider.createPayment({
      dealId: body.dealId,
      userId: body.userId,
      amount: body.amount,
      currency: 'VND',
      description: body.description || 'Payment',
      callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
      metadata: { dealId: body.dealId },
    });

    return { checkoutUrl: result.checkoutUrl };
  });

  fastify.post('/payments/zalopay/callback', async (request, reply) => {
    const body = request.body as any;
    const key2 = process.env.ZALOPAY_KEY2!;

    const dataStr = body.data;
    const mac = body.mac;

    if (!verifyZaloMac(dataStr, mac, key2)) {
      return { return_code: -1, return_message: 'invalid mac' };
    }

    const data = JSON.parse(dataStr);

    const dealId = data.embed_data ? JSON.parse(data.embed_data).dealId : null;

    if (!dealId) {
      return { return_code: 0, return_message: 'missing dealId' };
    }

    await prisma.transaction.create({
      data: {
        dealId,
        userId: data.app_user,
        type: 'fund',
        status: 'completed',
        amount: data.amount,
        currency: 'VND',
        provider: 'zalopay',
        providerRef: data.app_trans_id,
        referenceNumber: `ZP-${data.zp_trans_id}`,
      },
    });

    await prisma.deal.update({
      where: { id: dealId },
      data: {
        status: 'funded',
        fundedAmount: data.amount,
      },
    });

    return { return_code: 1, return_message: 'success' };
  });
};

export default payments;
