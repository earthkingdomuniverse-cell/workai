export interface AiMatchInput {
  title: string;
  skills: string[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  urgency?: 'low' | 'medium' | 'high';
  location?: string;
  experienceLevel?: string;
}

export interface AiMatchOutput {
  recommendations: AiRecommendation[];
  requestId?: string;
  sessionId?: string;
}

export interface AiRecommendation {
  id: string;
  type: 'offer' | 'user' | 'request';
  title: string;
  description: string;
  score: number; // 0-100
  reason: string;
  matchFactors: MatchFactor[];
  entityId: string;
  entity?: any; // Could be offer, user, or request details
  tags: string[];
  price?: number;
  currency?: string;
  deliveryTime?: number;
  provider?: {
    id: string;
    displayName: string;
    trustScore: number;
    completedDeals: number;
    averageRating: number;
  };
}

export interface MatchFactor {
  name: string;
  weight: number; // 0-1
  score: number; // 0-100
  reason: string;
}

export interface AiMatchResult {
  recommendations: AiRecommendation[];
  totalResults: number;
  query: string;
  timestamp: string;
}

export interface AiMatchFilter {
  minScore?: number;
  maxResults?: number;
  sortBy?: 'score' | 'price' | 'delivery';
  sortOrder?: 'asc' | 'desc';
}
