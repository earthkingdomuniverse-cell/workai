import { describe, it, expect } from 'vitest';
import { billingService } from '../services/billing';

describe('Billing payInvoice MVP', () => {
  it('should pay an unpaid invoice and create a transaction', async () => {
    // Create a subscription/invoice for a test user
    billingService.subscribe('test_user', 'free');
    const invoices = billingService.getInvoices('test_user');
    expect(invoices.length).toBeGreaterThan(0);
    const invoiceId = invoices[0].id;
    const res = billingService.payInvoice(invoiceId);
    expect(res.success).toBe(true);
    expect(res.invoice?.id).toBe(invoiceId);
    expect(res.invoice?.status).toBe('paid');
    expect(res.transaction).toBeDefined();
    expect(res.transaction?.amount).toBe(invoices[0].amount);
  });
});
