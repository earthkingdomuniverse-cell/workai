import { OfferStatus, Currency, Timestamps } from '../../types/common';

export interface Offer extends Timestamps {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  currency: Currency;
  pricingType: 'fixed' | 'hourly' | 'negotiable';
  status: OfferStatus;
  skills?: string[];
  deliveryDays?: number;
  revisions?: number;
  images?: string[];
  views: number;
  likes: number;
  proposalsCount: number;
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
    completedDeals: number;
    averageRating: number;
  };
}

export interface OfferInput {
  title: string;
  description: string;
  category?: string;
  price: number;
  currency?: Currency;
  pricingType?: 'fixed' | 'hourly' | 'negotiable';
  skills?: string[];
  deliveryDays?: number;
  revisions?: number;
  images?: string[];
}

export interface OfferFilter {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  pricingType?: 'fixed' | 'hourly' | 'negotiable';
  skills?: string[];
  status?: OfferStatus;
  providerId?: string;
  sortBy?: 'createdAt' | 'price' | 'popularity' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
