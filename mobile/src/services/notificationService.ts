import { ENABLE_MOCK_MODE } from '../constants/config';
import apiClient from './apiClient';

export type NotificationType =
  | 'message'
  | 'deal_update'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'payment_received'
  | 'review_received'
  | 'trust_update'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    messages: boolean;
    deals: boolean;
    proposals: boolean;
    payments: boolean;
    reviews: boolean;
    trust: boolean;
    system: boolean;
  };
}

const USE_MOCK_FALLBACK = true;

// Mock data generator
function generateMockNotifications(count: number = 10): Notification[] {
  const notifications: Notification[] = [];
  const types: NotificationType[] = [
    'message',
    'deal_update',
    'proposal_received',
    'proposal_accepted',
    'payment_received',
    'review_received',
    'trust_update',
    'system',
  ];

  const titles: Record<NotificationType, string[]> = {
    message: ['New message from Alice', 'Bob replied to your message', 'New conversation started'],
    deal_update: [
      'Deal funded',
      'Work submitted for review',
      'Payment released',
      'Deal marked complete',
    ],
    proposal_received: ['New proposal received', 'Someone sent you a proposal'],
    proposal_accepted: ['Proposal accepted', 'Your proposal was accepted'],
    payment_received: ['Payment received', 'Funds deposited'],
    review_received: ['New review', 'You received a 5-star review'],
    trust_update: ['Trust score updated', 'Verification completed'],
    system: ['Welcome to SkillValue', 'Account verified', 'New features available'],
  };

  const messages: Record<NotificationType, string[]> = {
    message: ['Check out the latest message', 'See what they said', 'Start chatting'],
    deal_update: ['Your deal has progressed', 'Next step is ready', 'Funds have been transferred'],
    proposal_received: ['Someone wants to work with you', 'Review the proposal details'],
    proposal_accepted: ['Time to start working!', 'Begin the project now'],
    payment_received: ['Check your balance', 'Funds are available'],
    review_received: ['See what they said about you', 'Your reputation improved'],
    trust_update: ['Your profile is more trusted now', 'Verification complete'],
    system: ['Thanks for joining us', 'Explore new features'],
  };

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const now = new Date();
    const createdAt = new Date(
      now.getTime() - i * 3600000 * (1 + Math.random() * 24),
    ).toISOString();

    notifications.push({
      id: `notif-${i}`,
      userId: 'user-me',
      type,
      priority: i % 5 === 0 ? 'high' : i % 3 === 0 ? 'medium' : 'low',
      title: titles[type][i % titles[type].length],
      message: messages[type][i % messages[type].length],
      data: { dealId: `deal-${i}`, userId: `user-${i}` },
      read: i > 2,
      readAt: i > 2 ? new Date(now.getTime() - i * 1800000).toISOString() : undefined,
      actionUrl:
        type === 'message'
          ? `/messages/conv-${i}`
          : type === 'deal_update'
            ? `/deals/${i}`
            : undefined,
      imageUrl:
        i % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}` : undefined,
      createdAt,
    });
  }

  return notifications;
}

export const notificationService = {
  async getNotifications(filters?: {
    type?: NotificationType;
    read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Notification[]; total: number; unreadCount: number }> {
    if (ENABLE_MOCK_MODE) {
      const mockNotifications = generateMockNotifications(filters?.limit || 10);
      return {
        items: mockNotifications,
        total: mockNotifications.length,
        unreadCount: mockNotifications.filter((n) => !n.read).length,
      };
    }

    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.read !== undefined) params.append('read', filters.read.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const query = params.toString();
      const response = await apiClient.get(`/notifications${query ? `?${query}` : ''}`);
      return response.data?.data || { items: [], total: 0, unreadCount: 0 };
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('notificationService.getNotifications failed, using mock fallback');
        const mockNotifications = generateMockNotifications(filters?.limit || 10);
        return {
          items: mockNotifications,
          total: mockNotifications.length,
          unreadCount: mockNotifications.filter((n) => !n.read).length,
        };
      }
      throw error;
    }
  },

  async markAsRead(id: string): Promise<void> {
    if (ENABLE_MOCK_MODE) {
      return;
    }

    try {
      await apiClient.post(`/notifications/${id}/read`);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`notificationService.markAsRead(${id}) failed, using mock fallback`);
        return;
      }
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    if (ENABLE_MOCK_MODE) {
      return;
    }

    try {
      await apiClient.post('/notifications/read-all');
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('notificationService.markAllAsRead failed, using mock fallback');
        return;
      }
      throw error;
    }
  },

  async deleteNotification(id: string): Promise<void> {
    if (ENABLE_MOCK_MODE) {
      return;
    }

    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`notificationService.deleteNotification(${id}) failed, using mock fallback`);
        return;
      }
      throw error;
    }
  },

  async getUnreadCount(): Promise<number> {
    if (ENABLE_MOCK_MODE) {
      return 3;
    }

    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data?.data?.count || 0;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('notificationService.getUnreadCount failed, using mock fallback');
        return 3;
      }
      throw error;
    }
  },

  async updatePreferences(
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    if (ENABLE_MOCK_MODE) {
      return {
        email: true,
        push: true,
        inApp: true,
        types: {
          messages: true,
          deals: true,
          proposals: true,
          payments: true,
          reviews: true,
          trust: true,
          system: true,
        },
      };
    }

    try {
      const response = await apiClient.patch('/notifications/preferences', preferences);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('notificationService.updatePreferences failed, using mock fallback');
        return {
          email: true,
          push: true,
          inApp: true,
          types: {
            messages: true,
            deals: true,
            proposals: true,
            payments: true,
            reviews: true,
            trust: true,
            system: true,
          },
        };
      }
      throw error;
    }
  },

  async getPreferences(): Promise<NotificationPreferences> {
    if (ENABLE_MOCK_MODE) {
      return {
        email: true,
        push: true,
        inApp: true,
        types: {
          messages: true,
          deals: true,
          proposals: true,
          payments: true,
          reviews: true,
          trust: true,
          system: true,
        },
      };
    }

    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('notificationService.getPreferences failed, using mock fallback');
        return {
          email: true,
          push: true,
          inApp: true,
          types: {
            messages: true,
            deals: true,
            proposals: true,
            payments: true,
            reviews: true,
            trust: true,
            system: true,
          },
        };
      }
      throw error;
    }
  },
};

export default notificationService;
