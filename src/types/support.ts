export interface SupportTicketInput {
  message: string;
  userId?: string;
}

export interface SupportTicketOutput {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  answer: string;
  confidence: number;
  escalationRequired: boolean;
}

export interface SupportCategory {
  id: string;
  keywords: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  answer: string;
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: 'payment',
    keywords: ['payment', 'refund', 'billing', 'transaction', 'charge'],
    priority: 'high',
    answer:
      'For payment and billing issues, check your transaction history first. If the issue continues, contact billing support.',
  },
  {
    id: 'account',
    keywords: ['login', 'password', 'account', 'register', 'profile'],
    priority: 'medium',
    answer:
      'For account issues, try password reset or updating your profile settings. If access is blocked, contact support.',
  },
  {
    id: 'technical',
    keywords: ['bug', 'error', 'crash', 'slow', 'app'],
    priority: 'medium',
    answer:
      'For technical issues, try restarting the app and checking your network connection. If it persists, report the bug.',
  },
  {
    id: 'deal',
    keywords: ['deal', 'proposal', 'release', 'fund', 'submit', 'dispute'],
    priority: 'high',
    answer:
      'For deal-related issues, review the current deal status and required next action. Open a dispute if needed.',
  },
  {
    id: 'general',
    keywords: [],
    priority: 'low',
    answer:
      'Thanks for reaching out. Our support team will review your request and guide you to the right next step.',
  },
];
