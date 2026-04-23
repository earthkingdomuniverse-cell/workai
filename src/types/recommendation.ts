export type RecommendationType = 'offer' | 'request' | 'user' | 'deal' | 'proposal';

export type RecommendationReason =
  | 'skill_match'
  | 'interest_match'
  | 'trending'
  | 'new'
  | 'popular'
  | 'trusted_provider'
  | 'high_rating'
  | 'similar_to_recent'
  | 'location_match'
  | 'budget_match';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  entityId: string;
  title: string;
  description: string;
  reason: RecommendationReason;
  reasonText: string;
  score: number; // 0-100
  relevance: number; // 0-1
  thumbnail?: string;
  metadata: {
    price?: number;
    currency?: string;
    deliveryTime?: number;
    provider?: {
      id: string;
      displayName: string;
      trustScore?: number;
      completedDeals?: number;
      averageRating?: number;
    };
    requester?: {
      id: string;
      displayName: string;
      trustScore?: number;
    };
    skills?: string[];
    budget?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  createdAt: string;
  expiresAt?: string;
}

export interface RecommendationFilter {
  userId?: string;
  limit?: number;
  offset?: number;
  categories?: string[];
  minScore?: number;
  sortBy?: 'score' | 'relevance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RecommendationInput {
  userId: string;
  profile?: any;
  skills?: string[];
  interests?: string[];
  location?: string;
  history?: any[];
  minTrustScore?: number;
  maxBudget?: number;
  minBudget?: number;
}

export interface RecommendationOutput {
  items: Recommendation[];
  total: number;
  timestamp: string;
}

export const RECOMMENDATION_REASONS: Record<RecommendationReason, string> = {
  skill_match: 'Based on your skills',
  interest_match: 'Based on your interests',
  trending: 'Trending right now',
  new: 'Newly added',
  popular: 'Popular among users',
  trusted_provider: 'Highly trusted provider',
  high_rating: 'Highly rated',
  similar_to_recent: 'Similar to what you viewed',
  location_match: 'Near your location',
  budget_match: 'Matches your budget range',
};
