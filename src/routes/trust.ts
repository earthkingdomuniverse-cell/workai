import { FastifyPluginAsync } from 'fastify';
import { successResponse } from '../lib/response';
import { authenticate } from '../lib/auth';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';

async function requireTrustUser(request: any, reply: any) {
  const user = await authenticate(request, reply);
  if (!user || user.userId === 'guest_user') {
    throw new AppError('Authentication required', {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
    });
  }
  return user;
}

function calculateTrustLevel(score: number) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'good';
  if (score >= 40) return 'limited';
  return 'low';
}

async function buildTrustProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      trustScore: true,
      createdAt: true,
      _count: {
        select: {
          offers: true,
          requests: true,
          providerDeals: true,
          clientDeals: true,
          reviewsReceived: true,
          reviewsWritten: true,
          disputesReported: true,
          disputesReceived: true,
        },
      },
    },
  });

  if (!user) return null;

  const [ratingAggregate, completedProviderDeals, completedClientDeals, openDisputes] = await Promise.all([
    prisma.review.aggregate({
      where: { subjectId: userId, status: 'published' },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.deal.count({ where: { providerId: userId, status: 'released' } }),
    prisma.deal.count({ where: { clientId: userId, status: 'released' } }),
    prisma.dispute.count({
      where: {
        OR: [{ reporterId: userId }, { reportedUserId: userId }],
        status: { in: ['open', 'under_review'] },
      },
    }),
  ]);

  const completedDeals = completedProviderDeals + completedClientDeals;
  const averageRating = Math.round(((ratingAggregate._avg.rating || 0) as number) * 10) / 10;
  const reviewCount = ratingAggregate._count.rating || 0;
  const accountAgeDays = Math.max(
    0,
    Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    trustScore: user.trustScore,
    trustLevel: calculateTrustLevel(user.trustScore),
    averageRating,
    reviewCount,
    completedDeals,
    completedProviderDeals,
    completedClientDeals,
    openDisputes,
    accountAgeDays,
    verification: {
      email: true,
      identity: false,
      payment: completedDeals > 0,
      portfolio: user._count.offers > 0,
    },
    activity: {
      offers: user._count.offers,
      requests: user._count.requests,
      dealsAsProvider: user._count.providerDeals,
      dealsAsClient: user._count.clientDeals,
      reviewsReceived: user._count.reviewsReceived,
      reviewsWritten: user._count.reviewsWritten,
      disputesReported: user._count.disputesReported,
      disputesReceived: user._count.disputesReceived,
    },
    signals: {
      hasCompletedDeal: completedDeals > 0,
      hasReviews: reviewCount > 0,
      hasOpenDisputes: openDisputes > 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

const trust: FastifyPluginAsync = async (fastify) => {
  fastify.get('/trust/me', async (request, reply) => {
    const user = await requireTrustUser(request, reply);
    const profile = await buildTrustProfile(user.userId);

    if (!profile) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Trust profile not found',
        },
      });
    }

    return successResponse(reply, profile);
  });

  fastify.get('/trust/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const profile = await buildTrustProfile(userId);

    if (!profile) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Trust profile not found',
        },
      });
    }

    return successResponse(reply, profile);
  });

  fastify.get('/trust', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const limit = Math.min(Number(query.limit || 20), 100);
    const users = await prisma.user.findMany({
      orderBy: { trustScore: 'desc' },
      take: limit,
      select: { id: true },
    });

    const profiles = await Promise.all(users.map((user) => buildTrustProfile(user.id)));
    const items = profiles.filter(Boolean);

    return successResponse(reply, { items, total: items.length });
  });
};

export default trust;
