import { Review, ReviewAggregate, CreateReviewInput, ReviewFilter } from '../types/review';
import { mockReviews } from '../mocks/reviews';
import { AppError } from '../lib/errors';
import { liveMockDeals } from '../routes/deals';

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

class ReviewServiceImpl implements ReviewService {
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

    const duplicate = mockReviews.find(
      (item) => item.dealId === data.dealId && item.reviewerId === reviewerId,
    );
    if (duplicate) {
      throw new AppError('Review already submitted for this deal by this user', {
        code: 'CONFLICT_ERROR',
        statusCode: 409,
      });
    }

    // Create review
    const review: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      dealId: data.dealId,
      reviewerId,
      reviewerRole,
      subjectType: data.subjectType,
      subjectId: data.subjectId,
      rating: data.rating,
      comment: data.comment,
      tags: data.tags,
      helpfulCount: 0,
      reported: false,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockReviews.push(review);
    return review;
  }

  async getReviews(filters?: ReviewFilter): Promise<Review[]> {
    let reviews = [...mockReviews];

    if (filters) {
      if (filters.subjectId) {
        reviews = reviews.filter((r) => r.subjectId === filters.subjectId);
      }

      if (filters.subjectType) {
        reviews = reviews.filter((r) => r.subjectType === filters.subjectType);
      }

      if (filters.reviewerId) {
        reviews = reviews.filter((r) => r.reviewerId === filters.reviewerId);
      }

      if (filters.rating) {
        reviews = reviews.filter((r) => r.rating === filters.rating);
      }
    }

    return reviews;
  }

  async getReviewById(id: string): Promise<Review | null> {
    const review = mockReviews.find((r) => r.id === id);
    return review || null;
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    return mockReviews.filter((r) => r.subjectType === 'user' && r.subjectId === userId);
  }

  async getReviewsByOfferId(offerId: string): Promise<Review[]> {
    return mockReviews.filter((r) => r.subjectType === 'offer' && r.subjectId === offerId);
  }

  async getReviewAggregate(
    subjectType: 'user' | 'offer',
    subjectId: string,
  ): Promise<ReviewAggregate> {
    const reviews = subjectId
      ? mockReviews.filter((r) => r.subjectType === subjectType && r.subjectId === subjectId)
      : mockReviews;

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        tags: [],
      } as ReviewAggregate;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      (ratingDistribution as any)[r.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    // Collect tags
    const tagCounts: Record<string, number> = {};
    reviews.forEach((r) => {
      r.tags.forEach((tag) => {
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
    const index = mockReviews.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Review ${id} not found`);
    }

    const updated = {
      ...mockReviews[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockReviews[index] = updated;
    return updated;
  }

  async deleteReview(id: string): Promise<void> {
    const index = mockReviews.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Review ${id} not found`);
    }
    mockReviews.splice(index, 1);
  }

  async canSubmitReview(dealId: string, reviewerId: string): Promise<boolean> {
    const deal = liveMockDeals.find((item) => item.id === dealId);
    if (!deal || deal.status !== 'released') {
      return false;
    }

    return [deal.clientId, deal.providerId].includes(reviewerId);
  }
}

export const reviewService: ReviewService = new ReviewServiceImpl();
