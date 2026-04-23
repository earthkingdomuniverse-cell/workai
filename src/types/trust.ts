import { Timestamps } from './common';

export type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium_verified';

export interface TrustProfile extends Timestamps {
  userId: string;
  trustScore: number; // 0-100
  verificationLevel: VerificationLevel;
  completedDeals: number;
  totalEarnings: number;
  reviewCount: number;
  disputeRatio: number; // 0-1 ratio
  proofs: TrustProof[];
  badges: TrustBadge[];
  lastCalculatedAt: string;
}

export interface TrustProof {
  id: string;
  type: 'id' | 'address' | 'education' | 'employment' | 'financial' | 'other';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  documentUrl?: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface TrustFilter {
  minTrustScore?: number;
  maxTrustScore?: number;
  verificationLevel?: VerificationLevel;
  minCompletedDeals?: number;
  sortBy?: 'trustScore' | 'completedDeals' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface TrustInput {
  userId: string;
  trustScore?: number;
  verificationLevel?: VerificationLevel;
  completedDeals?: number;
  totalEarnings?: number;
  reviewCount?: number;
  disputeRatio?: number;
}

export interface UpdateTrustInput {
  trustScore?: number;
  verificationLevel?: VerificationLevel;
  completedDeals?: number;
  totalEarnings?: number;
  reviewCount?: number;
  disputeRatio?: number;
}
