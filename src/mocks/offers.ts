import { Offer } from '../types/offer';

export const mockOffers: Offer[] = [
  {
    id: 'offer_1',
    providerId: 'user_1',
    title: 'AI-Powered Web Application Development',
    description:
      'Build modern, scalable web applications with AI integration. Specializing in React, Node.js, and machine learning solutions.',
    category: 'Software Development',
    price: 5000,
    currency: 'USD',
    pricingType: 'fixed',
    status: 'active',
    availability: {
      available: true,
      hoursPerWeek: 40,
    },
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
    deliveryTime: 14,
    revisions: 3,
    views: 245,
    likes: 18,
    proposalsCount: 12,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'offer_2',
    providerId: 'user_2',
    title: 'UI/UX Design for Mobile Apps',
    description:
      'Create beautiful, intuitive user interfaces for iOS and Android apps. Full design process from wireframes to final assets.',
    category: 'Design',
    price: 3000,
    currency: 'USD',
    pricingType: 'fixed',
    status: 'active',
    availability: {
      available: true,
      hoursPerWeek: 30,
    },
    skills: ['Figma', 'Adobe Creative Suite', 'UI/UX', 'Mobile Design'],
    deliveryTime: 10,
    revisions: 5,
    views: 189,
    likes: 24,
    proposalsCount: 8,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'offer_3',
    providerId: 'user_1',
    title: 'Python Data Analysis & Visualization',
    description:
      'Transform your data into actionable insights with Python, pandas, and modern visualization tools.',
    category: 'Data Science',
    price: 150,
    currency: 'USD',
    pricingType: 'hourly',
    status: 'active',
    availability: {
      available: true,
      hoursPerWeek: 20,
    },
    skills: ['Python', 'Data Analysis', 'Pandas', 'Matplotlib', 'Jupyter'],
    deliveryTime: 7,
    revisions: 2,
    views: 156,
    likes: 15,
    proposalsCount: 6,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
];

export function getOfferById(id: string): Offer | undefined {
  return mockOffers.find((o) => o.id === id);
}

export function getOffersByProviderId(providerId: string): Offer[] {
  return mockOffers.filter((o) => o.providerId === providerId);
}

export function createOffer(
  offerData: Partial<Offer> & {
    providerId: string;
    title: string;
    description: string;
    price: number;
  },
): Offer {
  const offer: Offer = {
    id: `offer_${Date.now()}`,
    providerId: offerData.providerId,
    title: offerData.title,
    description: offerData.description,
    category: offerData.category,
    price: offerData.price,
    currency: offerData.currency || 'USD',
    pricingType: offerData.pricingType || 'fixed',
    status: offerData.status || 'active',
    views: 0,
    likes: 0,
    proposalsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockOffers.push(offer);
  return offer;
}
