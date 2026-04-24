import { ENABLE_MOCK_MODE } from '../constants/config';
import { apiClient } from './apiClient';

export interface RequestItem {
  id: string;
  title: string;
  description: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  deadline?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'archived';
  proposalsCount?: number;
  views?: number;
  requesterId?: string;
  requester?: {
    id?: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
    completedDeals?: number;
    averageRating?: number;
  };
}

export interface RequestPayload {
  title: string;
  description: string;
  budget?: RequestItem['budget'];
  skills?: string[];
  experienceLevel?: RequestItem['experienceLevel'];
  location?: RequestItem['location'];
  urgency?: RequestItem['urgency'];
  deadline?: string;
}

const mockRequests: RequestItem[] = [
  {
    id: 'request_1',
    title: 'E-commerce Platform Development',
    description:
      'Looking for an experienced developer to build a complete e-commerce platform with payment integration, inventory management, and admin dashboard.',
    budget: { min: 8000, max: 15000, currency: 'USD', negotiable: true },
    urgency: 'high',
    skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
    experienceLevel: 'expert',
    location: { type: 'remote' },
    status: 'open',
    proposalsCount: 15,
    views: 342,
    requesterId: 'user_1',
    requester: { displayName: 'John Doe', trustScore: 92, completedDeals: 25, averageRating: 4.8 },
  },
  {
    id: 'request_2',
    title: 'Mobile App UI Design',
    description: 'Need a modern, clean UI design for a fitness tracking mobile application.',
    budget: { min: 2000, max: 4000, currency: 'USD', negotiable: false },
    urgency: 'medium',
    skills: ['Figma', 'Mobile Design', 'UI/UX'],
    experienceLevel: 'intermediate',
    location: { type: 'remote' },
    status: 'in_progress',
    proposalsCount: 8,
    views: 198,
    requesterId: 'user_1',
    requester: {
      displayName: 'Jane Smith',
      trustScore: 88,
      completedDeals: 12,
      averageRating: 4.5,
    },
  },
];

class RequestService {
  async getRequests(filters?: {
    q?: string;
    urgency?: string;
    location?: string;
  }): Promise<RequestItem[]> {
    if (ENABLE_MOCK_MODE) {
      let items = [...mockRequests];
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
        );
      }
      if (filters?.urgency && filters.urgency !== 'all')
        items = items.filter((item) => item.urgency === filters.urgency);
      if (filters?.location && filters.location !== 'all')
        items = items.filter((item) => item.location?.type === filters.location);
      return items;
    }

    try {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.urgency) params.append('urgency', filters.urgency);
      if (filters?.location) params.append('location', filters.location);
      const query = params.toString();
      const response = await apiClient.get<{ data: { items: RequestItem[] } }>(
        query ? `/requests?${query}` : '/requests',
      );
      return response.data.items;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      let items = [...mockRequests];
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
        );
      }
      if (filters?.urgency && filters.urgency !== 'all')
        items = items.filter((item) => item.urgency === filters.urgency);
      if (filters?.location && filters.location !== 'all')
        items = items.filter((item) => item.location?.type === filters.location);
      return items;
    }
  }

  async getRequest(id: string): Promise<RequestItem> {
    if (ENABLE_MOCK_MODE) {
      const item = mockRequests.find((req) => req.id === id);
      if (!item) throw new Error('Request not found');
      return item;
    }

    try {
      const response = await apiClient.get<{ data: RequestItem }>(`/requests/${id}`);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const item = mockRequests.find((req) => req.id === id);
      if (!item) throw new Error('Request not found');
      return item;
    }
  }

  async getMyRequests(): Promise<RequestItem[]> {
    if (ENABLE_MOCK_MODE) {
      return mockRequests.filter((item) => item.requesterId === 'user_1');
    }

    try {
      const response = await apiClient.get<{ data: { items: RequestItem[] } }>('/requests/mine');
      return response.data.items;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      return mockRequests.filter((item) => item.requesterId === 'user_1');
    }
  }

  async createRequest(payload: RequestPayload): Promise<RequestItem> {
    if (ENABLE_MOCK_MODE) {
      const item: RequestItem = {
        id: `request_${Date.now()}`,
        title: payload.title,
        description: payload.description,
        budget: payload.budget,
        skills: payload.skills || [],
        experienceLevel: payload.experienceLevel,
        location: payload.location,
        urgency: payload.urgency || 'medium',
        deadline: payload.deadline,
        status: 'open',
        proposalsCount: 0,
        views: 0,
        requesterId: 'user_1',
        requester: { displayName: 'Mock Requester', trustScore: 80 },
      };
      mockRequests.unshift(item);
      return item;
    }

    try {
      const response = await apiClient.post<{ data: RequestItem }>('/requests', payload);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const item: RequestItem = {
        id: `request_${Date.now()}`,
        title: payload.title,
        description: payload.description,
        budget: payload.budget,
        skills: payload.skills || [],
        experienceLevel: payload.experienceLevel,
        location: payload.location,
        urgency: payload.urgency || 'medium',
        deadline: payload.deadline,
        status: 'open',
        proposalsCount: 0,
        views: 0,
        requesterId: 'user_1',
        requester: { displayName: 'Mock Requester', trustScore: 80 },
      };
      mockRequests.unshift(item);
      return item;
    }
  }

  async updateRequest(
    id: string,
    payload: Partial<RequestPayload> & { status?: RequestItem['status'] },
  ): Promise<RequestItem> {
    if (ENABLE_MOCK_MODE) {
      const index = mockRequests.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Request not found');
      mockRequests[index] = { ...mockRequests[index], ...payload } as RequestItem;
      return mockRequests[index];
    }

    try {
      const response = await apiClient.patch<{ data: RequestItem }>(`/requests/${id}`, payload);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const index = mockRequests.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Request not found');
      mockRequests[index] = { ...mockRequests[index], ...payload } as RequestItem;
      return mockRequests[index];
    }
  }

  async deleteRequest(id: string): Promise<void> {
    if (ENABLE_MOCK_MODE) {
      const index = mockRequests.findIndex((item) => item.id === id);
      if (index >= 0) mockRequests.splice(index, 1);
      return;
    }

    try {
      await apiClient.delete<{ data: { deleted: boolean } }>(`/requests/${id}`);
      return;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const index = mockRequests.findIndex((item) => item.id === id);
      if (index >= 0) mockRequests.splice(index, 1);
    }
  }
}

export const requestService = new RequestService();
