import { Offer } from '../types/offer';

export const mockOffers: Offer[] = [
  {
    id: 'offer_1',
    providerId: 'user_1',
    title: 'Full-stack React dashboard development',
    description: 'I will build a production-ready React and Node.js dashboard with clean API integration.',
    category: 'Software Development',
    price: 3500,
    currency: 'USD',
    pricingType: 'fixed',
    status: 'active',
    skills: ['React', 'TypeScript', 'Node.js', 'API Integration'],
    deliveryTime: 21,
    revisions: 2,
    views: 420,
    likes: 38,
    proposalsCount: 7,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
  },
  {
    id: 'offer_2',
    providerId: 'user_2',
    title: 'Mobile app UI and UX design',
    description: 'I will design polished mobile app screens, user flows, and a reusable Figma component system.',
    category: 'Design',
    price: 1800,
    currency: 'USD',
    pricingType: 'fixed',
    status: 'active',
    skills: ['Figma', 'Mobile Design', 'UI/UX'],
    deliveryTime: 14,
    revisions: 3,
    views: 260,
    likes: 21,
    proposalsCount: 5,
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-09T10:00:00Z',
  },
  {
    id: 'offer_3',
    providerId: 'user_3',
    title: 'Marketing analytics and data visualization',
    description: 'I will analyze marketing data and create executive-ready reports and dashboards.',
    category: 'Data Science',
    price: 1200,
    currency: 'USD',
    pricingType: 'fixed',
    status: 'active',
    skills: ['Data Analysis', 'Google Analytics', 'Excel', 'Data Visualization'],
    deliveryTime: 7,
    revisions: 1,
    views: 180,
    likes: 14,
    proposalsCount: 3,
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
  },
];

export function getOfferById(id: string): Offer | undefined {
  return mockOffers.find((offer) => offer.id === id);
}

export function getOffersByProviderId(providerId: string): Offer[] {
  return mockOffers.filter((offer) => offer.providerId === providerId);
}
