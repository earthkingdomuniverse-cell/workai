import { Transaction, Receipt } from '../types/transaction';
import { prisma } from '../db/prismaClient';
import { NotFoundError } from '../lib/errors';

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

// Simple in-memory mock for receipts since they are not in DB schema yet
const mockReceipts: Receipt[] = [];

class PaymentServiceImpl implements PaymentService {
  async getTransactions(_filters?: any): Promise<Transaction[]> {
    const txns = await prisma.transaction.findMany();
    return txns.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })) as unknown as Transaction[];
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    const t = await prisma.transaction.findUnique({ where: { id }});
    if (!t) return null;
    return {
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    } as unknown as Transaction;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const txns = await prisma.transaction.findMany({ where: { userId } });
    return txns.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })) as unknown as Transaction[];
  }

  async getTransactionsByDealId(dealId: string): Promise<Transaction[]> {
    const txns = await prisma.transaction.findMany({ where: { dealId } });
    return txns.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })) as unknown as Transaction[];
  }

  async createTransaction(data: any): Promise<Transaction> {
    const t = await prisma.transaction.create({
      data: {
        dealId: data.dealId,
        amount: data.amount,
        currency: data.currency || 'USD',
        type: data.type,
        status: data.status || 'pending',
        referenceNumber: data.referenceNumber || `ref_${Date.now()}`,
        userId: data.userId,
        userName: data.userName,
        description: data.description,
        paymentMethod: data.paymentMethod,
        receiptId: data.receiptId,
      }
    });

    return {
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    } as unknown as Transaction;
  }

  async updateTransaction(id: string, data: any): Promise<Transaction> {
    try {
      const t = await prisma.transaction.update({
        where: { id },
        data
      });
      return {
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      } as unknown as Transaction;
    } catch(e) {
      throw new NotFoundError(`Transaction ${id} not found`);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      await prisma.transaction.delete({ where: { id }});
    } catch(e) {
      throw new NotFoundError(`Transaction ${id} not found`);
    }
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
      throw new NotFoundError(`Receipt ${id} not found`);
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
      throw new NotFoundError(`Receipt ${id} not found`);
    }

    mockReceipts.splice(index, 1);
  }
}

export const paymentService = new PaymentServiceImpl();
