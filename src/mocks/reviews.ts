import { Review } from '../types/review';

export const mockReviews: Review[] = [
  {
    id: 'review_1',
    dealId: 'deal_1',
    reviewerId: 'user_2',
    reviewerRole: 'client',
    subjectType: 'user',
    subjectId: 'user_1',
    rating: 5,
    comment: 'Excellent work! Delivered exactly what was promised and on time.',
    tags: ['professional', 'reliable', 'great communication'],
    helpfulCount: 15,
    reported: false,
    reviewer: {
      id: 'user_2',
      displayName: 'Jane Smith',
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'review_2',
    dealId: 'deal_2',
    reviewerId: 'user_1',
    reviewerRole: 'client',
    subjectType: 'user',
    subjectId: 'user_3',
    rating: 4,
    comment: 'Good work overall, but there were some delays in communication.',
    tags: ['skilled', 'creative', 'needs better communication'],
    helpfulCount: 8,
    reported: false,
    reviewer: {
      id: 'user_1',
      displayName: 'John Doe',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    createdAt: '2024-04-15T10:00:00Z',
    updatedAt: '2024-04-15T10:00:00Z',
  },
  {
    id: 'review_3',
    dealId: 'deal_3',
    reviewerId: 'user_3',
    reviewerRole: 'provider',
    subjectType: 'offer',
    subjectId: 'offer_1',
    rating: 5,
    comment: 'This offer provided exactly what I needed. Highly recommended!',
    tags: ['detailed', 'comprehensive', 'fair pricing'],
    helpfulCount: 12,
    reported: false,
    reviewer: {
      id: 'user_3',
      displayName: 'Alice Johnson',
      avatarUrl: 'https://example.com/avatar3.jpg',
    },
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-04-10T10:00:00Z',
  },
  {
    id: 'review_4',
    dealId: 'deal_4',
    reviewerId: 'user_2',
    reviewerRole: 'client',
    subjectType: 'user',
    subjectId: 'user_4',
    rating: 3,
    comment: 'Work was okay but took longer than expected to complete.',
    tags: ['average', 'slow delivery', 'decent quality'],
    helpfulCount: 3,
    reported: false,
    reviewer: {
      id: 'user_2',
      displayName: 'Jane Smith',
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

export function getReviewsByUserId(userId: string): Review[] {
  return mockReviews.filter((r) => r.subjectType === 'user' && r.subjectId === userId);
}

export function getReviewsByOfferId(offerId: string): Review[] {
  return mockReviews.filter((r) => r.subjectType === 'offer' && r.subjectId === offerId);
}

export function createReview(
  reviewData: Partial<Review> & { reviewerId: string; reviewerRole: 'client' | 'provider' },
): Review {
  const review: Review = {
    id: `review_${Date.now()}`,
    dealId: reviewData.dealId || '',
    reviewerId: reviewData.reviewerId,
    reviewerRole: reviewData.reviewerRole,
    subjectType: reviewData.subjectType || 'user',
    subjectId: reviewData.subjectId || '',
    rating: reviewData.rating || 5,
    comment: reviewData.comment || '',
    tags: reviewData.tags || [],
    helpfulCount: 0,
    reported: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockReviews.push(review);
  return review;
}
