import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { mockReviews } from '../mocks/reviews';
import { ReviewAggregate } from '../types/review';
import { AppError } from '../lib/errors';
import { reviewService } from '../services/reviewService';

async function requireReviewUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', { code: 'AUTHENTICATION_ERROR', statusCode: 401 });
  }
  return user;
}

const reviews: FastifyPluginAsync = async (fastify) => {
  // GET /api/reviews - list all with optional filters
  fastify.get('/reviews', async (request, reply) => {
    const { subjectType, subjectId, reviewerId, rating } = request.query as any;

    let filtered = [...mockReviews];

    if (subjectType) {
      filtered = filtered.filter((item) => item.subjectType === subjectType);
    }
    if (subjectId) {
      filtered = filtered.filter((item) => item.subjectId === subjectId);
    }
    if (reviewerId) {
      filtered = filtered.filter((item) => item.reviewerId === reviewerId);
    }
    if (rating) {
      filtered = filtered.filter((item) => item.rating === rating);
    }

    return successResponse(reply, { items: filtered, total: filtered.length });
  });

  // GET /api/reviews/aggregate/:subjectType/:subjectId
  fastify.get('/reviews/aggregate/:subjectType/:subjectId', async (request, reply) => {
    const { subjectType, subjectId } = request.params as { subjectType: string; subjectId: string };

    const filtered = mockReviews.filter(
      (item) => item.subjectType === subjectType && item.subjectId === subjectId,
    );

    if (filtered.length === 0) {
      return successResponse(reply, {
        [subjectType === 'user' ? 'userId' : 'offerId']: subjectId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        tags: [],
      } as ReviewAggregate);
    }

    // Calculate average rating
    const totalRating = filtered.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / filtered.length) * 10) / 10;

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filtered.forEach((r) => {
      if (distribution.hasOwnProperty(r.rating)) {
        distribution[r.rating as keyof typeof distribution]++;
      }
    });

    // Aggregate tags
    const tagCounts = new Map<string, number>();
    filtered.forEach((r) => {
      r.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    const tags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const aggregate: ReviewAggregate = {
      [subjectType === 'user' ? 'userId' : 'offerId']: subjectId,
      averageRating,
      totalReviews: filtered.length,
      ratingDistribution: distribution,
      tags,
    };

    return successResponse(reply, aggregate);
  });

  fastify.get('/reviews/by-user/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = mockReviews.filter(
      (item) => item.subjectType === 'user' && item.subjectId === id,
    );
    return successResponse(reply, { items, total: items.length });
  });

  fastify.get('/reviews/by-offer/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = mockReviews.filter(
      (item) => item.subjectType === 'offer' && item.subjectId === id,
    );
    return successResponse(reply, { items, total: items.length });
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
