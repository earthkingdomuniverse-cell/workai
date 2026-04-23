import apiClient from './apiClient';
import { generateMockDeals, generateMockDeal } from './mockData';

const USE_MOCK_FALLBACK = true;

export interface Deal {
  id: string;
  offerId?: string;
  requestId?: string;
  proposalId?: string;
  providerId: string;
  clientId: string;
  status:
    | 'created'
    | 'funded'
    | 'submitted'
    | 'released'
    | 'disputed'
    | 'refunded'
    | 'under_review';
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
  createdAt: string;
  updatedAt: string;
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

export interface DealTimelineEvent {
  id: string;
  type: 'status_change' | 'milestone_update' | 'message' | 'payment' | 'dispute';
  title: string;
  description?: string;
  status?: string;
  milestoneId?: string;
  amount?: number;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealInput {
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

export const dealService = {
  async getDeals(filters?: {
    providerId?: string;
    clientId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<Deal[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.providerId) params.append('providerId', filters.providerId);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const query = params.toString();
      const response = await apiClient.get(query ? `/deals?${query}` : '/deals');
      return response.data?.items || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('dealService.getDeals failed, using mock fallback');
        return generateMockDeals(filters?.limit || 10);
      }
      throw error;
    }
  },

  async getDeal(id: string): Promise<Deal> {
    try {
      const response = await apiClient.get(`/deals/${id}`);
      return response.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`dealService.getDeal(${id}) failed, using mock fallback`);
        return generateMockDeal(id);
      }
      throw error;
    }
  },

  async getMyDealsAsProvider(): Promise<Deal[]> {
    try {
      const response = await apiClient.get('/deals?providerId=me');
      return response.data?.items || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('dealService.getMyDealsAsProvider failed, using mock fallback');
        return generateMockDeals(5);
      }
      throw error;
    }
  },

  async getDealsAsClient(): Promise<Deal[]> {
    try {
      const response = await apiClient.get('/deals?clientId=me');
      return response.data?.items || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('dealService.getDealsAsClient failed, using mock fallback');
        return generateMockDeals(5);
      }
      throw error;
    }
  },

  async createDeal(data: CreateDealInput): Promise<Deal> {
    try {
      const response = await apiClient.post('/deals', data);
      return response.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('dealService.createDeal failed, using mock fallback');
        return generateMockDeal('new-deal', data);
      }
      throw error;
    }
  },

  async fundDeal(id: string, data: FundDealInput): Promise<Deal> {
    try {
      const response = await apiClient.post(`/deals/${id}/fund`, data);
      return response.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`dealService.fundDeal(${id}) failed, using mock fallback`);
        const deal = generateMockDeal(id);
        deal.status = 'funded';
        deal.fundedAmount = deal.amount;
        return deal;
      }
      throw error;
    }
  },

  async submitWork(id: string, data: SubmitWorkInput): Promise<Deal> {
    try {
      const response = await apiClient.post(`/deals/${id}/submit`, data);
      return response.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`dealService.submitWork(${id}) failed, using mock fallback`);
        const deal = generateMockDeal(id);
        deal.status = 'submitted';
        return deal;
      }
      throw error;
    }
  },

  async releaseFunds(id: string, data: ReleaseFundsInput): Promise<Deal> {
    try {
      const response = await apiClient.post(`/deals/${id}/release`, data);
      return response.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`dealService.releaseFunds(${id}) failed, using mock fallback`);
        const deal = generateMockDeal(id);
        deal.status = 'released';
        deal.releasedAmount = deal.amount;
        return deal;
      }
      throw error;
    }
  },

  async createDispute(id: string, data: CreateDisputeInput): Promise<Deal> {
    try {
      const response = await apiClient.post(`/deals/${id}/dispute`, data);
      return response.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`dealService.createDispute(${id}) failed, using mock fallback`);
        const deal = generateMockDeal(id);
        deal.status = 'disputed';
        deal.dispute = {
          id: `dispute-${id}`,
          reason: data.reason,
          status: 'open',
          createdAt: new Date().toISOString(),
        };
        return deal;
      }
      throw error;
    }
  },
};

export default dealService;
