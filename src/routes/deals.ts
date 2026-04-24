import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { walletService } from '../services/walletService';
import { notificationService } from '../services/notificationService';

type DealStatus = 'created' | 'funded' | 'submitted' | 'released' | 'disputed';

type DealAuthUser = {
  userId: string;
  role?: string;
};

function isOperatorUser(user: DealAuthUser) {
  return user.role === 'operator' || user.role === 'admin';
}

function notifyDealBestEffort(task: Promise<any>) {
  task.catch((error) => {
    console.warn('Deal notification hook failed:', error?.message || error);
  });
}

function notifyDealParticipantsBestEffort(input: {
  deal: any;
  actorUserId: string;
  title: string;
  messageForClient: string;
  messageForProvider: string;
  priority?: 'low' | 'medium' | 'high';
}) {
  if (input.deal.clientId && input.deal.clientId !== input.actorUserId) {
    notifyDealBestEffort(notificationService.notifyDealUpdate({
      userId: input.deal.clientId,
      dealId: input.deal.id,
      title: input.title,
      message: input.messageForClient,
      priority: input.priority || 'medium',
    }));
  }

  if (input.deal.providerId && input.deal.providerId !== input.actorUserId) {
    notifyDealBestEffort(notificationService.notifyDealUpdate({
      userId: input.deal.providerId,
      dealId: input.deal.id,
      title: input.title,
      message: input.messageForProvider,
      priority: input.priority || 'medium',
    }));
  }
}

async function requireDealUser(request: any, reply: any): Promise<DealAuthUser> {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', { code: 'AUTHENTICATION_ERROR', statusCode: 401 });
  }
  return user;
}

async function resolveUserScopedDealFilters(request: any, reply: any, query: Record<string, string | undefined>) {
  const user = await requireDealUser(request, reply);
  const where: any = {};

  if (query.status) where.status = query.status;

  if (isOperatorUser(user)) {
    if (query.providerId) where.providerId = query.providerId === 'me' ? user.userId : query.providerId;
    if (query.clientId) where.clientId = query.clientId === 'me' ? user.userId : query.clientId;
    return where;
  }

  const requestedProviderId = query.providerId === 'me' ? user.userId : query.providerId;
  const requestedClientId = query.clientId === 'me' ? user.userId : query.clientId;

  if (requestedProviderId && requestedProviderId !== user.userId) {
    throw new AppError('Cannot view another provider\'s deals', {
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  }

  if (requestedClientId && requestedClientId !== user.userId) {
    throw new AppError('Cannot view another client\'s deals', {
      code: 'FORBIDDEN',
      statusCode: 403,
    });
  }

  if (requestedProviderId) {
    where.providerId = user.userId;
    return where;
  }

  if (requestedClientId) {
    where.clientId = user.userId;
    return where;
  }

  where.OR = [{ providerId: user.userId }, { clientId: user.userId }];
  return where;
}

function ensureTransition(current: string, next: DealStatus, allowed: DealStatus[]) {
  if (!allowed.includes(current as DealStatus)) {
    throw new AppError(`Cannot transition deal from ${current} to ${next}`, {
      code: 'BAD_REQUEST',
      statusCode: 400,
    });
  }
}

function serializeDeal(deal: any) {
  return {
    ...deal,
    createdAt: deal.createdAt?.toISOString?.() ?? deal.createdAt,
    updatedAt: deal.updatedAt?.toISOString?.() ?? deal.updatedAt,
    milestones: deal.milestones?.map((milestone: any) => ({
      ...milestone,
      dueDate: milestone.dueDate?.toISOString?.() ?? milestone.dueDate,
      completedAt: milestone.completedAt?.toISOString?.() ?? milestone.completedAt,
      createdAt: milestone.createdAt?.toISOString?.() ?? milestone.createdAt,
      updatedAt: milestone.updatedAt?.toISOString?.() ?? milestone.updatedAt,
    })) ?? [],
    transactions: deal.transactions?.map((transaction: any) => ({
      ...transaction,
      createdAt: transaction.createdAt?.toISOString?.() ?? transaction.createdAt,
      updatedAt: transaction.updatedAt?.toISOString?.() ?? transaction.updatedAt,
    })) ?? [],
  };
}

const includeDealRelations = {
  milestones: true,
  transactions: true,
  disputes: true,
  reviews: true,
};

const deals: FastifyPluginAsync = async (fastify) => {
  fastify.get('/deals', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const where = await resolveUserScopedDealFilters(request, reply, query);

    const items = await prisma.deal.findMany({
      where,
      include: includeDealRelations,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reply, { items: items.map(serializeDeal), total: items.length });
  });

  fastify.post('/deals', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const body = request.body as Record<string, any>;

    if (!body.title || String(body.title).trim().length < 5) {
      throw new AppError('Title must be at least 5 characters', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    if (!body.description || String(body.description).trim().length < 20) {
      throw new AppError('Description must be at least 20 characters', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    if (!body.amount || Number(body.amount) <= 0) {
      throw new AppError('Amount must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    if (!body.providerId && !body.clientId) {
      throw new AppError('providerId or clientId is required', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const amount = Number(body.amount);
    const providerId = body.providerId || user.userId;
    const clientId = body.clientId || user.userId;

    const deal = await prisma.deal.create({
      data: {
        offerId: body.offerId,
        requestId: body.requestId,
        proposalId: body.proposalId,
        providerId,
        clientId,
        status: 'created',
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        amount,
        currency: body.currency || 'VND',
        fundedAmount: 0,
        releasedAmount: 0,
        serviceFee: Math.round(amount * 0.05),
        milestones: Array.isArray(body.milestones)
          ? {
              create: body.milestones.map((milestone: any) => ({
                title: String(milestone.title || 'Milestone'),
                description: milestone.description,
                amount: Number(milestone.amount || 0),
                status: milestone.status || 'pending',
                dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
              })),
            }
          : undefined,
      },
      include: includeDealRelations,
    });

    notifyDealParticipantsBestEffort({
      deal,
      actorUserId: user.userId,
      title: 'New deal created',
      messageForClient: `A deal was created: ${deal.title}`,
      messageForProvider: `A deal was created: ${deal.title}`,
      priority: 'medium',
    });

    return createdResponse(reply, serializeDeal(deal));
  });

  fastify.get('/deals/:id', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const deal = await prisma.deal.findUnique({ where: { id }, include: includeDealRelations });

    if (!deal) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    }

    if (!isOperatorUser(user) && ![deal.providerId, deal.clientId].includes(user.userId)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only deal participants can view this deal' } });
    }

    return successResponse(reply, serializeDeal(deal));
  });

  fastify.post('/deals/:id/fund', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; paymentMethodId?: string };

    if (!body.amount || body.amount <= 0 || !body.paymentMethodId) {
      throw new AppError('amount and paymentMethodId are required', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (existing.clientId !== user.userId) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the client can fund this deal' } });
    }

    ensureTransition(existing.status, 'funded', ['created']);
    const fundedAmount = Math.min(body.amount, existing.amount);

    const deal = await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          dealId: id,
          userId: user.userId,
          type: 'fund',
          status: 'completed',
          amount: fundedAmount,
          currency: existing.currency,
          provider: 'manual',
          providerRef: body.paymentMethodId,
          referenceNumber: `FUND-${Date.now()}`,
        },
      });

      return tx.deal.update({
        where: { id },
        data: { status: 'funded', fundedAmount },
        include: includeDealRelations,
      });
    });

    notifyDealParticipantsBestEffort({
      deal,
      actorUserId: user.userId,
      title: 'Deal funded',
      messageForClient: `You funded the deal: ${deal.title}`,
      messageForProvider: `The client funded the deal: ${deal.title}`,
      priority: 'high',
    });

    return successResponse(reply, serializeDeal(deal));
  });

  fastify.post('/deals/:id/submit', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { milestoneId?: string };
    const existing = await prisma.deal.findUnique({ where: { id } });

    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (existing.providerId !== user.userId) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the provider can submit work' } });
    }

    ensureTransition(existing.status, 'submitted', ['funded']);

    const deal = await prisma.$transaction(async (tx) => {
      if (body.milestoneId) {
        await tx.milestone.update({
          where: { id: body.milestoneId },
          data: { status: 'completed', completedAt: new Date() },
        });
      }

      return tx.deal.update({
        where: { id },
        data: { status: 'submitted' },
        include: includeDealRelations,
      });
    });

    notifyDealParticipantsBestEffort({
      deal,
      actorUserId: user.userId,
      title: 'Work submitted',
      messageForClient: `The provider submitted work for: ${deal.title}`,
      messageForProvider: `You submitted work for: ${deal.title}`,
      priority: 'high',
    });

    return successResponse(reply, serializeDeal(deal));
  });

  fastify.post('/deals/:id/release', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number };
    const existing = await prisma.deal.findUnique({ where: { id }, include: includeDealRelations });

    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (existing.clientId !== user.userId) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the client can release funds' } });
    }

    ensureTransition(existing.status, 'released', ['submitted', 'funded']);

    const remainingAmount = existing.amount - existing.releasedAmount;
    const amount = body.amount && body.amount > 0 ? Math.min(body.amount, remainingAmount) : remainingAmount;

    if (amount <= 0) {
      throw new AppError('No releasable amount remains', { code: 'BAD_REQUEST', statusCode: 400 });
    }

    const feeAmount = Math.min(existing.serviceFee || 0, amount);

    await walletService.releaseDeal({
      clientId: existing.clientId,
      providerId: existing.providerId,
      dealId: existing.id,
      amount,
      currency: existing.currency,
      feeAmount,
      idempotencyKey: `release:deal:${existing.id}:${amount}`,
    });

    await prisma.transaction.create({
      data: {
        dealId: id,
        userId: user.userId,
        type: 'release',
        status: 'completed',
        amount,
        currency: existing.currency,
        provider: 'internal_wallet',
        referenceNumber: `RELEASE-${Date.now()}`,
      },
    });

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        status: 'released',
        releasedAmount: existing.releasedAmount + amount,
      },
      include: includeDealRelations,
    });

    notifyDealParticipantsBestEffort({
      deal,
      actorUserId: user.userId,
      title: 'Funds released',
      messageForClient: `You released funds for: ${deal.title}`,
      messageForProvider: `Funds were released for: ${deal.title}`,
      priority: 'high',
    });

    notifyDealBestEffort(notificationService.notifyPaymentReceived({
      userId: deal.providerId,
      dealId: deal.id,
      amount,
      currency: deal.currency,
    }));

    return successResponse(reply, serializeDeal(deal));
  });

  fastify.post('/deals/:id/dispute', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string; description?: string; reportedUserId?: string };
    const existing = await prisma.deal.findUnique({ where: { id } });

    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (![existing.clientId, existing.providerId].includes(user.userId)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only deal participants can dispute' } });
    }
    if (!body.reason || !body.description) {
      throw new AppError('reason and description are required', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    ensureTransition(existing.status, 'disputed', ['funded', 'submitted', 'released']);

    const reportedUserId = body.reportedUserId || (user.userId === existing.clientId ? existing.providerId : existing.clientId);

    const deal = await prisma.$transaction(async (tx) => {
      await tx.dispute.create({
        data: {
          dealId: id,
          reporterId: user.userId,
          reportedUserId,
          reason: body.reason as string,
          description: body.description as string,
          status: 'open',
        },
      });

      return tx.deal.update({
        where: { id },
        data: { status: 'disputed' },
        include: includeDealRelations,
      });
    });

    notifyDealParticipantsBestEffort({
      deal,
      actorUserId: user.userId,
      title: 'Deal disputed',
      messageForClient: `A dispute was opened for: ${deal.title}`,
      messageForProvider: `A dispute was opened for: ${deal.title}`,
      priority: 'high',
    });

    return successResponse(reply, serializeDeal(deal));
  });
};

export default deals;
