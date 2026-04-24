export type PlanId = 'free' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  pricePerMonth: number; // in USD for MVP
  features: string[];
  monthlyActiveUsers?: number;
  commissionRate?: number; // percent of deal value
}

export interface Subscription {
  userId: string;
  planId: PlanId;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'cancelled' | 'past_due';
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'charge' | 'credit' | 'refund' | 'commission';
  amount: number;
  currency: string;
  reference?: string;
  createdAt: string;
}
