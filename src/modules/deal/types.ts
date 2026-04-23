import { DealStatus, Timestamps } from '../../types/common';

export interface Deal extends Timestamps {
  id: string;
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  providerId: string;
  clientId: string;
  status: DealStatus;
  title: string;
  description: string;
  amount: number;
  currency: string;
  fundedAmount: number;
  releasedAmount: number;
  serviceFee: number;
  milestones: DealMilestone[];
  attachments?: string[];
  views: number;
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
    completedDeals: number;
    averageRating: number;
  };
  client?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
    completedDeals: number;
    averageRating: number;
  };
  request?: {
    id: string;
    title: string;
    description: string;
  };
  offer?: {
    id: string;
    title: string;
    description: string;
  };
  proposal?: {
    id: string;
    title: string;
  };
  dispute?: {
    id: string;
    reason: string;
    status: 'open' | 'under_review' | 'resolved' | 'dismissed';
    resolution?: string;
    createdAt: string;
  };
  timeline: DealTimelineEvent[];
}

export interface DealMilestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  dueDate?: string;
  completedAt?: string;
  attachments?: string[];
}

export interface DealTimelineEvent extends Timestamps {
  id: string;
  type: 'status_change' | 'milestone_update' | 'message' | 'payment' | 'dispute';
  title: string;
  description?: string;
  status?: DealStatus;
  milestoneId?: string;
  amount?: number;
  userId: string;
  userName: string;
}

export interface DealInput {
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  title: string;
  description: string;
  amount: number;
  currency?: string;
  milestones?: DealMilestone[];
  attachments?: string[];
}

export interface DealFilter {
  providerId?: string;
  clientId?: string;
  status?: DealStatus;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FundDealInput {
  amount: number;
  paymentMethodId: string;
  savePaymentMethod?: boolean;
}

export interface SubmitWorkInput {
  milestoneId: string;
  attachments?: string[];
  notes?: string;
}

export interface ReleaseFundsInput {
  milestoneId?: string;
  amount?: number;
  notes?: string;
}

export interface CreateDisputeInput {
  reason: string;
  description: string;
  attachments?: string[];
}

export interface ResolveDisputeInput {
  resolution: string;
  refundAmount?: number;
  notes?: string;
}
