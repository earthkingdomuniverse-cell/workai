import apiClient from './apiClient';
import { generateMockRecommendations, generateMockPriceSuggestion, generateMockSupportResponse } from './mockData';

const USE_MOCK_FALLBACK = true;

export interface AiMatchInput {
  title: string;
  skills?: string[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  urgency?: 'low' | 'medium' | 'high';
}

export interface MatchFactor {
  name: string;
  weight: number;
  score: number;
  reason: string;
}

export interface AiRecommendation {
  id: string;
  type: 'offer' | 'user' | 'request';
  title: string;
  description: string;
  score: number;
  reason: string;
  matchFactors: MatchFactor[];
  entityId: string;
  entity?: any;
  tags: string[];
  price?: number;
  currency?: string;
  deliveryTime?: number;
}

export interface PriceSuggestionInput {
  title: string;
  skills: string[];
  providerLevel: 'beginner' | 'intermediate' | 'expert';
}

export interface SupportInput {
  message: string;
}

export interface SupportOutput {
  category: string;
  priority: string;
  answer: string;
  confidence: number;
  escalationRequired: boolean;
}

export const aiService = {
  async match(input: AiMatchInput): Promise<AiRecommendation[]> {
    try {
      const response = await apiClient.post('/ai/match', input);
      return response.data?.data?.recommendations || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('aiService.match failed, using mock fallback');
        return generateMockRecommendations(5);
      }
      throw error;
    }
  },

  async suggestPrice(input: PriceSuggestionInput): Promise<{
    suggested_price: number;
    floor_price: number;
    ceiling_price: number;
    reasoning: string[];
  }> {
    try {
      const response = await apiClient.post('/ai/price', input);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('aiService.suggestPrice failed, using mock fallback');
        return generateMockPriceSuggestion();
      }
      throw error;
    }
  },

  async support(input: SupportInput): Promise<SupportOutput> {
    try {
      const response = await apiClient.post('/ai/support', input);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('aiService.support failed, using mock fallback');
        return generateMockSupportResponse(input.message);
      }
      throw error;
    }
  },
};

export default aiService;
