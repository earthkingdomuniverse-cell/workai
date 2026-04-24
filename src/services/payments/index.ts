import { PaymentProvider, PaymentProviderName } from './types';
import { zaloPayProvider } from './zalopay';
import { momoProvider } from './momo';

const registry: Partial<Record<PaymentProviderName, PaymentProvider>> = {
  zalopay: zaloPayProvider,
  momo: momoProvider,
};

export function getPaymentProvider(name: PaymentProviderName): PaymentProvider {
  const selected = registry[name];

  if (!selected) {
    throw new Error(`Unsupported payment provider: ${name}`);
  }

  return selected;
}

export * from './types';
export { zaloPayProvider, momoProvider };
