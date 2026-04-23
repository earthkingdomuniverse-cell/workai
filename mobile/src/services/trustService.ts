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

export const trustService = {
  async getMyTrustProfile(): Promise<TrustProfile> {
    const response = await apiClient.get('/trust/me');
    return response.data?.data;
  },

  async getTrustProfile(userId: string): Promise<TrustProfile> {
    const response = await apiClient.get(`/trust/${userId}`);
    return response.data?.data;
  },

  async getTrustProfiles(): Promise<TrustProfile[]> {
    const response = await apiClient.get('/trust');
    return response.data?.data || [];
  },
};

export default trustService;
