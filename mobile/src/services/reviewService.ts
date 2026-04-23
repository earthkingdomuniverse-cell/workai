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

export const reviewService = {
  async createReview(data: any): Promise<Review> {
    const response = await apiClient.post('/reviews', data);
    return response.data?.data;
  },

  async getReviews(filters?: {
    subjectType?: 'user' | 'offer';
    subjectId?: string;
    reviewerId?: string;
    rating?: number;
  }): Promise<Review[]> {
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
    const response = await apiClient.get(`/reviews/by-user/${userId}`);
    return response.data?.items || [];
  },

  async getReviewsByOfferId(offerId: string): Promise<Review[]> {
    const response = await apiClient.get(`/reviews/by-offer/${offerId}`);
    return response.data?.items || [];
  },

  async getReviewAggregate(
    subjectType: 'user' | 'offer',
    subjectId: string,
  ): Promise<ReviewAggregate> {
    const response = await apiClient.get(`/reviews/aggregate/${subjectType}/${subjectId}`);
    return response.data?.data;
  },
};

export default reviewService;
