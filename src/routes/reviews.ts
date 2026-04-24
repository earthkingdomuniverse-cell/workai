import { FastifyPluginAsync } from 'fastify';
import { createdResponse, successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { ReviewAggregate } from '../types/review';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

async function requireReviewUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', { code: 'AUTHENTICATION_ERROR', statusCode: 401 });
  }
  return user;
}

function serializeReview(review: any, subjectType: 'user' | 'offer' = 'user') {
  return {
    id: review.id,
    dealId: review.dealId,
    reviewerId: review.reviewerId,
    reviewerRole: review.deal?.clientId === review.reviewerId ? 'client' : 'provider',
    subjectType,
    subjectId: subjectType === 'offer' ? review.deal?.offerId : review.subjectId,
    rating: review.rating,
    comment: review.comment,
    tags: [],
    helpfulCount: 0,
    reported: false,
    status: review.status === 'published' ? 'approved' : review.status,
    createdAt: review.createdAt?.toISOString?.() ?? review.createdAt,
    updatedAt: review.createdAt?.toISOString?.() ?? review.createdAt,
    reviewer: review.reviewer
      ? {
          id: review.reviewer.id,
          email: review.reviewer.email,
          trustScore: review.reviewer.trustScore,
        }
      : undefined,
    subject: review.subject
      ? {
          id: review.subject.id,
          email: review.subject.email,
          trustScore: review.subject.trustScore,
        }
      : undefined,
  };
}

function buildAggregate(
  subjectType: 'user' | 'offer',
  subjectId: string,
  reviews: any[],
): ReviewAggregate {
  if (reviews.length === 0) {
    return {
      [subjectType === 'user' ? 'userId' : 'offerId']: subjectId,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      tags: [],
    } as ReviewAggregate;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    if (Object.prototype.hasOwnProperty.call(ratingDistribution, review.rating)) {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    }
  });

  return {
    [subjectType === 'user' ? 'userId' : 'offerId']: subjectId,
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    tags: [],
  } as ReviewAggregate;
}

const reviewInclude = {
  reviewer: true,
  subject: true,
  deal: true,
};

const reviews: FastifyPluginAsync = async (fastify) => {
  fastify.get('/reviews', async (request, reply) => {
    const { subjectType, subjectId, reviewerId, rating } = request.query as Record<string, string | undefined>;
    const where: any = {};

    if (reviewerId) where.reviewerId = reviewerId;
    if (rating) where.rating = Number(rating);

    if (subjectType === 'user' && subjectId) {
      where.subjectId = subjectId;
    }

    if (subjectType === 'offer' && subjectId) {
      where.deal = { offerId: subjectId };
    }

    const items = await prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });

    const resolvedSubjectType = subjectType === 'offer' ? 'offer' : 'user';
    return successResponse(reply, {
      items: items.map((item) => serializeReview(item, resolvedSubjectType)),
      total: items.length,
    });
  });

  fastify.get('/reviews/aggregate/:subjectType/:subjectId', async (request, reply) => {
    const { subjectType, subjectId } = request.params as { subjectType: string; subjectId: string };
    if (!['user', 'offer'].includes(subjectType)) {
      throw new AppError('subjectType must be user or offer', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const where = subjectType === 'offer'
      ? { deal: { offerId: subjectId } }
      : { subjectId };

    const items = await prisma.review.findMany({ where });
    return successResponse(reply, buildAggregate(subjectType as 'user' | 'offer', subjectId, items));
  });

  fastify.get('/reviews/by-user/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = await prisma.review.findMany({
      where: { subjectId: id },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(reply, { items: items.map((item) => serializeReview(item, 'user')), total: items.length });
  });

  fastify.get('/reviews/by-offer/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const items = await prisma.review.findMany({
      where: { deal: { offerId: id } },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(reply, { items: items.map((item) => serializeReview(item, 'offer')), total: items.length });
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

    const rating = Number(body.rating);
    const comment = String(body.comment || '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating must be an integer between 1 and 5', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    if (comment.length < 10) {
      throw new AppError('Comment must be at least 10 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const deal = await prisma.deal.findUnique({ where: { id: String(body.dealId) } });
    if (!deal) {
      throw new AppError('Deal not found', { code: 'NOT_FOUND', statusCode: 404 });
    }

    if (deal.status !== 'released') {
      throw new AppError('Reviews can only be submitted after deal release', {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (![deal.clientId, deal.providerId].includes(user.userId)) {
      throw new AppError('Only deal participants can submit reviews', {
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    }

    let subjectId = String(body.subjectId);
    let subjectType: 'user' | 'offer' = body.subjectType === 'offer' ? 'offer' : 'user';

    if (subjectType === 'offer') {
      if (!deal.offerId || deal.offerId !== body.subjectId) {
        throw new AppError('Offer is not associated with this deal', {
          code: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
      subjectId = deal.providerId;
    }

    if (![deal.clientId, deal.providerId].includes(subjectId)) {
      throw new AppError('Review subject must be a deal participant', {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (subjectId === user.userId) {
      throw new AppError('Cannot review yourself', {
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const duplicate = await prisma.review.findFirst({
      where: {
        dealId: deal.id,
        reviewerId: user.userId,
        subjectId,
      },
    });

    if (duplicate) {
      throw new AppError('Review already submitted for this deal and subject', {
        code: 'CONFLICT',
        statusCode: 409,
      });
    }

    const review = await prisma.review.create({
      data: {
        dealId: deal.id,
        reviewerId: user.userId,
        subjectId,
        rating,
        comment,
        status: 'published',
      },
      include: reviewInclude,
    });

    return createdResponse(reply, serializeReview(review, subjectType));
  });
};

export default reviews;
