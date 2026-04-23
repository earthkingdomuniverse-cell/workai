import { Transaction, Receipt } from '../types/transaction';

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    dealId: 'deal_1',
    amount: 12000,
    currency: 'USD',
    type: 'fund',
    status: 'completed',
    referenceNumber: 'REF-001',
    userId: 'user_1',
    userName: 'John Doe',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'txn_2',
    dealId: 'deal_1',
    amount: 12000,
    currency: 'USD',
    type: 'release',
    status: 'completed',
    referenceNumber: 'REF-002',
    userId: 'user_1',
    userName: 'John Doe',
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-05-15T10:00:00Z',
  },
  {
    id: 'txn_3',
    dealId: 'deal_2',
    amount: 2500,
    currency: 'USD',
    type: 'fund',
    status: 'completed',
    referenceNumber: 'REF-003',
    userId: 'user_2',
    userName: 'Jane Smith',
    createdAt: '2024-04-20T10:00:00Z',
    updatedAt: '2024-04-20T10:00:00Z',
  },
  {
    id: 'txn_4',
    dealId: 'deal_2',
    amount: 2500,
    currency: 'USD',
    type: 'release',
    status: 'completed',
    referenceNumber: 'REF-004',
    userId: 'user_2',
    userName: 'Jane Smith',
    createdAt: '2024-05-05T10:00:00Z',
    updatedAt: '2024-05-05T10:00:00Z',
  },
];

export const mockReceipts: Receipt[] = [
  {
    id: 'rcpt_1',
    dealId: 'deal_1',
    transactionId: 'txn_1',
    amount: 12000,
    currency: 'USD',
    items: [
      {
        id: 'item_1',
        description: 'E-commerce Website Development',
        quantity: 1,
        unitPrice: 12000,
        total: 12000,
      },
    ],
    subtotal: 12000,
    serviceFee: 600,
    total: 12600,
    paidAt: '2024-05-01T10:00:00Z',
    receiptNumber: 'RCPT-001',
    status: 'paid',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'rcpt_2',
    dealId: 'deal_2',
    transactionId: 'txn_2',
    amount: 2500,
    currency: 'USD',
    items: [
      {
        id: 'item_2',
        description: 'UI/UX Design Services',
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
      },
    ],
    subtotal: 2500,
    serviceFee: 125,
    total: 2625,
    paidAt: '2024-05-05T10:00:00Z',
    receiptNumber: 'RCPT-002',
    status: 'paid',
    createdAt: '2024-05-05T10:00:00Z',
    updatedAt: '2024-05-05T10:00:00Z',
  },
];

export function getTransactionById(id: string): Transaction | undefined {
  return mockTransactions.find((txn) => txn.id === id);
}

export function getTransactionsByUserId(userId: string): Transaction[] {
  return mockTransactions.filter((txn) => txn.userId === userId);
}

export function getTransactionsByDealId(dealId: string): Transaction[] {
  return mockTransactions.filter((txn) => txn.dealId === dealId);
}

export function createTransaction(
  transactionData: Partial<Transaction> & { userId: string; userName: string },
): Transaction {
  const transaction: Transaction = {
    id: `txn_${Date.now()}`,
    dealId: transactionData.dealId || '',
    amount: transactionData.amount || 0,
    currency: transactionData.currency || 'USD',
    type: transactionData.type || 'fund',
    status: transactionData.status || 'pending',
    referenceNumber: `REF-${Date.now()}`,
    userId: transactionData.userId,
    userName: transactionData.userName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockTransactions.push(transaction);
  return transaction;
}
