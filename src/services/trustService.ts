import { TrustProfile, TrustFilter, TrustInput, UpdateTrustInput } from '../types/trust';
import { mockTrustProfiles } from '../mocks/trust';

export interface TrustService {
  getTrustProfile(userId: string): Promise<TrustProfile>;
  getMyTrustProfile(): Promise<TrustProfile>;
  getAllTrustProfiles(filters?: TrustFilter): Promise<TrustProfile[]>;
  updateTrustProfile(userId: string, data: UpdateTrustInput): Promise<TrustProfile>;
  createTrustProfile(data: TrustInput): Promise<TrustProfile>;
  deleteTrustProfile(userId: string): Promise<void>;
  getTrustProfilesByVerificationLevel(level: string): Promise<TrustProfile[]>;
  calculateTrustScore(userId: string): Promise<number>;
  getVerificationLevel(userId: string): Promise<string>;
  getCompletedDeals(userId: string): Promise<number>;
  getReviewCount(userId: string): Promise<number>;
  getDisputeRatio(userId: string): Promise<number>;
}

class TrustServiceImpl implements TrustService {
  async getTrustProfile(userId: string): Promise<TrustProfile> {
    const profile = mockTrustProfiles.find((p) => p.userId === userId);
    if (!profile) {
      throw new Error(`Trust profile not found for user ${userId}`);
    }
    return profile;
  }

  async getMyTrustProfile(): Promise<TrustProfile> {
    // In a real implementation, this would get the current user's profile
    // For now, return the first profile as an example
    if (mockTrustProfiles.length > 0) {
      return mockTrustProfiles[0];
    }
    throw new Error('No trust profiles found');
  }

  async getAllTrustProfiles(filters?: TrustFilter): Promise<TrustProfile[]> {
    let profiles = [...mockTrustProfiles];

    if (filters) {
      if (filters.minTrustScore !== undefined) {
        profiles = profiles.filter((p) => p.trustScore >= filters.minTrustScore!);
      }

      if (filters.maxTrustScore !== undefined) {
        profiles = profiles.filter((p) => p.trustScore <= filters.maxTrustScore!);
      }

      if (filters.verificationLevel) {
        profiles = profiles.filter((p) => p.verificationLevel === filters.verificationLevel);
      }

      if (filters.minCompletedDeals !== undefined) {
        profiles = profiles.filter((p) => p.completedDeals >= filters.minCompletedDeals!);
      }
    }

    return profiles;
  }

  async updateTrustProfile(userId: string, data: UpdateTrustInput): Promise<TrustProfile> {
    const index = mockTrustProfiles.findIndex((p) => p.userId === userId);
    if (index === -1) {
      throw new Error(`Trust profile not found for user ${userId}`);
    }

    const updated = {
      ...mockTrustProfiles[index],
      ...data,
      lastCalculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTrustProfiles[index] = updated;
    return updated;
  }

  async createTrustProfile(data: TrustInput): Promise<TrustProfile> {
    // Validate and clamp trustScore to 0-100 range
    const trustScore = Math.min(100, Math.max(0, data.trustScore ?? 0));
    // Validate and clamp disputeRatio to 0-1 range
    const disputeRatio = Math.min(1, Math.max(0, data.disputeRatio ?? 0));

    const profile: TrustProfile = {
      userId: data.userId,
      trustScore,
      verificationLevel: data.verificationLevel || 'unverified',
      completedDeals: Math.max(0, data.completedDeals ?? 0),
      totalEarnings: Math.max(0, data.totalEarnings ?? 0),
      reviewCount: Math.max(0, data.reviewCount ?? 0),
      disputeRatio,
      proofs: [],
      badges: [],
      lastCalculatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTrustProfiles.push(profile);
    return profile;
  }

  async deleteTrustProfile(userId: string): Promise<void> {
    const index = mockTrustProfiles.findIndex((p) => p.userId === userId);
    if (index === -1) {
      throw new Error(`Trust profile not found for user ${userId}`);
    }
    mockTrustProfiles.splice(index, 1);
  }

  async getTrustProfilesByVerificationLevel(level: string): Promise<TrustProfile[]> {
    return mockTrustProfiles.filter((p) => p.verificationLevel === level);
  }

  async calculateTrustScore(userId: string): Promise<number> {
    // In a real implementation, this would calculate the trust score based on various factors
    // For now, return a mock score
    const profile = mockTrustProfiles.find((p) => p.userId === userId);
    return profile ? profile.trustScore : 0;
  }

  async getVerificationLevel(userId: string): Promise<string> {
    const profile = mockTrustProfiles.find((p) => p.userId === userId);
    return profile ? profile.verificationLevel : 'unverified';
  }

  async getCompletedDeals(userId: string): Promise<number> {
    const profile = mockTrustProfiles.find((p) => p.userId === userId);
    return profile ? profile.completedDeals : 0;
  }

  async getReviewCount(userId: string): Promise<number> {
    const profile = mockTrustProfiles.find((p) => p.userId === userId);
    return profile ? profile.reviewCount : 0;
  }

  async getDisputeRatio(userId: string): Promise<number> {
    const profile = mockTrustProfiles.find((p) => p.userId === userId);
    return profile ? profile.disputeRatio : 0;
  }
}

export const trustService: TrustService = new TrustServiceImpl();
