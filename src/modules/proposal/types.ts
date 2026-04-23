import { ProposalStatus, Timestamps } from '../../types/common';

export interface Proposal extends Timestamps {
  id: string;
  requestId?: string;
  offerId?: string;
  providerId: string;
  clientId: string;
  status: ProposalStatus;
  title: string;
  message: string;
  proposedAmount: number;
  currency: string;
  estimatedDeliveryDays: number;
  revisions?: number;
  attachments?: string[];
  milestones?: ProposalMilestone[];
  views: number;
  likedByClient: boolean;
  provider?: {
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
}

export interface ProposalMilestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  completed: boolean;
}

export interface ProposalInput {
  requestId?: string;
  offerId?: string;
  title: string;
  message: string;
  proposedAmount: number;
  currency?: string;
  estimatedDeliveryDays: number;
  revisions?: number;
  attachments?: string[];
  milestones?: ProposalMilestone[];
}

export interface ProposalFilter {
  requestId?: string;
  offerId?: string;
  providerId?: string;
  clientId?: string;
  status?: ProposalStatus;
  sortBy?: 'createdAt' | 'amount' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProposalListResult {
  items: Proposal[];
  total: number;
}
