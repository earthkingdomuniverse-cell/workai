import { DealStatus, Timestamps } from './common';

export interface Deal extends Timestamps {
  id: string;
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  providerId: string;
  clientId: string;
  status: DealStatus;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  milestones: DealMilestone[];
  funding: {
    status: 'unfunded' | 'funded' | 'partially_funded' | 'refunded';
    fundedAmount: number;
    releasedAmount: number;
    refundedAmount: number;
  };
  timeline?: {
    startDate: string;
    endDate?: string;
    estimatedEndDate?: string;
  };
  delivery?: {
    submittedAt?: string;
    deliveredFiles?: string[];
    clientMessage?: string;
  };
  dispute?: {
    id: string;
    reason: string;
    description: string;
    status: 'open' | 'under_review' | 'resolved' | 'closed';
    raisedBy: 'provider' | 'client';
    raisedAt: string;
    resolvedAt?: string;
  };
  reviews?: {
    providerReview?: ReviewSummary;
    clientReview?: ReviewSummary;
  };
}

export interface DealMilestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  dueDate?: string;
  submittedAt?: string;
  approvedAt?: string;
  feedback?: string;
}

export interface ReviewSummary {
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface DealInput {
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  milestones?: DealMilestone[];
  timeline?: {
    startDate?: string;
    endDate?: string;
    estimatedEndDate?: string;
  };
}
