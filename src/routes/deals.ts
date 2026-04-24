import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../db/prismaClient';

async function requireDealUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

function ensureTransition(current: string, next: string, allowed: string[]) {
  if (!allowed.includes(current)) {
    throw new AppError(`Cannot transition deal from ${current} to ${next}`, {
      code: 'BAD_REQUEST',
      statusCode: 400,
    });
  }
}

async function formatDeal(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      milestones: true,
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  });
  return deal;
}

const deals: FastifyPluginAsync = async (fastify) => {
  fastify.get('/deals', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.providerId) where.providerId = query.providerId;
    if (query.clientId) where.clientId = query.clientId;

    const items = await prisma.deal.findMany({
      where,
      include: { milestones: true, timeline: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(reply, { items, total: items.length });
  });

  fastify.post('/deals', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const body = request.body as Record<string, any>;
    if (!body.title || String(body.title).trim().length < 5) {
      throw new AppError('Title must be at least 5 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    if (!body.description || String(body.description).trim().length < 20) {
      throw new AppError('Description must be at least 20 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }
    if (!body.amount || Number(body.amount) <= 0) {
      throw new AppError('Amount must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const amount = Number(body.amount);

    const deal = await prisma.deal.create({
      data: {
        offerId: body.offerId || null,
        requestId: body.requestId || null,
        proposalId: body.proposalId || null,
        providerId: body.providerId || user.userId,
        clientId: body.clientId || user.userId,
        status: 'created',
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        amount,
        currency: body.currency || 'USD',
        serviceFee: Math.round(amount * 0.05),
        milestones: body.milestones
          ? {
              create: body.milestones.map((m: any) => ({
                title: m.title,
                description: m.description || null,
                amount: Number(m.amount),
                status: m.status || 'pending',
                dueDate: m.dueDate || null,
              })),
            }
          : undefined,
        timeline: {
          create: {
            type: 'status_change',
            title: 'Deal Created',
            status: 'created',
            userId: user.userId,
            userName: 'Client',
          },
        },
      },
      include: { milestones: true, timeline: true },
    });
    return createdResponse(reply, deal);
  });

  fastify.get('/deals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deal = await formatDeal(id);
    if (!deal) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    }
    return successResponse(reply, deal);
  });

  fastify.post('/deals/:id/fund', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; paymentMethodId?: string };
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (deal.clientId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only the client can fund this deal' } });
    }

    ensureTransition(deal.status, 'funded', ['created']);
    const fundAmount =
      body.amount && body.amount > 0 ? Math.min(body.amount, deal.amount) : deal.amount;

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        status: 'funded',
        fundedAmount: fundAmount,
        timeline: {
          create: {
            type: 'payment',
            title: 'Deal Funded',
            description: `Funded $${fundAmount}`,
            amount: fundAmount,
            status: 'funded',
            userId: user.userId,
            userName: 'Client',
          },
        },
      },
      include: { milestones: true, timeline: { orderBy: { createdAt: 'asc' } } },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        dealId: id,
        amount: fundAmount,
        currency: deal.currency,
        type: 'fund',
        status: 'completed',
        referenceNumber: `FUND-${Date.now()}`,
        userId: user.userId,
        userName: 'Client',
      },
    });

    return successResponse(reply, updated);
  });

  fastify.post('/deals/:id/submit', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { milestoneId?: string; notes?: string };
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (deal.providerId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only the provider can submit work' } });
    }
    ensureTransition(deal.status, 'submitted', ['funded']);

    if (body.milestoneId) {
      await prisma.milestone.update({
        where: { id: body.milestoneId },
        data: { status: 'approved', approvedAt: new Date().toISOString() },
      });
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        status: 'submitted',
        timeline: {
          create: {
            type: 'milestone_update',
            title: 'Work Submitted',
            description: body.notes || 'Work submitted for review',
            status: 'submitted',
            milestoneId: body.milestoneId || null,
            userId: user.userId,
            userName: 'Provider',
          },
        },
      },
      include: { milestones: true, timeline: { orderBy: { createdAt: 'asc' } } },
    });

    return successResponse(reply, updated);
  });

  fastify.post('/deals/:id/release', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: number; notes?: string };
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (deal.clientId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only the client can release funds' } });
    }
    ensureTransition(deal.status, 'released', ['submitted']);
    const releaseAmount =
      body.amount && body.amount > 0 ? Math.min(body.amount, deal.amount) : deal.amount;

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        status: 'released',
        releasedAmount: releaseAmount,
        timeline: {
          create: {
            type: 'payment',
            title: 'Funds Released',
            description: body.notes || `Released $${releaseAmount}`,
            amount: releaseAmount,
            status: 'released',
            userId: user.userId,
            userName: 'Client',
          },
        },
      },
      include: { milestones: true, timeline: { orderBy: { createdAt: 'asc' } } },
    });

    await prisma.transaction.create({
      data: {
        dealId: id,
        amount: releaseAmount,
        currency: deal.currency,
        type: 'release',
        status: 'completed',
        referenceNumber: `RELEASE-${Date.now()}`,
        userId: user.userId,
        userName: 'Client',
      },
    });

    return successResponse(reply, updated);
  });

  fastify.post('/deals/:id/dispute', async (request, reply) => {
    const user = await requireDealUser(request, reply);
    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string; description?: string };
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Deal not found' } });
    if (![deal.clientId, deal.providerId].includes(user.userId)) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'Only deal participants can dispute' } });
    }
    ensureTransition(deal.status, 'disputed', ['funded', 'submitted', 'released']);
    if (!body.reason || !body.description) {
      throw new AppError('reason and description are required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        status: 'disputed',
        timeline: {
          create: {
            type: 'dispute',
            title: 'Dispute Opened',
            description: body.reason,
            status: 'disputed',
            userId: user.userId,
            userName: user.userId === deal.clientId ? 'Client' : 'Provider',
          },
        },
      },
      include: { milestones: true, timeline: { orderBy: { createdAt: 'asc' } } },
    });

    return successResponse(reply, updated);
  });
};

export default deals;
