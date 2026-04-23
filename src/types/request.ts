import { RequestStatus, Currency, Timestamps } from './common';

export interface Request extends Timestamps {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  category?: string;
  budget?: {
    min: number;
    max: number;
    currency: Currency;
    negotiable: boolean;
  };
  status: RequestStatus;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  skills?: string[];
  deadline?: string;
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  duration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  proposalsCount: number;
  views: number;
  likes: number;
}

export interface RequestInput {
  title: string;
  description: string;
  category?: string;
  budget?: {
    min: number;
    max: number;
    currency?: Currency;
    negotiable?: boolean;
  };
  skills?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  duration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
}

export interface RequestFilter {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[];
  status?: RequestStatus;
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  location?: 'remote' | 'onsite' | 'hybrid';
  sortBy?: 'createdAt' | 'budget' | 'proposals' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}
