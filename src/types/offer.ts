import { OfferStatus, Currency, Timestamps } from './common';

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
  availability?: {
    available: boolean;
    startDate?: string;
    endDate?: string;
    hoursPerWeek?: number;
  };
  skills?: string[];
  images?: string[];
  deliveryTime?: number; // in days
  revisions?: number;
  views: number;
  likes: number;
  proposalsCount: number;
}

export interface OfferInput {
  title: string;
  description: string;
  category?: string;
  price: number;
  currency?: Currency;
  pricingType?: 'fixed' | 'hourly' | 'negotiable';
  skills?: string[];
  availability?: {
    available: boolean;
    startDate?: string;
    endDate?: string;
    hoursPerWeek?: number;
  };
  deliveryTime?: number;
  revisions?: number;
}

export interface OfferFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  pricingType?: 'fixed' | 'hourly' | 'negotiable';
  skills?: string[];
  status?: OfferStatus;
  sortBy?: 'createdAt' | 'price' | 'popularity' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}
