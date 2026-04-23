import { apiClient } from './apiClient';

export interface HomeStats {
  offers: {
    total: number;
    active: number;
    views: number;
  };
  requests: {
    total: number;
    open: number;
  };
  deals: {
    active: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
    pending: number;
    currency: string;
  };
  trust: {
    score: number;
    level: string;
  };
}

export interface HomeData {
  stats: HomeStats;
  featuredOffers: any[];
  urgentRequests: any[];
  openDeals: any[];
  aiSuggestions: {
    type: string;
    title: string;
    description: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    data?: any;
  }[];
}

class HomeService {
  async getHomeData(): Promise<HomeData> {
    try {
      const response = await apiClient.get<HomeData>('/home');
      return response;
    } catch (error) {
      // Mock fallback
      return {
        stats: {
          offers: { total: 15, active: 12, views: 1250 },
          requests: { total: 28, open: 18 },
          deals: { active: 5, pending: 2, completed: 23 },
          revenue: { total: 45000, pending: 5000, currency: 'USD' },
          trust: { score: 92, level: 'gold' },
        },
        featuredOffers: [],
        urgentRequests: [],
        openDeals: [],
        aiSuggestions: [],
        recentActivity: [],
      };
    }
  }
}

export const homeService = new HomeService();
