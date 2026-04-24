import crypto from 'crypto';
import { PaymentProvider, CreatePaymentInput, CreatePaymentResult, VerifyPaymentInput, VerifyPaymentResult } from './types';

const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

function hmacSHA256(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

function encodeExtraData(metadata?: Record<string, string | number | boolean | null>): string {
  if (!metadata || Object.keys(metadata).length === 0) return '';
  return Buffer.from(JSON.stringify(metadata)).toString('base64');
}

export const momoProvider: PaymentProvider = {
  name: 'momo',

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const partnerCode = process.env.MOMO_PARTNER_CODE!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;
    const secretKey = process.env.MOMO_SECRET_KEY!;
    const requestType = process.env.MOMO_REQUEST_TYPE || 'captureWallet';

    const requestId = `momo_${Date.now()}`;
    const orderId = requestId;
    const amount = Math.round(input.amount);
    const orderInfo = input.description;
    const redirectUrl = input.redirectUrl || process.env.MOMO_REDIRECT_URL || '';
    const ipnUrl = input.callbackUrl || process.env.MOMO_IPN_URL || '';
    const extraData = encodeExtraData({ ...input.metadata, dealId: input.dealId });

    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = hmacSHA256(rawSignature, secretKey);

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi',
    };

    const res = await fetch(MOMO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    return {
      provider: 'momo',
      providerRef: orderId,
      status: 'pending',
      amount,
      currency: 'VND',
      checkoutUrl: json.payUrl,
      deepLink: json.deeplink,
      qrCode: json.qrCodeUrl,
      raw: json,
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    return {
      provider: 'momo',
      providerRef: input.providerRef,
      status: 'processing',
    };
  },
};
