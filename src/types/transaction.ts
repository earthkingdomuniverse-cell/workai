import { Timestamps } from './common';

export type TransactionType =
  | 'fund'
  | 'release'
  | 'refund'
  | 'payout'
  | 'service_fee'
  | 'dispute_resolution';
export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Transaction extends Timestamps {
  id: string;
  dealId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  referenceNumber: string;
  description?: string;
  paymentMethod?: string;
  receiptId?: string;
  metadata?: Record<string, any>;
  userId: string;
  userName: string;
}

export interface Receipt extends Timestamps {
  id: string;
  dealId: string;
  transactionId: string;
  amount: number;
  currency: string;
  items: ReceiptItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paidAt: string;
  receiptNumber: string;
  status: 'paid' | 'refunded' | 'void';
  pdfUrl?: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TransactionFilter {
  userId?: string;
  dealId?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'amount' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTransactionInput {
  dealId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
  paymentMethod?: string;
}

export interface UpdateTransactionInput {
  status?: TransactionStatus;
  receiptId?: string;
  metadata?: Record<string, any>;
}
