export type PaymentProviderName = 'manual' | 'zalopay' | 'momo' | 'vnpay' | 'stripe' | 'paypal';

export type PaymentCurrency = 'VND' | 'USD';

export interface CreatePaymentInput {
  dealId: string;
  userId: string;
  amount: number;
  currency: PaymentCurrency;
  description: string;
  redirectUrl?: string;
  callbackUrl?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface CreatePaymentResult {
  provider: PaymentProviderName;
  providerRef: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: PaymentCurrency;
  checkoutUrl?: string;
  deepLink?: string;
  qrCode?: string;
  raw?: unknown;
}

export interface VerifyPaymentInput {
  providerRef: string;
  amount?: number;
  currency?: PaymentCurrency;
}

export interface VerifyPaymentResult {
  provider: PaymentProviderName;
  providerRef: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount?: number;
  currency?: PaymentCurrency;
  raw?: unknown;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}
