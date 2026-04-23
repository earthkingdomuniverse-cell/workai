import { ProposalStatus, Timestamps } from './common';

export interface Proposal extends Timestamps {
  id: string;
  offerId?: string;
  requestId?: string;
  providerId: string;
  clientId: string;
  status: ProposalStatus;
  title: string;
  message: string;
  proposedAmount: number;
  currency: string;
  estimatedDeliveryDays: number;
  coverLetter?: string;
  attachments?: string[];
  revisions?: number;
  milestones?: ProposalMilestone[];
  views: number;
  likedByClient: boolean;
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
  offerId?: string;
  requestId?: string;
  title: string;
  message: string;
  proposedAmount: number;
  currency?: string;
  estimatedDeliveryDays: number;
  coverLetter?: string;
  attachments?: string[];
  revisions?: number;
  milestones?: ProposalMilestone[];
}

export interface ProposalFilter {
  status?: ProposalStatus;
  minBid?: number;
  maxBid?: number;
  sortBy?: 'createdAt' | 'amount' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}
