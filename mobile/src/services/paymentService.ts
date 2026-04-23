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

export const paymentService = {
  async getTransactions(filters?: {
    userId?: string;
    dealId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
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
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  async getReceipts(filters?: { dealId?: string }): Promise<Receipt[]> {
    const params = new URLSearchParams();
    if (filters?.dealId) params.append('dealId', filters.dealId);

    const query = params.toString();
    const response = await apiClient.get(query ? `/receipts?${query}` : '/receipts');
    return response.data?.items || [];
  },

  async getReceipt(id: string): Promise<Receipt> {
    const response = await apiClient.get(`/receipts/${id}`);
    return response.data;
  },

  async getDealReceipts(dealId: string): Promise<Receipt[]> {
    const response = await apiClient.get(`/deals/${dealId}/receipts`);
    return response.data?.items || [];
  },
};

export default paymentService;
