import { ENABLE_MOCK_MODE } from '../constants/config';
import apiClient from './apiClient';

export interface Transaction {
  id: string;
  dealId: string;
  amount: number;
  currency: string;
  type: 'fund' | 'release' | 'refund' | 'payout' | 'service_fee' | 'dispute_resolution';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  referenceNumber: string;
  description?: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  dealId: string;
  transactionId: string;
  amount: number;
  currency: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paidAt: string;
  receiptNumber: string;
  status: 'paid' | 'refunded' | 'void';
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    dealId: 'deal_1',
    amount: 5000,
    currency: 'USD',
    type: 'fund',
    status: 'completed',
    referenceNumber: 'PAY-2026-0001',
    description: 'Escrow funding for AI web app project',
    userId: 'user_1',
    userName: 'John Doe',
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:05:00.000Z',
  },
  {
    id: 'txn_2',
    dealId: 'deal_1',
    amount: 4500,
    currency: 'USD',
    type: 'release',
    status: 'completed',
    referenceNumber: 'PAY-2026-0002',
    description: 'Release payment to provider after delivery approval',
    userId: 'user_2',
    userName: 'Jane Smith',
    createdAt: '2026-04-22T14:30:00.000Z',
    updatedAt: '2026-04-22T14:45:00.000Z',
  },
];

const mockReceipts: Receipt[] = [
  {
    id: 'receipt_1',
    dealId: 'deal_1',
    transactionId: 'txn_1',
    amount: 5000,
    currency: 'USD',
    items: [
      {
        id: 'receipt_item_1',
        description: 'AI-Powered Web Application Development',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      },
    ],
    subtotal: 5000,
    serviceFee: 250,
    total: 5250,
    paidAt: '2026-04-20T10:05:00.000Z',
    receiptNumber: 'RCP-2026-0001',
    status: 'paid',
    createdAt: '2026-04-20T10:05:00.000Z',
    updatedAt: '2026-04-20T10:05:00.000Z',
  },
];

export const paymentService = {
  async getTransactions(filters?: {
    userId?: string;
    dealId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    if (ENABLE_MOCK_MODE) {
      return mockTransactions.filter((item) => {
        if (filters?.userId && item.userId !== filters.userId) return false;
        if (filters?.dealId && item.dealId !== filters.dealId) return false;
        if (filters?.status && item.status !== filters.status) return false;
        if (filters?.type && item.type !== filters.type) return false;
        return true;
      });
    }

    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.dealId) params.append('dealId', filters.dealId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const query = params.toString();
      const response = await apiClient.get(query ? `/transactions?${query}` : '/transactions');
      return response.data?.items || [];
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      return mockTransactions.filter((item) => {
        if (filters?.userId && item.userId !== filters.userId) return false;
        if (filters?.dealId && item.dealId !== filters.dealId) return false;
        if (filters?.status && item.status !== filters.status) return false;
        if (filters?.type && item.type !== filters.type) return false;
        return true;
      });
    }
  },

  async getTransaction(id: string): Promise<Transaction> {
    if (ENABLE_MOCK_MODE) {
      const transaction = mockTransactions.find((item) => item.id === id);
      if (!transaction) throw new Error('Transaction not found');
      return transaction;
    }

    try {
      const response = await apiClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const transaction = mockTransactions.find((item) => item.id === id);
      if (!transaction) throw new Error('Transaction not found');
      return transaction;
    }
  },

  async getReceipts(filters?: { dealId?: string }): Promise<Receipt[]> {
    if (ENABLE_MOCK_MODE) {
      return filters?.dealId
        ? mockReceipts.filter((receipt) => receipt.dealId === filters.dealId)
        : mockReceipts;
    }

    try {
      const params = new URLSearchParams();
      if (filters?.dealId) params.append('dealId', filters.dealId);

      const query = params.toString();
      const response = await apiClient.get(query ? `/receipts?${query}` : '/receipts');
      return response.data?.items || [];
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      return filters?.dealId
        ? mockReceipts.filter((receipt) => receipt.dealId === filters.dealId)
        : mockReceipts;
    }
  },

  async getReceipt(id: string): Promise<Receipt> {
    if (ENABLE_MOCK_MODE) {
      const receipt = mockReceipts.find((item) => item.id === id);
      if (!receipt) throw new Error('Receipt not found');
      return receipt;
    }

    try {
      const response = await apiClient.get(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const receipt = mockReceipts.find((item) => item.id === id);
      if (!receipt) throw new Error('Receipt not found');
      return receipt;
    }
  },

  async getDealReceipts(dealId: string): Promise<Receipt[]> {
    if (ENABLE_MOCK_MODE) {
      return mockReceipts.filter((receipt) => receipt.dealId === dealId);
    }

    try {
      const response = await apiClient.get(`/deals/${dealId}/receipts`);
      return response.data?.items || [];
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      return mockReceipts.filter((receipt) => receipt.dealId === dealId);
    }
  },
};

export default paymentService;
