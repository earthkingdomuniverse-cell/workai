import apiClient from './apiClient';
import { generateMockProposals, generateMockProposal } from './mockData';

const USE_MOCK_FALLBACK = true;

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
      const response = await apiClient.get(query ? `/proposals?${query}` : '/proposals');
      return response.data?.data?.items || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('proposalService.getProposals failed, using mock fallback');
        return generateMockProposals(filters?.limit || 5);
      }
      throw error;
    }
  },

  async getProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.get(`/proposals/${id}`);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`proposalService.getProposal(${id}) failed, using mock fallback`);
        return generateMockProposal(id);
      }
      throw error;
    }
  },

  async getMyProposals(): Promise<Proposal[]> {
    try {
      const response = await apiClient.get('/proposals/mine');
      return response.data?.data?.items || [];
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('proposalService.getMyProposals failed, using mock fallback');
        return generateMockProposals(5);
      }
      throw error;
    }
  },

  async createProposal(data: CreateProposalInput): Promise<Proposal> {
    try {
      const response = await apiClient.post('/proposals', data);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn('proposalService.createProposal failed, using mock fallback');
        return generateMockProposal('new-proposal');
      }
      throw error;
    }
  },

  async acceptProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.post(`/proposals/${id}/accept`);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`proposalService.acceptProposal(${id}) failed, using mock fallback`);
        const proposal = generateMockProposal(id, 'accepted');
        return proposal;
      }
      throw error;
    }
  },

  async rejectProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.post(`/proposals/${id}/reject`);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`proposalService.rejectProposal(${id}) failed, using mock fallback`);
        const proposal = generateMockProposal(id, 'rejected');
        return proposal;
      }
      throw error;
    }
  },

  async withdrawProposal(id: string): Promise<Proposal> {
    try {
      const response = await apiClient.post(`/proposals/${id}/withdraw`);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
        console.warn(`proposalService.withdrawProposal(${id}) failed, using mock fallback`);
        const proposal = generateMockProposal(id, 'withdrawn');
        return proposal;
      }
      throw error;
    }
  },

  async updateProposal(id: string, data: Partial<CreateProposalInput>): Promise<Proposal> {
    try {
      const response = await apiClient.patch(`/proposals/${id}`, data);
      return response.data?.data;
    } catch (error) {
      if (USE_MOCK_FALLBACK) {
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
      if (USE_MOCK_FALLBACK) {
        console.warn(`proposalService.deleteProposal(${id}) failed, using mock fallback`);
        return;
      }
      throw error;
    }
  },
};

export default proposalService;
