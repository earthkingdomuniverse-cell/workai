import { Timestamps } from './common';

export type ReviewerRole = 'client' | 'provider';

export type ReviewStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'flagged'
  | 'removed'
  | 'refunded'
  | 'held'
  | 'processed';

export interface Review extends Timestamps {
  id: string;
  dealId: string;
  reviewerId: string;
  reviewerRole: ReviewerRole;
  subjectType: 'user' | 'offer';
  subjectId: string;
  rating: number; // 1-5 stars
  comment: string;
  tags: string[];
  helpfulCount: number;
  reported: boolean;
  status?: ReviewStatus;
  reviewer?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
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

export interface CreateReviewInput {
  dealId: string;
  subjectType: 'user' | 'offer';
  subjectId: string;
  rating: number;
  comment: string;
  tags: string[];
}

export interface ReviewFilter {
  subjectType?: 'user' | 'offer';
  subjectId?: string;
  reviewerId?: string;
  rating?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}
