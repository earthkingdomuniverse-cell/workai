import crypto from 'crypto';
import { PaymentProvider, CreatePaymentInput, CreatePaymentResult, VerifyPaymentInput, VerifyPaymentResult } from './types';

const ZALOPAY_ENDPOINT = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create';

function hmacSHA256(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

export const zaloPayProvider: PaymentProvider = {
  name: 'zalopay',

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const appId = process.env.ZALOPAY_APP_ID!;
    const key1 = process.env.ZALOPAY_KEY1!;

    const appTransId = `${new Date().toISOString().slice(2,10).replace(/-/g,'')}_${Date.now()}`;
    const appTime = Date.now();

    const order = {
      app_id: Number(appId),
      app_user: input.userId,
      app_trans_id: appTransId,
      app_time: appTime,
      amount: Math.round(input.amount),
      description: input.description,
      embed_data: JSON.stringify(input.metadata || {}),
      item: '[]',
      callback_url: input.callbackUrl,
    };

    const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    const mac = hmacSHA256(data, key1);

    const res = await fetch(ZALOPAY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...order, mac }),
    });

    const json = await res.json();

    return {
      provider: 'zalopay',
      providerRef: appTransId,
      status: 'pending',
      amount: input.amount,
      currency: 'VND',
      checkoutUrl: json.order_url,
      raw: json,
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    return {
      provider: 'zalopay',
      providerRef: input.providerRef,
      status: 'processing',
    };
  },
};
