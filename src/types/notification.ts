import { Timestamps } from './common';

export interface Notification extends Timestamps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
}

export type NotificationType =
  | 'deal_created'
  | 'deal_updated'
  | 'deal_completed'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'message_received'
  | 'review_received'
  | 'payment_received'
  | 'payment_sent'
  | 'dispute_raised'
  | 'dispute_resolved'
  | 'verification_completed'
  | 'trust_score_updated'
  | 'system'
  | 'announcement';

export interface NotificationData {
  dealId?: string;
  proposalId?: string;
  messageId?: string;
  reviewId?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  [key: string]: any;
}

export interface NotificationPreferences {
  email: {
    dealUpdates: boolean;
    proposals: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
    system: boolean;
    marketing: boolean;
  };
  push: {
    dealUpdates: boolean;
    proposals: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
    system: boolean;
  };
  sms: {
    urgent: boolean;
    payments: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [key: string]: number;
  };
}
