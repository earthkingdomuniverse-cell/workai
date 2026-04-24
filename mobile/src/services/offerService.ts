import { ENABLE_MOCK_MODE } from '../constants/config';
import { apiClient } from './apiClient';

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  pricingType: 'fixed' | 'hourly' | 'negotiable';
  status?: 'active' | 'inactive' | 'archived' | 'completed';
  skills?: string[];
  deliveryTime?: number;
  views?: number;
  likes?: number;
  proposalsCount?: number;
  providerId?: string;
  provider?: {
    id?: string;
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
    verificationLevel?: 'unverified' | 'basic' | 'verified' | 'premium_verified';
    completedDeals?: number;
  };
}

export interface OfferPayload {
  title: string;
  description: string;
  price: number;
  currency?: string;
  pricingType?: 'fixed' | 'hourly' | 'negotiable';
  deliveryTime?: number;
  skills?: string[];
}

const mockOffers: Offer[] = [
  {
    id: 'offer_1',
    title: 'AI-Powered Web Application Development',
    description:
      'Build modern, scalable web applications with AI integration. Specializing in React, Node.js, and machine learning solutions.',
    price: 5000,
    currency: 'USD',
    pricingType: 'fixed',
    status: 'active',
    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
    deliveryTime: 14,
    views: 245,
    likes: 18,
    proposalsCount: 12,
    providerId: 'user_1',
    provider: { displayName: 'John Doe', trustScore: 92 },
  },
  {
    id: 'offer_2',
    title: 'UI/UX Design for Mobile Apps',
    description:
      'Create beautiful, intuitive user interfaces for iOS and Android apps. Full design process from wireframes to final assets.',
    price: 150,
    currency: 'USD',
    pricingType: 'hourly',
    status: 'inactive',
    skills: ['Figma', 'Adobe Creative Suite', 'UI/UX'],
    deliveryTime: 10,
    views: 189,
    likes: 24,
    proposalsCount: 8,
    providerId: 'user_1',
    provider: { displayName: 'Jane Smith', trustScore: 88 },
  },
];

class OfferService {
  async getOffers(filters?: { q?: string; pricingType?: string }): Promise<Offer[]> {
    if (ENABLE_MOCK_MODE) {
      let items = [...mockOffers];
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
        );
      }
      if (filters?.pricingType && filters.pricingType !== 'all') {
        items = items.filter((item) => item.pricingType === filters.pricingType);
      }
      return items;
    }

    try {
      const params = new URLSearchParams();
      if (filters?.q) params.append('q', filters.q);
      if (filters?.pricingType) params.append('pricingType', filters.pricingType);
      const query = params.toString();
      const response = await apiClient.get<{ data: { items: Offer[] } }>(
        query ? `/offers?${query}` : '/offers',
      );
      return response.data.items;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      let items = [...mockOffers];
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
        );
      }
      if (filters?.pricingType && filters.pricingType !== 'all') {
        items = items.filter((item) => item.pricingType === filters.pricingType);
      }
      return items;
    }
  }

  async getOffer(id: string): Promise<Offer> {
    if (ENABLE_MOCK_MODE) {
      const item = mockOffers.find((offer) => offer.id === id);
      if (!item) throw new Error('Offer not found');
      return item;
    }

    try {
      const response = await apiClient.get<{ data: Offer }>(`/offers/${id}`);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const item = mockOffers.find((offer) => offer.id === id);
      if (!item) throw new Error('Offer not found');
      return item;
    }
  }

  async getMyOffers(): Promise<Offer[]> {
    if (ENABLE_MOCK_MODE) {
      return mockOffers.filter((item) => item.providerId === 'user_1');
    }

    try {
      const response = await apiClient.get<{ data: { items: Offer[] } }>('/offers/mine');
      return response.data.items;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      return mockOffers.filter((item) => item.providerId === 'user_1');
    }
  }

  async createOffer(payload: OfferPayload): Promise<Offer> {
    if (ENABLE_MOCK_MODE) {
      const offer: Offer = {
        id: `offer_${Date.now()}`,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        currency: payload.currency || 'USD',
        pricingType: payload.pricingType || 'fixed',
        deliveryTime: payload.deliveryTime,
        skills: payload.skills || [],
        status: 'active',
        providerId: 'user_1',
        provider: { displayName: 'Mock User', trustScore: 80 },
        views: 0,
        likes: 0,
        proposalsCount: 0,
      };
      mockOffers.unshift(offer);
      return offer;
    }

    try {
      const response = await apiClient.post<{ data: Offer }>('/offers', payload);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const offer: Offer = {
        id: `offer_${Date.now()}`,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        currency: payload.currency || 'USD',
        pricingType: payload.pricingType || 'fixed',
        deliveryTime: payload.deliveryTime,
        skills: payload.skills || [],
        status: 'active',
        providerId: 'user_1',
        provider: { displayName: 'Mock User', trustScore: 80 },
        views: 0,
        likes: 0,
        proposalsCount: 0,
      };
      mockOffers.unshift(offer);
      return offer;
    }
  }

  async updateOffer(
    id: string,
    payload: Partial<OfferPayload> & { status?: Offer['status'] },
  ): Promise<Offer> {
    if (ENABLE_MOCK_MODE) {
      const index = mockOffers.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Offer not found');
      mockOffers[index] = {
        ...mockOffers[index],
        ...payload,
      } as Offer;
      return mockOffers[index];
    }

    try {
      const response = await apiClient.patch<{ data: Offer }>(`/offers/${id}`, payload);
      return response.data;
    } catch (error) {
      if (!ENABLE_MOCK_MODE) throw error;
      const index = mockOffers.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Offer not found');
      mockOffers[index] = {
        ...mockOffers[index],
        ...payload,
      } as Offer;
      return mockOffers[index];
    }
  }

  async deleteOffer(id: string): Promise<void> {
    if (ENABLE_MOCK_MODE) {
      const index = mockOffers.findIndex((item) => item.id === id);
      if (index >= 0) mockOffers.splice(index, 1);
      return;
    }

    const index = mockOffers.findIndex((item) => item.id === id);
    if (index >= 0) mockOffers.splice(index, 1);
  }
}

export const offerService = new OfferService();
