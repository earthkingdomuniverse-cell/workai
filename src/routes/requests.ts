import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../db/prismaClient';

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

function formatRequest(r: any) {
  return {
    ...r,
    skills: parseJsonArray(r.skills),
    budget:
      r.budgetMin != null || r.budgetMax != null
        ? {
            min: r.budgetMin,
            max: r.budgetMax,
            currency: r.budgetCurrency,
            negotiable: r.budgetNegotiable,
          }
        : undefined,
    location: r.locationType
      ? {
          type: r.locationType,
          city: r.locationCity,
          country: r.locationCountry,
        }
      : undefined,
    duration: r.durationValue
      ? {
          value: r.durationValue,
          unit: r.durationUnit,
        }
      : undefined,
  };
}

function requireRequestUser(user: { userId: string }) {
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
}

const requests: FastifyPluginAsync = async (fastify) => {
  fastify.get('/requests', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;

    const where: any = {};
    if (query.q) {
      const q = query.q.toLowerCase();
      where.OR = [{ title: { contains: q } }, { description: { contains: q } }];
    }
    if (query.urgency && query.urgency !== 'all') {
      where.urgency = query.urgency;
    }
    if (query.location && query.location !== 'all') {
      where.locationType = query.location;
    }

    const items = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reply, { items: items.map(formatRequest), total: items.length });
  });

  fastify.get('/requests/mine', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const items = await prisma.request.findMany({
      where: { requesterId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(reply, { items: items.map(formatRequest), total: items.length });
  });

  fastify.get('/requests/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await prisma.request.findUnique({ where: { id } });
    if (!item) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    return successResponse(reply, formatRequest(item));
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

    const budget = body.budget || undefined;
    if (
      budget &&
      budget.min !== undefined &&
      budget.max !== undefined &&
      Number(budget.min) > Number(budget.max)
    ) {
      throw new AppError('Minimum budget cannot exceed maximum budget', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const created = await prisma.request.create({
      data: {
        requesterId: user.userId,
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        category: body.category || null,
        budgetMin: budget?.min != null ? Number(budget.min) : null,
        budgetMax: budget?.max != null ? Number(budget.max) : null,
        budgetCurrency: budget?.currency || 'USD',
        budgetNegotiable: budget?.negotiable ?? true,
        status: 'open',
        urgency: body.urgency || null,
        skills: body.skills ? JSON.stringify(body.skills) : null,
        experienceLevel: body.experienceLevel || null,
        deadline: body.deadline || null,
        locationType: body.location?.type || null,
        locationCity: body.location?.city || null,
        locationCountry: body.location?.country || null,
        durationValue: body.duration?.value != null ? Number(body.duration.value) : null,
        durationUnit: body.duration?.unit || null,
      },
    });

    return createdResponse(reply, formatRequest(created));
  });

  fastify.patch('/requests/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;
    const existing = await prisma.request.findUnique({ where: { id } });
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
    if (
      body.budget &&
      body.budget.min !== undefined &&
      body.budget.max !== undefined &&
      Number(body.budget.min) > Number(body.budget.max)
    ) {
      throw new AppError('Minimum budget cannot exceed maximum budget', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.budget) {
      if (body.budget.min !== undefined) updateData.budgetMin = Number(body.budget.min);
      if (body.budget.max !== undefined) updateData.budgetMax = Number(body.budget.max);
      if (body.budget.currency) updateData.budgetCurrency = body.budget.currency;
      if (body.budget.negotiable !== undefined)
        updateData.budgetNegotiable = body.budget.negotiable;
    }
    if (body.category) updateData.category = body.category;
    if (body.skills) updateData.skills = JSON.stringify(body.skills);
    if (body.experienceLevel) updateData.experienceLevel = body.experienceLevel;
    if (body.urgency) updateData.urgency = body.urgency;
    if (body.deadline) updateData.deadline = body.deadline;
    if (body.status) updateData.status = body.status;

    const updated = await prisma.request.update({ where: { id }, data: updateData });
    return successResponse(reply, formatRequest(updated));
  });

  fastify.delete('/requests/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireRequestUser(user);
    const { id } = request.params as { id: string };
    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    if (existing.requesterId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot delete this request' } });
    }
    await prisma.request.delete({ where: { id } });
    return successResponse(reply, { deleted: true });
  });
};

export default requests;
