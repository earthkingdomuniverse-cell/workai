import { Invoice, Plan, PlanId, Subscription, Transaction } from '../types/billing';

// Predefined plans (for MVP)
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    pricePerMonth: 0,
    features: ['Basic access', 'Limited requests'],
    commissionRate: 0.0,
  },
  {
    id: 'pro',
    name: 'Pro',
    pricePerMonth: 29,
    features: ['Priority matching', 'Advanced analytics', 'AI credits'],
    commissionRate: 0.1,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    pricePerMonth: 199,
    features: ['Advanced SLAs', 'Dedicated support', 'Custom integrations'],
    commissionRate: 0.08,
  },
];

class BillingService {
  private subscriptions: Subscription[] = [];
  private invoices: Invoice[] = [];
  private transactions: Transaction[] = [];

  getAllInvoices(): Invoice[] {
    return this.invoices;
  }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  getPlans(): Plan[] {
    return PLANS;
  }

  getSubscriptionsFor(userId: string): Subscription[] {
    return this.subscriptions.filter((subscription) => subscription.userId === userId);
  }

  subscribe(userId: string, planId: PlanId): Subscription {
    const plan = PLANS.find((item) => item.id === planId) || PLANS[0];
    const sub: Subscription = {
      userId,
      planId: plan.id,
      startedAt: new Date().toISOString(),
      status: 'active',
    };
    this.subscriptions.push(sub);
    this.createInvoice(userId, plan.pricePerMonth, 'USD');
    return sub;
  }

  private createInvoice(userId: string, amount: number, currency: string) {
    const inv: Invoice = {
      id: `inv_${Date.now()}`,
      userId,
      amount,
      currency,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      status: 'unpaid',
      createdAt: new Date().toISOString(),
    };
    this.invoices.push(inv);
  }

  getInvoices(userId: string): Invoice[] {
    return this.invoices.filter((invoice) => invoice.userId === userId);
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    const t: Transaction = {
      id: `trx_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...tx,
    };
    this.transactions.push(t);
  }

  getTransactions(userId: string): Transaction[] {
    return this.transactions.filter((transaction) => transaction.userId === userId);
  }

  payInvoice(invoiceId: string): {
    success: boolean;
    invoice?: Invoice;
    transaction?: Transaction;
    error?: string;
  } {
    const idx = this.invoices.findIndex((invoice) => invoice.id === invoiceId);
    if (idx < 0) return { success: false, error: 'Invoice not found' };

    const inv = { ...this.invoices[idx], status: 'paid' as const };
    this.invoices[idx] = inv;
    const t: Transaction = {
      id: `trx_${Date.now()}`,
      userId: inv.userId,
      type: 'charge',
      amount: inv.amount,
      currency: inv.currency,
      reference: invoiceId,
      createdAt: new Date().toISOString(),
    };
    this.transactions.push(t);
    return { success: true, invoice: inv, transaction: t };
  }
}

export const billingService = new BillingService();
export default billingService;
