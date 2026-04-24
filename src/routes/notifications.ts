import { FastifyPluginAsync } from 'fastify';
import { requireAuthenticated } from '../lib/auth';
import { successResponse } from '../lib/response';
import { prisma } from '../lib/prisma';

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

function serializeNotification(notification: any) {
  return {
    ...notification,
    readAt: notification.readAt?.toISOString?.() ?? notification.readAt,
    createdAt: notification.createdAt?.toISOString?.() ?? notification.createdAt,
    updatedAt: notification.updatedAt?.toISOString?.() ?? notification.updatedAt,
  };
}

async function ensureSeedNotifications(userId: string) {
  const count = await prisma.notification.count({ where: { userId } });
  if (count > 0) return;

  await prisma.notification.createMany({
    data: [
      {
        userId,
        type: 'system',
        priority: 'medium',
        title: 'Welcome to WorkAI',
        message: 'Your WorkAI workspace is ready. Create an offer or request to get started.',
        actionUrl: '/(tabs)/home',
      },
      {
        userId,
        type: 'trust_update',
        priority: 'low',
        title: 'Trust profile created',
        message: 'Complete your profile and finish deals to improve your trust score.',
        actionUrl: '/(tabs)/profile',
      },
    ],
  });
}

async function getOrCreatePreferences(userId: string): Promise<NotificationPreferences> {
  const existing = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (existing) {
    return {
      email: existing.email,
      push: existing.push,
      inApp: existing.inApp,
      types: existing.types as NotificationPreferences['types'],
    };
  }

  const defaults = defaultPreferences();
  await prisma.notificationPreference.create({
    data: {
      userId,
      email: defaults.email,
      push: defaults.push,
      inApp: defaults.inApp,
      types: defaults.types,
    },
  });

  return defaults;
}

const notifications: FastifyPluginAsync = async (fastify) => {
  fastify.get('/notifications', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    const query = request.query as Record<string, string | undefined>;
    const limit = Math.min(Number(query.limit || 20), 100);
    const offset = Math.max(Number(query.offset || 0), 0);
    const where: any = { userId: user.userId };

    await ensureSeedNotifications(user.userId);

    if (query.type) where.type = query.type;
    if (query.read !== undefined) where.read = query.read === 'true';

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.userId, read: false } }),
    ]);

    return successResponse(reply, {
      items: items.map(serializeNotification),
      total,
      unreadCount,
    });
  });

  fastify.post('/notifications/:id/read', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    const { id } = request.params as { id: string };

    const existing = await prisma.notification.findFirst({ where: { id, userId: user.userId } });
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true, readAt: existing.readAt || new Date() },
    });

    return successResponse(reply, serializeNotification(notification), { message: 'Notification marked as read' });
  });

  fastify.post('/notifications/read-all', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    const result = await prisma.notification.updateMany({
      where: { userId: user.userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    return successResponse(reply, { updated: result.count }, { message: 'All notifications marked as read' });
  });

  fastify.delete('/notifications/:id', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    const { id } = request.params as { id: string };

    const existing = await prisma.notification.findFirst({ where: { id, userId: user.userId } });
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    await prisma.notification.delete({ where: { id } });
    return successResponse(reply, { deleted: true }, { message: 'Notification deleted' });
  });

  fastify.get('/notifications/unread-count', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    await ensureSeedNotifications(user.userId);
    const count = await prisma.notification.count({ where: { userId: user.userId, read: false } });
    return successResponse(reply, { count });
  });

  fastify.get('/notifications/preferences', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    const preferences = await getOrCreatePreferences(user.userId);
    return successResponse(reply, preferences);
  });

  fastify.patch('/notifications/preferences', async (request, reply) => {
    const user = await requireAuthenticated(request, reply);
    const body = request.body as Partial<NotificationPreferences>;
    const current = await getOrCreatePreferences(user.userId);
    const next: NotificationPreferences = {
      ...current,
      ...body,
      types: {
        ...current.types,
        ...(body.types || {}),
      },
    };

    await prisma.notificationPreference.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        email: next.email,
        push: next.push,
        inApp: next.inApp,
        types: next.types,
      },
      update: {
        email: next.email,
        push: next.push,
        inApp: next.inApp,
        types: next.types,
      },
    });

    return successResponse(reply, next, { message: 'Notification preferences updated' });
  });
};

export default notifications;
