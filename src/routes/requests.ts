import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

function requireRequestUser(user: { userId: string }) {
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
}

function serializeRequest(item: any) {
  return {
    ...item,
    budget: {
      min: item.budgetMin,
      max: item.budgetMax,
      currency: item.currency,
    },
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
  };
}

const requests: FastifyPluginAsync = async (fastify) => {
  fastify.get('/requests', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const where: any = {};

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.urgency && query.urgency !== 'all') {
      where.urgency = query.urgency;
    }

    if (query.category && query.category !== 'all') {
      where.category = query.category;
    }

    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }

    const items = await prisma.workRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reply, { items: items.map(serializeRequest), total: items.length });
  });

  fastify.get('/requests/mine', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);

    const items = await prisma.workRequest.findMany({
      where: { requesterId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reply, { items: items.map(serializeRequest), total: items.length });
  });

  fastify.get('/requests/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await prisma.workRequest.findUnique({ where: { id } });

    if (!item) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    return successResponse(reply, serializeRequest(item));
  });

  fastify.post('/requests', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
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

    const budget = body.budget || {};
    const budgetMin = budget.min !== undefined ? Number(budget.min) : undefined;
    const budgetMax = budget.max !== undefined ? Number(budget.max) : undefined;

    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      throw new AppError('Minimum budget cannot exceed maximum budget', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const created = await prisma.workRequest.create({
      data: {
        requesterId: user.userId,
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        category: body.category || 'general',
        skills: Array.isArray(body.skills) ? body.skills : [],
        budgetMin,
        budgetMax,
        currency: budget.currency || body.currency || 'USD',
        urgency: body.urgency,
        status: 'open',
      },
    });

    return createdResponse(reply, serializeRequest(created));
  });

  fastify.patch('/requests/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;

    const existing = await prisma.workRequest.findUnique({ where: { id } });

    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    if (existing.requesterId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot edit this request' } });
    }

    if (body.title !== undefined && String(body.title).trim().length < 5) {
      throw new AppError('Title must be at least 5 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    if (body.description !== undefined && String(body.description).trim().length < 20) {
      throw new AppError('Description must be at least 20 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const budget = body.budget;
    const budgetMin = budget?.min !== undefined ? Number(budget.min) : undefined;
    const budgetMax = budget?.max !== undefined ? Number(budget.max) : undefined;

    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      throw new AppError('Minimum budget cannot exceed maximum budget', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const updated = await prisma.workRequest.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        description: body.description !== undefined ? String(body.description).trim() : undefined,
        category: body.category,
        skills: Array.isArray(body.skills) ? body.skills : undefined,
        budgetMin,
        budgetMax,
        currency: budget?.currency || body.currency,
        urgency: body.urgency,
        status: body.status,
      },
    });

    return successResponse(reply, serializeRequest(updated));
  });

  fastify.delete('/requests/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const { id } = request.params as { id: string };

    const existing = await prisma.workRequest.findUnique({ where: { id } });

    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    if (existing.requesterId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot delete this request' } });
    }

    await prisma.workRequest.delete({ where: { id } });

    return successResponse(reply, { deleted: true });
  });
};

export default requests;
