import { ENABLE_MOCK_MODE } from '../constants/config';
import apiClient from './apiClient';

export interface TrustProfile {
  userId: string;
  trustScore: number;
  verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium_verified';
  completedDeals: number;
  totalEarnings: number;
  reviewCount: number;
  disputeRatio: number;
  proofs: {
    id: string;
    type: 'id' | 'address' | 'education' | 'employment' | 'financial' | 'other';
    status: 'pending' | 'verified' | 'rejected' | 'expired';
    documentUrl?: string;
    verifiedAt?: string;
    expiresAt?: string;
  }[];
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }[];
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

const createMockTrustProfile = (userId: string): TrustProfile => ({
  userId,
  trustScore: 88,
  verificationLevel: 'verified',
  completedDeals: 14,
  totalEarnings: 18250,
  reviewCount: 21,
  disputeRatio: 0.02,
  proofs: [
    {
      id: `${userId}_proof_id`,
      type: 'id',
      status: 'verified',
      verifiedAt: '2026-04-01T00:00:00.000Z',
    },
  ],
  badges: [
    {
      id: `${userId}_badge_fast`,
      name: 'Fast Responder',
      description: 'Replies quickly to marketplace messages',
      icon: '⚡',
      earnedAt: '2026-04-10T00:00:00.000Z',
    },
  ],
  lastCalculatedAt: '2026-04-24T00:00:00.000Z',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-24T00:00:00.000Z',
});

export const trustService = {
  async getMyTrustProfile(): Promise<TrustProfile> {
    if (ENABLE_MOCK_MODE) {
      return createMockTrustProfile('me');
    }

    const response = await apiClient.get('/trust/me');
    return response.data?.data;
  },

  async getTrustProfile(userId: string): Promise<TrustProfile> {
    if (ENABLE_MOCK_MODE) {
      return createMockTrustProfile(userId);
    }

    const response = await apiClient.get(`/trust/${userId}`);
    return response.data?.data;
  },

  async getTrustProfiles(): Promise<TrustProfile[]> {
    if (ENABLE_MOCK_MODE) {
      return [createMockTrustProfile('user_1'), createMockTrustProfile('user_2')];
    }

    const response = await apiClient.get('/trust');
    return response.data?.data || [];
  },
};

export default trustService;
