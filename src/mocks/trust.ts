import { TrustProfile } from '../types/trust';

export const mockTrustProfiles: TrustProfile[] = [
  {
    userId: 'user_1',
    trustScore: 92,
    verificationLevel: 'verified',
    completedDeals: 25,
    totalEarnings: 15000,
    reviewCount: 48,
    disputeRatio: 0.04,
    proofs: [
      {
        id: 'proof_1',
        type: 'id',
        status: 'verified',
        verifiedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'proof_2',
        type: 'address',
        status: 'verified',
        verifiedAt: '2024-01-15T10:00:00Z',
      },
    ],
    badges: [
      {
        id: 'badge_1',
        name: 'Top Performer',
        description: 'Completed 20+ deals with 4.5+ rating',
        icon: '🏆',
        earnedAt: '2024-01-15T10:00:00Z',
      },
    ],
    lastCalculatedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    userId: 'user_2',
    trustScore: 88,
    verificationLevel: 'basic',
    completedDeals: 15,
    totalEarnings: 8500,
    reviewCount: 32,
    disputeRatio: 0.06,
    proofs: [
      {
        id: 'proof_3',
        type: 'id',
        status: 'verified',
        verifiedAt: '2024-01-10T10:00:00Z',
      },
    ],
    badges: [],
    lastCalculatedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    userId: 'user_3',
    trustScore: 95,
    verificationLevel: 'premium_verified',
    completedDeals: 42,
    totalEarnings: 32000,
    reviewCount: 68,
    disputeRatio: 0.02,
    proofs: [
      {
        id: 'proof_4',
        type: 'id',
        status: 'verified',
        verifiedAt: '2024-01-12T10:00:00Z',
      },
      {
        id: 'proof_5',
        type: 'financial',
        status: 'verified',
        verifiedAt: '2024-01-12T10:00:00Z',
      },
    ],
    badges: [
      {
        id: 'badge_2',
        name: 'Elite Provider',
        description: 'Top 1% of providers',
        icon: '⭐',
        earnedAt: '2024-01-12T10:00:00Z',
      },
      {
        id: 'badge_3',
        name: 'Top Performer',
        description: 'Consistently high ratings',
        icon: '🏆',
        earnedAt: '2024-01-12T10:00:00Z',
      },
    ],
    lastCalculatedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export function getTrustProfileByUserId(userId: string): TrustProfile | undefined {
  return mockTrustProfiles.find((p) => p.userId === userId);
}

export function createTrustProfile(
  profileData: Partial<TrustProfile> & { userId: string },
): TrustProfile {
  const profile: TrustProfile = {
    userId: profileData.userId,
    trustScore: profileData.trustScore || 0,
    verificationLevel: profileData.verificationLevel || 'unverified',
    completedDeals: profileData.completedDeals || 0,
    totalEarnings: profileData.totalEarnings || 0,
    reviewCount: profileData.reviewCount || 0,
    disputeRatio: profileData.disputeRatio || 0,
    proofs: profileData.proofs || [],
    badges: profileData.badges || [],
    lastCalculatedAt: new Date().toISOString(),
    createdAt: profileData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockTrustProfiles.push(profile);
  return profile;
}
