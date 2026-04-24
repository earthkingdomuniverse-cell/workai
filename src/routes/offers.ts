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

function requireOfferUser(user: { userId: string }) {
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
}

const offers: FastifyPluginAsync = async (fastify) => {
  fastify.get('/offers', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;

    const where: any = {};
    if (query.q) {
      const q = query.q.toLowerCase();
      where.OR = [{ title: { contains: q } }, { description: { contains: q } }];
    }
    if (query.pricingType && query.pricingType !== 'all') {
      where.pricingType = query.pricingType;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.status) {
      where.status = query.status;
    }

    const items = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const mapped = items.map((o) => ({
      ...o,
      skills: parseJsonArray(o.skills),
    }));

    return successResponse(reply, { items: mapped, total: mapped.length });
  });

  fastify.get('/offers/mine', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireOfferUser(user);
    const items = await prisma.offer.findMany({
      where: { providerId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = items.map((o) => ({
      ...o,
      skills: parseJsonArray(o.skills),
    }));

    return successResponse(reply, { items: mapped, total: mapped.length });
  });

  fastify.get('/offers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    return successResponse(reply, {
      ...offer,
      skills: parseJsonArray(offer.skills),
    });
  });

  fastify.post('/offers', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireOfferUser(user);
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
    if (!body.price || Number(body.price) <= 0) {
      throw new AppError('Price must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        providerId: user.userId,
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        price: Number(body.price),
        currency: body.currency || 'USD',
        pricingType: body.pricingType || 'fixed',
        deliveryTime: body.deliveryTime ? Number(body.deliveryTime) : null,
        skills: body.skills ? JSON.stringify(body.skills) : null,
        category: body.category || null,
        status: 'active',
      },
    });

    return createdResponse(reply, {
      ...offer,
      skills: parseJsonArray(offer.skills),
    });
  });

  fastify.patch('/offers/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    requireOfferUser(user);
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    if (offer.providerId !== user.userId) {
      return reply
        .status(403)
        .send({ error: { code: 'FORBIDDEN', message: 'You cannot edit this offer' } });
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
    if (body.price !== undefined && Number(body.price) <= 0) {
      throw new AppError('Price must be positive', { code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const updated = await prisma.offer.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        description: body.description !== undefined ? String(body.description).trim() : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        currency: body.currency || undefined,
        pricingType: body.pricingType || undefined,
        deliveryTime: body.deliveryTime !== undefined ? Number(body.deliveryTime) : undefined,
        skills: body.skills ? JSON.stringify(body.skills) : undefined,
        status: body.status || undefined,
      },
    });

    return successResponse(reply, {
      ...updated,
      skills: parseJsonArray(updated.skills),
    });
  });
};

export default offers;
