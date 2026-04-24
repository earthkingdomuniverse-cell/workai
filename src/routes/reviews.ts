import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../db/prismaClient';
import { reviewService } from '../services/reviewService';

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

async function requireReviewUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

const reviews: FastifyPluginAsync = async (fastify) => {
  // GET /api/reviews - list all with optional filters
  fastify.get('/reviews', async (request, reply) => {
    const { subjectType, subjectId, reviewerId, rating } = request.query as any;

    const where: any = {};
    if (subjectType) where.subjectType = subjectType;
    if (subjectId) where.subjectId = subjectId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (rating) where.rating = Number(rating);

    const items = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((r) => ({
      ...r,
      tags: parseJsonArray(r.tags),
    }));

    return successResponse(reply, { items: formatted, total: formatted.length });
  });

  // GET /api/reviews/aggregate/:subjectType/:subjectId
  fastify.get('/reviews/aggregate/:subjectType/:subjectId', async (request, reply) => {
    const { subjectType, subjectId } = request.params as { subjectType: string; subjectId: string };
    const aggregate = await reviewService.getReviewAggregate(subjectType as any, subjectId);
    return successResponse(reply, aggregate);
  });

  fastify.get('/reviews/by-user/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = await prisma.review.findMany({
      where: { subjectType: 'user', subjectId: id },
    });
    const formatted = items.map((r) => ({ ...r, tags: parseJsonArray(r.tags) }));
    return successResponse(reply, { items: formatted, total: formatted.length });
  });

  fastify.get('/reviews/by-offer/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = await prisma.review.findMany({
      where: { subjectType: 'offer', subjectId: id },
    });
    const formatted = items.map((r) => ({ ...r, tags: parseJsonArray(r.tags) }));
    return successResponse(reply, { items: formatted, total: formatted.length });
  });

  fastify.post('/reviews', async (request, reply) => {
    const user = await requireReviewUser(request, reply);
    const body = request.body as Record<string, any>;
    if (!body.dealId || !body.subjectType || !body.subjectId) {
      throw new AppError('dealId, subjectType and subjectId are required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const review = await reviewService.createReview(
      {
        dealId: body.dealId,
        subjectType: body.subjectType,
        subjectId: body.subjectId,
        rating: Number(body.rating),
        comment: String(body.comment || ''),
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
      user.userId,
      body.reviewerRole || 'client',
    );
    return createdResponse(reply, review);
  });
};

export default reviews;
