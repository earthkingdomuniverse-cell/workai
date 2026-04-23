import { Notification, NotificationPreferences } from '../types/notification';

export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: 'deal_created',
    title: 'New Deal Created',
    message: 'Your deal "Mobile App UI Design" has been created successfully.',
    data: {
      dealId: 'deal_1',
    },
    read: true,
    readAt: '2024-01-20T11:00:00Z',
    priority: 'medium',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    type: 'proposal_received',
    title: 'New Proposal Received',
    message: 'You received a new proposal for your request.',
    data: {
      proposalId: 'proposal_1',
      dealId: 'deal_1',
    },
    read: false,
    priority: 'high',
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'You received a payment of $1,000.00',
    data: {
      amount: 1000,
      currency: 'USD',
      dealId: 'deal_1',
    },
    read: false,
    priority: 'high',
    createdAt: '2024-01-21T14:00:00Z',
    updatedAt: '2024-01-21T14:00:00Z',
  },
  {
    id: 'notif_4',
    userId: 'user_1',
    type: 'review_received',
    title: 'New Review Received',
    message: 'You received a 5-star review from Jane Smith',
    data: {
      reviewId: 'review_1',
      rating: 5,
    },
    read: false,
    priority: 'medium',
    createdAt: '2024-01-21T16:00:00Z',
    updatedAt: '2024-01-21T16:00:00Z',
  },
];

export const mockNotificationPreferences: NotificationPreferences = {
  email: {
    dealUpdates: true,
    proposals: true,
    messages: true,
    reviews: true,
    payments: true,
    system: true,
    marketing: false,
  },
  push: {
    dealUpdates: true,
    proposals: true,
    messages: true,
    reviews: true,
    payments: true,
    system: true,
  },
  sms: {
    urgent: true,
    payments: true,
  },
};

export function getNotifications(userId: string): Notification[] {
  return mockNotifications.filter((n) => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markAsRead(notificationId: string): void {
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
    notification.readAt = new Date().toISOString();
  }
}

export function getPreferences(userId: string): NotificationPreferences {
  return mockNotificationPreferences;
}

export function updatePreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>,
): NotificationPreferences {
  Object.assign(mockNotificationPreferences, preferences);
  return mockNotificationPreferences;
}
