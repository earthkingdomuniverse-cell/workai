import { Review, ReviewAggregate, CreateReviewInput, ReviewFilter } from '../types/review';
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

function formatReview(r: any): Review {
  return {
    ...r,
    tags: parseJsonArray(r.tags),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  };
}

export interface ReviewService {
  createReview(
    data: CreateReviewInput,
    reviewerId: string,
    reviewerRole: 'client' | 'provider',
  ): Promise<Review>;
  getReviews(filters?: ReviewFilter): Promise<Review[]>;
  getReviewById(id: string): Promise<Review | null>;
  getReviewsByUserId(userId: string): Promise<Review[]>;
  getReviewsByOfferId(offerId: string): Promise<Review[]>;
  getReviewAggregate(subjectType: 'user' | 'offer', subjectId: string): Promise<ReviewAggregate>;
  updateReview(id: string, data: Partial<CreateReviewInput>): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  canSubmitReview(dealId: string, reviewerId: string): Promise<boolean>;
}

class PrismaReviewService implements ReviewService {
  async createReview(
    data: CreateReviewInput,
    reviewerId: string,
    reviewerRole: 'client' | 'provider',
  ): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    if (data.comment.length < 10) {
      throw new AppError('Comment must be at least 10 characters', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    }

    const canSubmit = await this.canSubmitReview(data.dealId, reviewerId);
    if (!canSubmit) {
      throw new AppError('Cannot submit review for this deal', {
        code: 'BAD_REQUEST_ERROR',
        statusCode: 400,
      });
    }

    const duplicate = await prisma.review.findFirst({
      where: { dealId: data.dealId, reviewerId },
    });
    if (duplicate) {
      throw new AppError('Review already submitted for this deal by this user', {
        code: 'CONFLICT_ERROR',
        statusCode: 409,
      });
    }

    const review = await prisma.review.create({
      data: {
        dealId: data.dealId,
        reviewerId,
        reviewerRole,
        subjectType: data.subjectType,
        subjectId: data.subjectId,
        offerId: data.subjectType === 'offer' ? data.subjectId : null,
        rating: data.rating,
        comment: data.comment,
        tags: JSON.stringify(data.tags),
        status: 'approved',
      },
    });

    return formatReview(review);
  }

  async getReviews(filters?: ReviewFilter): Promise<Review[]> {
    const where: any = {};
    if (filters) {
      if (filters.subjectId) where.subjectId = filters.subjectId;
      if (filters.subjectType) where.subjectType = filters.subjectType;
      if (filters.reviewerId) where.reviewerId = filters.reviewerId;
      if (filters.rating) where.rating = filters.rating;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map(formatReview);
  }

  async getReviewById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({ where: { id } });
    return review ? formatReview(review) : null;
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: { subjectType: 'user', subjectId: userId },
    });
    return reviews.map(formatReview);
  }

  async getReviewsByOfferId(offerId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: { subjectType: 'offer', subjectId: offerId },
    });
    return reviews.map(formatReview);
  }

  async getReviewAggregate(
    subjectType: 'user' | 'offer',
    subjectId: string,
  ): Promise<ReviewAggregate> {
    const reviews = await prisma.review.findMany({
      where: { subjectType, subjectId },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        tags: [],
      } as ReviewAggregate;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      (ratingDistribution as any)[r.rating]++;
    });

    const tagCounts: Record<string, number> = {};
    reviews.forEach((r) => {
      const tags = parseJsonArray(r.tags);
      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
      tags,
    } as ReviewAggregate;
  }

  async updateReview(id: string, data: Partial<CreateReviewInput>): Promise<Review> {
    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

    const review = await prisma.review.update({ where: { id }, data: updateData });
    return formatReview(review);
  }

  async deleteReview(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } });
  }

  async canSubmitReview(dealId: string, reviewerId: string): Promise<boolean> {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal || deal.status !== 'released') {
      return false;
    }
    return [deal.clientId, deal.providerId].includes(reviewerId);
  }
}

export const reviewService: ReviewService = new PrismaReviewService();
