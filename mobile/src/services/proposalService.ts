import { ENABLE_MOCK_MODE } from '../constants/config';
import apiClient from './apiClient';
import { generateMockProposals, generateMockProposal } from './mockData';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

interface ListResponse<T> {
  items: T[];
  total?: number;
}

export interface Proposal {
  id: string;
  requestId?: string;
  offerId?: string;
  providerId: string;
  clientId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  title: string;
  message: string;
  proposedAmount: number;
  currency: string;
  estimatedDeliveryDays: number;
  revisions?: number;
  attachments?: string[];
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalInput {
  requestId?: string;
  offerId?: string;
  clientId?: string;
  title: string;
  message: string;
  proposedAmount: number;
  currency?: string;
  estimatedDeliveryDays: number;
  revisions?: number;
  attachments?: string[];
}

function shouldUseMockFallback(): boolean {
  return ENABLE_MOCK_MODE;
}

export const proposalService = {
  async getProposals(filters?: {
    requestId?: string;
    offerId?: string;
    providerId?: string;
    clientId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<Proposal[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.requestId) params.append('requestId', filters.requestId);
      if (filters?.offerId) params.append('offerId', filters.offerId);
      if (filters?.providerId) params.append('providerId', filters.providerId);
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const query = params.toString();
      const response = await apiClient.get<ApiResponse<ListResponse<Proposal>>>(
        query ? `/proposals?${query}` : '/proposals',
      );
      return response.data.items || [];
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn('proposalService.getProposals failed, using mock fallback');
        return generateMockProposals(filters?.limit || 5);
      }
      throw error;
    }
  },

  async getProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.get<ApiResponse<Proposal>>(`/proposals/${id}`);
      return response.data;
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn(`proposalService.getProposal(${id}) failed, using mock fallback`);
        return generateMockProposal(id);
      }
      throw error;
    }
  },

  async getMyProposals(): Promise<Proposal[]> {
    try {
      const response = await apiClient.get<ApiResponse<ListResponse<Proposal>>>('/proposals/mine');
      return response.data.items || [];
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn('proposalService.getMyProposals failed, using mock fallback');
        return generateMockProposals(5);
      }
      throw error;
    }
  },

  async createProposal(data: CreateProposalInput): Promise<Proposal> {
    try {
      const response = await apiClient.post<ApiResponse<Proposal>>('/proposals', data);
      return response.data;
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn('proposalService.createProposal failed, using mock fallback');
        return generateMockProposal('new-proposal');
      }
      throw error;
    }
  },

  async acceptProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.post<ApiResponse<Proposal>>(`/proposals/${id}/accept`);
      return response.data;
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn(`proposalService.acceptProposal(${id}) failed, using mock fallback`);
        return generateMockProposal(id, 'accepted');
      }
      throw error;
    }
  },

  async rejectProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.post<ApiResponse<Proposal>>(`/proposals/${id}/reject`);
      return response.data;
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn(`proposalService.rejectProposal(${id}) failed, using mock fallback`);
        return generateMockProposal(id, 'rejected');
      }
      throw error;
    }
  },

  async withdrawProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.post<ApiResponse<Proposal>>(`/proposals/${id}/withdraw`);
      return response.data;
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn(`proposalService.withdrawProposal(${id}) failed, using mock fallback`);
        return generateMockProposal(id, 'withdrawn');
      }
      throw error;
    }
  },

  async updateProposal(id: string, data: Partial<CreateProposalInput>): Promise<Proposal> {
    try {
      const response = await apiClient.patch<ApiResponse<Proposal>>(`/proposals/${id}`, data);
      return response.data;
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn(`proposalService.updateProposal(${id}) failed, using mock fallback`);
        const proposal = generateMockProposal(id);
        return { ...proposal, ...data };
      }
      throw error;
    }
  },

  async deleteProposal(id: string): Promise<void> {
    try {
      await apiClient.delete(`/proposals/${id}`);
    } catch (error) {
      if (shouldUseMockFallback()) {
        console.warn(`proposalService.deleteProposal(${id}) failed, using mock fallback`);
        return;
      }
      throw error;
    }
  },
};

export default proposalService;
