/**
 * Mock data generators for service fallbacks
 * Provides realistic mock data when backend is unavailable
 */

import type { Deal, DealMilestone, DealTimelineEvent } from './dealService';
import type { Proposal } from './proposalService';
import type { AiRecommendation, MatchFactor } from './aiService';

// Deal mock data generators
export function generateMockDeals(count: number = 5, filters?: any): Deal[] {
  const deals: Deal[] = [];
  const statuses: Deal['status'][] = ['created', 'funded', 'submitted', 'released', 'under_review'];
  
  for (let i = 0; i < count; i++) {
    deals.push(generateMockDeal(`deal-${i}`, undefined, statuses[i % statuses.length]));
  }
  
  return deals;
}

export function generateMockDeal(
  id: string = 'deal-1',
  input?: any,
  status: Deal['status'] = 'created'
): Deal {
  const now = new Date().toISOString();
  const amount = input?.amount || 1000 + Math.floor(Math.random() * 9000);
  
  const milestones: DealMilestone[] = [
    {
      id: `milestone-${id}-1`,
      title: 'Initial Setup',
      description: 'Project setup and requirements gathering',
      amount: amount * 0.3,
      status: status === 'created' ? 'pending' : 'completed',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: status !== 'created' ? now : undefined,
    },
    {
      id: `milestone-${id}-2`,
      title: 'Development',
      description: 'Core development work',
      amount: amount * 0.5,
      status: status === 'created' || status === 'funded' ? 'pending' : 'in_progress',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `milestone-${id}-3`,
      title: 'Final Delivery',
      description: 'Final delivery and review',
      amount: amount * 0.2,
      status: 'pending',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const timeline: DealTimelineEvent[] = [
    {
      id: `event-${id}-1`,
      type: 'status_change',
      title: 'Deal Created',
      description: 'Deal was created successfully',
      status: 'created',
      userId: 'user-1',
      userName: 'John Doe',
      createdAt: now,
      updatedAt: now,
    },
  ];

  if (status !== 'created') {
    timeline.push({
      id: `event-${id}-2`,
      type: 'payment',
      title: 'Deal Funded',
      description: `Client funded $${amount}`,
      amount,
      userId: 'user-1',
      userName: 'John Doe',
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    id,
    offerId: input?.offerId || `offer-${id}`,
    requestId: input?.requestId,
    proposalId: input?.proposalId,
    providerId: input?.providerId || 'provider-1',
    clientId: input?.clientId || 'client-1',
    status,
    title: input?.title || `Deal ${id}`,
    description: input?.description || 'Mock deal description for testing purposes',
    amount,
    currency: input?.currency || 'USD',
    fundedAmount: status === 'created' ? 0 : amount,
    releasedAmount: status === 'released' ? amount : 0,
    serviceFee: amount * 0.05,
    milestones,
    attachments: [],
    views: Math.floor(Math.random() * 100),
    provider: {
      id: 'provider-1',
      displayName: 'Jane Smith',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider',
      trustScore: 85,
      completedDeals: 12,
      averageRating: 4.5,
    },
    client: {
      id: 'client-1',
      displayName: 'John Doe',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=client',
      trustScore: 92,
      completedDeals: 8,
      averageRating: 4.8,
    },
    timeline,
    createdAt: now,
    updatedAt: now,
  };
}

// Proposal mock data generators
export function generateMockProposals(count: number = 5): Proposal[] {
  const proposals: Proposal[] = [];
  const statuses: Proposal['status'][] = ['pending', 'accepted', 'rejected', 'expired'];
  
  for (let i = 0; i < count; i++) {
    proposals.push(generateMockProposal(`proposal-${i}`, statuses[i % statuses.length]));
  }
  
  return proposals;
}

export function generateMockProposal(
  id: string = 'proposal-1',
  status: Proposal['status'] = 'pending'
): Proposal {
  const now = new Date().toISOString();
  const amount = 500 + Math.floor(Math.random() * 4500);
  
  return {
    id,
    requestId: `request-${id}`,
    offerId: `offer-${id}`,
    providerId: 'provider-1',
    clientId: 'client-1',
    status,
    title: `Proposal for Project ${id}`,
    message: 'I would love to work on this project. I have extensive experience in this area and can deliver high-quality results.',
    proposedAmount: amount,
    currency: 'USD',
    estimatedDeliveryDays: 7 + Math.floor(Math.random() * 14),
    revisions: 3,
    attachments: [],
    provider: {
      id: 'provider-1',
      displayName: 'Jane Smith',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider',
      trustScore: 85,
    },
    request: {
      id: `request-${id}`,
      title: `Request ${id}`,
      description: 'Looking for a skilled professional to help with this project.',
    },
    offer: {
      id: `offer-${id}`,
      title: `Service Offer ${id}`,
      description: 'Professional services offered at competitive rates.',
    },
    createdAt: now,
    updatedAt: now,
  };
}

// AI mock data generators
export function generateMockRecommendations(count: number = 5): AiRecommendation[] {
  const recommendations: AiRecommendation[] = [];
  const types: AiRecommendation['type'][] = ['offer', 'user', 'request'];
  
  for (let i = 0; i < count; i++) {
    recommendations.push(generateMockRecommendation(`rec-${i}`, types[i % types.length]));
  }
  
  return recommendations;
}

export function generateMockRecommendation(
  id: string = 'rec-1',
  type: AiRecommendation['type'] = 'offer'
): AiRecommendation {
  const matchFactors: MatchFactor[] = [
    {
      name: 'Skills Match',
      weight: 0.4,
      score: 85 + Math.floor(Math.random() * 15),
      reason: 'Strong alignment with your skills',
    },
    {
      name: 'Availability',
      weight: 0.3,
      score: 90 + Math.floor(Math.random() * 10),
      reason: 'Provider is available now',
    },
    {
      name: 'Trust Score',
      weight: 0.3,
      score: 80 + Math.floor(Math.random() * 20),
      reason: 'Highly rated provider',
    },
  ];
  
  const totalScore = Math.round(
    matchFactors.reduce((acc, factor) => acc + factor.score * factor.weight, 0)
  );
  
  const titles = {
    offer: ['Web Development', 'Logo Design', 'Content Writing', 'SEO Optimization', 'Mobile App'],
    user: ['Expert Developer', 'Creative Designer', 'Content Strategist', 'Marketing Pro', 'AI Specialist'],
    request: ['Website needed', 'Design project', 'Content creation', 'SEO help', 'App development'],
  };
  
  const title = titles[type][Math.floor(Math.random() * titles[type].length)];
  
  return {
    id,
    type,
    title,
    description: `AI-matched ${type} based on your profile and preferences`,
    score: totalScore,
    reason: `Strong ${matchFactors[0].name.toLowerCase()} (${matchFactors[0].score}%)`,
    matchFactors,
    entityId: `${type}-${id}`,
    entity: null,
    tags: ['ai-matched', type, 'recommended'],
    price: 100 + Math.floor(Math.random() * 900),
    currency: 'USD',
    deliveryTime: 1 + Math.floor(Math.random() * 30),
  };
}

export function generateMockPriceSuggestion() {
  const basePrice = 500 + Math.floor(Math.random() * 4500);
  return {
    suggested_price: basePrice,
    floor_price: Math.round(basePrice * 0.7),
    ceiling_price: Math.round(basePrice * 1.5),
    reasoning: [
      'Based on market analysis of similar services',
      'Accounts for your experience level',
      'Considers current demand in this category',
      'Includes competitive positioning analysis',
    ],
  };
}

export function generateMockSupportResponse(message: string) {
  const categories = ['pricing', 'trust', 'deals', 'account', 'technical'];
  const priorities = ['low', 'medium', 'high'];
  
  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    answer: `I understand you're asking about: "${message.substring(0, 50)}...". Based on your query, I recommend checking our documentation or contacting support for more specific assistance.`,
    confidence: 70 + Math.floor(Math.random() * 30),
    escalationRequired: message.toLowerCase().includes('urgent') || message.toLowerCase().includes('help'),
  };
}
