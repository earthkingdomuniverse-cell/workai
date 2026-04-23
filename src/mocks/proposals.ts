import { Proposal } from '../types/proposal';

export const mockProposals: Proposal[] = [
  {
    id: 'proposal_1',
    requestId: 'request_1',
    providerId: 'user_1',
    clientId: 'user_2',
    status: 'pending',
    title: 'Complete E-commerce Solution',
    message:
      'I will build a complete e-commerce platform with all the features you need including payment integration, inventory management, and admin dashboard. I have 5+ years of experience in this field.',
    proposedAmount: 12000,
    currency: 'USD',
    estimatedDeliveryDays: 90,
    revisions: 3,
    views: 45,
    likedByClient: false,
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
  },
  {
    id: 'proposal_2',
    offerId: 'offer_2',
    providerId: 'user_2',
    clientId: 'user_1',
    status: 'accepted',
    title: 'Modern UI/UX Design',
    message:
      'I will create a beautiful and intuitive design for your mobile app. My designs are user-centered and follow best practices for mobile UX.',
    proposedAmount: 3500,
    currency: 'USD',
    estimatedDeliveryDays: 14,
    revisions: 5,
    views: 32,
    likedByClient: true,
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
  {
    id: 'proposal_3',
    requestId: 'request_3',
    providerId: 'user_1',
    clientId: 'user_2',
    status: 'pending',
    title: 'Comprehensive Data Analysis',
    message:
      'I will analyze your marketing data and provide actionable insights. I specialize in marketing analytics and have helped many businesses optimize their campaigns.',
    proposedAmount: 1500,
    currency: 'USD',
    estimatedDeliveryDays: 7,
    revisions: 2,
    views: 28,
    likedByClient: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'proposal_4',
    requestId: 'request_1',
    providerId: 'user_3',
    clientId: 'user_2',
    status: 'rejected',
    title: 'Budget E-commerce Solution',
    message:
      'I can build a cost-effective e-commerce solution using pre-built templates and basic customization.',
    proposedAmount: 5000,
    currency: 'USD',
    estimatedDeliveryDays: 45,
    revisions: 1,
    views: 15,
    likedByClient: false,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'proposal_5',
    offerId: 'offer_1',
    providerId: 'user_4',
    clientId: 'user_1',
    status: 'pending',
    title: 'Premium Web Development',
    message:
      'I will deliver a high-quality, scalable web application using modern technologies and best practices.',
    proposedAmount: 8000,
    currency: 'USD',
    estimatedDeliveryDays: 60,
    revisions: 4,
    views: 52,
    likedByClient: false,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

export function getProposalById(id: string): Proposal | undefined {
  return mockProposals.find((p) => p.id === id);
}

export function getProposalsByProviderId(providerId: string): Proposal[] {
  return mockProposals.filter((p) => p.providerId === providerId);
}

export function getProposalsByClientId(clientId: string): Proposal[] {
  return mockProposals.filter((p) => p.clientId === clientId);
}

export function getProposalsByRequestId(requestId: string): Proposal[] {
  return mockProposals.filter((p) => p.requestId === requestId);
}

export function getProposalsByOfferId(offerId: string): Proposal[] {
  return mockProposals.filter((p) => p.offerId === offerId);
}

export function createProposal(
  proposalData: Partial<Proposal> & {
    providerId: string;
    clientId: string;
    title: string;
    message: string;
    proposedAmount: number;
    estimatedDeliveryDays: number;
  },
): Proposal {
  const proposal: Proposal = {
    id: `proposal_${Date.now()}`,
    providerId: proposalData.providerId,
    clientId: proposalData.clientId,
    requestId: proposalData.requestId,
    offerId: proposalData.offerId,
    status: 'pending',
    title: proposalData.title,
    message: proposalData.message,
    proposedAmount: proposalData.proposedAmount,
    currency: proposalData.currency || 'USD',
    estimatedDeliveryDays: proposalData.estimatedDeliveryDays,
    revisions: proposalData.revisions,
    views: 0,
    likedByClient: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProposals.push(proposal);
  return proposal;
}
