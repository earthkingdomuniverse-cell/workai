import { Transaction, Receipt } from '../types/transaction';
import { mockTransactions, mockReceipts } from '../mocks/transactions';

export interface PaymentService {
  getTransactions(filters?: any): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getTransactionsByDealId(dealId: string): Promise<Transaction[]>;
  createTransaction(data: any): Promise<Transaction>;
  updateTransaction(id: string, data: any): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  getReceipts(filters?: any): Promise<Receipt[]>;
  getReceiptById(id: string): Promise<Receipt | null>;
  getReceiptsByDealId(dealId: string): Promise<Receipt[]>;
  createReceipt(data: any): Promise<Receipt>;
  updateReceipt(id: string, data: any): Promise<Receipt>;
  deleteReceipt(id: string): Promise<void>;
}

class PaymentServiceImpl implements PaymentService {
  async getTransactions(_filters?: any): Promise<Transaction[]> {
    // In a real implementation, this would query a database
    return mockTransactions;
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const transaction = mockTransactions.find((t) => t.id === id);
    return transaction || null;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return mockTransactions.filter((t) => t.userId === userId);
  }

  async getTransactionsByDealId(dealId: string): Promise<Transaction[]> {
    return mockTransactions.filter((t) => t.dealId === dealId);
  }

  async createTransaction(data: any): Promise<Transaction> {
    // In a real implementation, this would insert into a database
    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      dealId: data.dealId,
      amount: data.amount,
      currency: data.currency,
      type: data.type,
      status: 'pending',
      referenceNumber: `ref_${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTransactions.push(transaction);
    return transaction;
  }

  async updateTransaction(id: string, data: any): Promise<Transaction> {
    const index = mockTransactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction ${id} not found`);
    }

    const updated = {
      ...mockTransactions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockTransactions[index] = updated;
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    const index = mockTransactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction ${id} not found`);
    }

    mockTransactions.splice(index, 1);
  }

  async getReceipts(_filters?: any): Promise<Receipt[]> {
    return mockReceipts;
  }

  async getReceiptById(id: string): Promise<Receipt | null> {
    const receipt = mockReceipts.find((r) => r.id === id);
    return receipt || null;
  }

  async getReceiptsByDealId(dealId: string): Promise<Receipt[]> {
    return mockReceipts.filter((r) => r.dealId === dealId);
  }

  async createReceipt(data: any): Promise<Receipt> {
    const receipt: Receipt = {
      id: `rcpt_${Date.now()}`,
      dealId: data.dealId,
      transactionId: data.transactionId,
      amount: data.amount,
      currency: data.currency,
      items: data.items || [],
      subtotal: data.subtotal,
      serviceFee: data.serviceFee,
      total: data.total,
      paidAt: new Date().toISOString(),
      receiptNumber: `RCPT-${Date.now()}`,
      status: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockReceipts.push(receipt);
    return receipt;
  }

  async updateReceipt(id: string, data: any): Promise<Receipt> {
    const index = mockReceipts.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Receipt ${id} not found`);
    }

    const updated = {
      ...mockReceipts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockReceipts[index] = updated;
    return updated;
  }

  async deleteReceipt(id: string): Promise<void> {
    const index = mockReceipts.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Receipt ${id} not found`);
    }

    mockReceipts.splice(index, 1);
  }
}

export const paymentService = new PaymentServiceImpl();
