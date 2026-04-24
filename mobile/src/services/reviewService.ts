import { ENABLE_MOCK_MODE } from '../constants/config';
import apiClient from './apiClient';

export interface Review {
  id: string;
  dealId: string;
  reviewerId: string;
  reviewerRole: 'client' | 'provider';
  subjectType: 'user' | 'offer';
  subjectId: string;
  rating: number;
  comment: string;
  tags: string[];
  helpfulCount: number;
  reported: boolean;
  reviewer?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAggregate {
  userId?: string;
  offerId?: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  tags: {
    name: string;
    count: number;
  }[];
}

const mockReviews: Review[] = [
  {
    id: 'review_1',
    dealId: 'deal_1',
    reviewerId: 'user_1',
    reviewerRole: 'client',
    subjectType: 'offer',
    subjectId: 'offer_1',
    rating: 5,
    comment: 'Excellent delivery and very smooth communication.',
    tags: ['quality', 'fast', 'responsive'],
    helpfulCount: 4,
    reported: false,
    reviewer: {
      id: 'user_1',
      displayName: 'John Doe',
    },
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'review_2',
    dealId: 'deal_2',
    reviewerId: 'user_2',
    reviewerRole: 'provider',
    subjectType: 'user',
    subjectId: 'user_1',
    rating: 4,
    comment: 'Clear brief and prompt payment.',
    tags: ['clear-brief', 'reliable'],
    helpfulCount: 2,
    reported: true,
    reviewer: {
      id: 'user_2',
      displayName: 'Jane Smith',
    },
    createdAt: '2026-04-21T12:00:00.000Z',
    updatedAt: '2026-04-21T12:00:00.000Z',
  },
];

const createAggregate = (subjectType: 'user' | 'offer', subjectId: string): ReviewAggregate => {
  const items = mockReviews.filter(
    (review) => review.subjectType === subjectType && review.subjectId === subjectId,
  );
  const totalReviews = items.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : Number((items.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1));

  return {
    userId: subjectType === 'user' ? subjectId : undefined,
    offerId: subjectType === 'offer' ? subjectId : undefined,
    averageRating,
    totalReviews,
    ratingDistribution: {
      1: items.filter((review) => review.rating === 1).length,
      2: items.filter((review) => review.rating === 2).length,
      3: items.filter((review) => review.rating === 3).length,
      4: items.filter((review) => review.rating === 4).length,
      5: items.filter((review) => review.rating === 5).length,
    },
    tags: Array.from(new Set(items.flatMap((review) => review.tags))).map((name) => ({
      name,
      count: items.filter((review) => review.tags.includes(name)).length,
    })),
  };
};

export const reviewService = {
  async createReview(data: any): Promise<Review> {
    if (ENABLE_MOCK_MODE) {
      return {
        id: `review_${Date.now()}`,
        dealId: data.dealId,
        reviewerId: data.reviewerId || 'user-me',
        reviewerRole: data.reviewerRole || 'client',
        subjectType: data.subjectType || 'offer',
        subjectId: data.subjectId || 'offer_1',
        rating: data.rating || 5,
        comment: data.comment || '',
        tags: data.tags || [],
        helpfulCount: 0,
        reported: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const response = await apiClient.post('/reviews', data);
    return response.data?.data;
  },

  async getReviews(filters?: {
    subjectType?: 'user' | 'offer';
    subjectId?: string;
    reviewerId?: string;
    rating?: number;
  }): Promise<Review[]> {
    if (ENABLE_MOCK_MODE) {
      return mockReviews.filter((review) => {
        if (filters?.subjectType && review.subjectType !== filters.subjectType) return false;
        if (filters?.subjectId && review.subjectId !== filters.subjectId) return false;
        if (filters?.reviewerId && review.reviewerId !== filters.reviewerId) return false;
        if (filters?.rating && review.rating !== filters.rating) return false;
        return true;
      });
    }

    const params = new URLSearchParams();
    if (filters?.subjectType) params.append('subjectType', filters.subjectType);
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.reviewerId) params.append('reviewerId', filters.reviewerId);
    if (filters?.rating) params.append('rating', filters.rating.toString());

    const query = params.toString();
    const response = await apiClient.get(query ? `/reviews?${query}` : '/reviews');
    return response.data?.items || [];
  },

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    if (ENABLE_MOCK_MODE) {
      return mockReviews.filter(
        (review) => review.subjectType === 'user' && review.subjectId === userId,
      );
    }

    const response = await apiClient.get(`/reviews/by-user/${userId}`);
    return response.data?.items || [];
  },

  async getReviewsByOfferId(offerId: string): Promise<Review[]> {
    if (ENABLE_MOCK_MODE) {
      return mockReviews.filter(
        (review) => review.subjectType === 'offer' && review.subjectId === offerId,
      );
    }

    const response = await apiClient.get(`/reviews/by-offer/${offerId}`);
    return response.data?.items || [];
  },

  async getReviewAggregate(
    subjectType: 'user' | 'offer',
    subjectId: string,
  ): Promise<ReviewAggregate> {
    if (ENABLE_MOCK_MODE) {
      return createAggregate(subjectType, subjectId);
    }

    const response = await apiClient.get(`/reviews/aggregate/${subjectType}/${subjectId}`);
    return response.data?.data;
  },
};

export default reviewService;
