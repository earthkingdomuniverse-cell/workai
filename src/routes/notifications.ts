import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { successResponse } from '../lib/response';

type NotificationType =
  | 'message'
  | 'deal_update'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'payment_received'
  | 'review_received'
  | 'trust_update'
  | 'system';

type NotificationPriority = 'low' | 'medium' | 'high';

interface NotificationRecord {
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

interface NotificationPreferences {
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

const notificationStore = new Map<string, NotificationRecord[]>();
const preferenceStore = new Map<string, NotificationPreferences>();

function defaultPreferences(): NotificationPreferences {
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

function seedNotifications(userId: string): NotificationRecord[] {
  const now = Date.now();
  return [
    {
      id: `system-welcome-${userId}`,
      userId,
      type: 'system',
      priority: 'medium',
      title: 'Welcome to WorkAI',
      message: 'Your WorkAI workspace is ready. Create an offer or request to get started.',
      read: false,
      actionUrl: '/(tabs)/home',
      createdAt: new Date(now).toISOString(),
    },
    {
      id: `trust-start-${userId}`,
      userId,
      type: 'trust_update',
      priority: 'low',
      title: 'Trust profile created',
      message: 'Complete your profile and finish deals to improve your trust score.',
      read: false,
      actionUrl: '/(tabs)/profile',
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
    },
  ];
}

async function requireNotificationUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

function getUserNotifications(userId: string) {
  if (!notificationStore.has(userId)) {
    notificationStore.set(userId, seedNotifications(userId));
  }

  return notificationStore.get(userId) || [];
}

const notifications: FastifyPluginAsync = async (fastify) => {
  fastify.get('/notifications', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const query = request.query as Record<string, string | undefined>;
    const limit = Math.min(Number(query.limit || 20), 100);
    const offset = Math.max(Number(query.offset || 0), 0);

    let items = getUserNotifications(user.userId);

    if (query.type) {
      items = items.filter((item) => item.type === query.type);
    }

    if (query.read !== undefined) {
      const read = query.read === 'true';
      items = items.filter((item) => item.read === read);
    }

    const total = items.length;
    const pagedItems = items.slice(offset, offset + limit);
    const unreadCount = getUserNotifications(user.userId).filter((item) => !item.read).length;

    return successResponse(reply, { items: pagedItems, total, unreadCount });
  });

  fastify.post('/notifications/:id/read', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const { id } = request.params as { id: string };
    const items = getUserNotifications(user.userId);
    const notification = items.find((item) => item.id === id);

    if (!notification) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    notification.read = true;
    notification.readAt = new Date().toISOString();

    return successResponse(reply, notification, { message: 'Notification marked as read' });
  });

  fastify.post('/notifications/read-all', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const readAt = new Date().toISOString();
    const items = getUserNotifications(user.userId);

    items.forEach((item) => {
      item.read = true;
      item.readAt = item.readAt || readAt;
    });

    return successResponse(reply, { updated: items.length }, { message: 'All notifications marked as read' });
  });

  fastify.delete('/notifications/:id', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const { id } = request.params as { id: string };
    const items = getUserNotifications(user.userId);
    const nextItems = items.filter((item) => item.id !== id);

    if (nextItems.length === items.length) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    notificationStore.set(user.userId, nextItems);
    return successResponse(reply, { deleted: true }, { message: 'Notification deleted' });
  });

  fastify.get('/notifications/unread-count', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const count = getUserNotifications(user.userId).filter((item) => !item.read).length;
    return successResponse(reply, { count });
  });

  fastify.get('/notifications/preferences', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const preferences = preferenceStore.get(user.userId) || defaultPreferences();
    preferenceStore.set(user.userId, preferences);
    return successResponse(reply, preferences);
  });

  fastify.patch('/notifications/preferences', async (request, reply) => {
    const user = await requireNotificationUser(request, reply);
    const body = request.body as Partial<NotificationPreferences>;
    const current = preferenceStore.get(user.userId) || defaultPreferences();
    const next: NotificationPreferences = {
      ...current,
      ...body,
      types: {
        ...current.types,
        ...(body.types || {}),
      },
    };

    preferenceStore.set(user.userId, next);
    return successResponse(reply, next, { message: 'Notification preferences updated' });
  });
};

export default notifications;
