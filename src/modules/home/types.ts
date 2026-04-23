import { Offer } from '../../types/offer';
import { Request } from '../../types/request';
import { Deal } from '../../types/deal';

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
  featuredOffers: Offer[];
  urgentRequests: Request[];
  openDeals: Deal[];
  aiSuggestions: {
    type: string;
    title: string;
    description: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'deal' | 'proposal' | 'message' | 'review' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}
